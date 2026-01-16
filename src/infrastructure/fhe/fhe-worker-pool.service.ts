import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { Piscina } from 'piscina';
import { Result, Ok, Err } from '@domain/common/result';
import {
  IFheService,
  EncryptionResult,
  EncryptionInput,
} from '@domain/fhe/service/fhe.service.interface';
import { CoFheConfig } from '@domain/fhe/model/fhe-config';
import { EncryptionTypeValue } from '@domain/fhe/value-object/encryption-type';
import {
  FheDomainError,
  FhevmNotInitializedError,
  FhevmInitializationError,
  EncryptionError,
  EncryptionTimeoutError,
  WorkerPoolExhaustedError,
  UnsupportedEncryptionTypeError,
} from '@domain/fhe/error/fhe.error';
import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';
import { WorkerConfig } from '../config/worker.config';

interface WorkerResult {
  type: string;
  data: string;
  inputProof: string;
  encryptionTimeMs: number;
}

interface WorkerTaskConfig {
  rpcUrl: string;
  chainId: number;
  environment: 'mock' | 'testnet';
}

@Injectable()
export class FheWorkerPoolService implements IFheService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FheWorkerPoolService.name);
  private pool: Piscina | null = null;
  private readonly cofheConfig: CoFheConfig;
  private readonly workerConfig: WorkerConfig;
  private readonly workerTaskConfig: WorkerTaskConfig;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    const cofheConfig = this.configService.get<CoFheConfig>('cofhe');
    const workerConfig = this.configService.get<WorkerConfig>('worker');

    if (!cofheConfig) {
      throw new Error('CoFHE configuration is missing. Check your environment variables.');
    }
    if (!workerConfig) {
      throw new Error('Worker configuration is missing. Check your environment variables.');
    }

    this.cofheConfig = cofheConfig;
    this.workerConfig = workerConfig;
    this.workerTaskConfig = {
      rpcUrl: cofheConfig.network.rpcUrl,
      chainId: cofheConfig.network.chainId,
      environment: cofheConfig.network.environment,
    };
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      this.logger.log('Shutting down worker pool...');
      await this.pool.destroy();
      this.pool = null;
      this.initialized = false;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.log('Initializing CoFHE worker pool...', {
      minThreads: this.workerConfig.minThreads,
      maxThreads: this.workerConfig.maxThreads,
      network: this.cofheConfig.network.networkName,
    });

    try {
      this.pool = new Piscina({
        filename: resolve(__dirname, 'workers/fhe.worker.js'),
        minThreads: this.workerConfig.minThreads,
        maxThreads: this.workerConfig.maxThreads,
        idleTimeout: this.workerConfig.idleTimeout,
        maxQueue: this.workerConfig.maxQueue,
      });

      this.initialized = true;
      this.logger.log('CoFHE worker pool initialized successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to initialize worker pool', err.stack);
      throw new FhevmInitializationError(err.message, err);
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.pool !== null;
  }

  getConfig(): CoFheConfig {
    return this.cofheConfig;
  }

  async encrypt(input: EncryptionInput): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(input.type, input.value, input.contractAddress, input.userAddress);
  }

  async encryptBatch(inputs: EncryptionInput[]): Promise<Result<EncryptionResult[], FheDomainError>> {
    if (!this.pool) {
      return Err(new FhevmNotInitializedError());
    }

    try {
      const tasks = inputs.map((input) => ({
        type: input.type,
        value: this.normalizeValue(input.type, input.value),
      }));

      const results = await Promise.race([
        this.pool.run(
          { items: tasks, config: this.workerTaskConfig },
          { name: 'encryptBatch' },
        ) as Promise<WorkerResult[]>,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new EncryptionTimeoutError(this.workerConfig.taskTimeout)),
            this.workerConfig.taskTimeout,
          ),
        ),
      ]);

      const encryptionResults: EncryptionResult[] = results.map((result, index) => {
        const input = inputs[index];
        let contractAddress: EthereumAddress | undefined;
        let userAddress: EthereumAddress | undefined;

        if (input.contractAddress) {
          const contractResult = EthereumAddress.createContract(input.contractAddress);
          if (contractResult.ok) {
            contractAddress = contractResult.value;
          }
        }

        if (input.userAddress) {
          const userResult = EthereumAddress.createUser(input.userAddress);
          if (userResult.ok) {
            userAddress = userResult.value;
          }
        }

        return {
          encryptedValue: EncryptedValue.create(
            result.type,
            result.data,
            result.inputProof,
            contractAddress,
            userAddress,
          ),
          encryptionTimeMs: result.encryptionTimeMs,
        };
      });

      return Ok(encryptionResults);
    } catch (error) {
      return this.handleError(error, 'batch');
    }
  }

  async encryptUint8(
    value: number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT8, value, contractAddress, userAddress);
  }

  async encryptUint16(
    value: number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT16, value, contractAddress, userAddress);
  }

  async encryptUint32(
    value: bigint | number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT32, value, contractAddress, userAddress);
  }

  async encryptUint64(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT64, value, contractAddress, userAddress);
  }

  async encryptUint128(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT128, value, contractAddress, userAddress);
  }

  async encryptUint256(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT256, value, contractAddress, userAddress);
  }

  async encryptAddress(
    address: string,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    const addressResult = EthereumAddress.create(address, 'user');
    if (!addressResult.ok) return addressResult;

    return this.executeEncryption(EncryptionTypeValue.ADDRESS, address, contractAddress, userAddress);
  }

  async encryptBool(
    value: boolean,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.BOOL, value, contractAddress, userAddress);
  }

  private normalizeValue(type: EncryptionTypeValue, value: string | number | boolean | bigint): string | number | boolean {
    switch (type) {
      case EncryptionTypeValue.UINT8:
      case EncryptionTypeValue.UINT16:
        return Number(value);
      case EncryptionTypeValue.UINT32:
      case EncryptionTypeValue.UINT64:
      case EncryptionTypeValue.UINT128:
      case EncryptionTypeValue.UINT256:
        return String(value);
      case EncryptionTypeValue.ADDRESS:
        return String(value);
      case EncryptionTypeValue.BOOL:
        return Boolean(value);
      default:
        return String(value);
    }
  }

  private async executeEncryption(
    type: EncryptionTypeValue,
    value: string | number | boolean | bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    if (!this.pool) {
      return Err(new FhevmNotInitializedError());
    }

    let contractAddr: EthereumAddress | undefined;
    let userAddr: EthereumAddress | undefined;

    if (contractAddress) {
      const contractResult = EthereumAddress.createContract(contractAddress);
      if (!contractResult.ok) return contractResult;
      contractAddr = contractResult.value;
    }

    if (userAddress) {
      const userResult = EthereumAddress.createUser(userAddress);
      if (!userResult.ok) return userResult;
      userAddr = userResult.value;
    }

    try {
      const normalizedValue = this.normalizeValue(type, value);

      const result = await Promise.race([
        this.pool.run({
          type,
          value: normalizedValue,
          config: this.workerTaskConfig,
        }) as Promise<WorkerResult>,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new EncryptionTimeoutError(this.workerConfig.taskTimeout)),
            this.workerConfig.taskTimeout,
          ),
        ),
      ]);

      const encryptedValue = EncryptedValue.create(
        type,
        result.data,
        result.inputProof,
        contractAddr,
        userAddr,
      );

      return Ok({
        encryptedValue,
        encryptionTimeMs: result.encryptionTimeMs,
      });
    } catch (error) {
      return this.handleError(error, type);
    }
  }

  private handleError(error: unknown, type: string): Result<never, FheDomainError> {
    if (error instanceof FheDomainError) {
      return Err(error);
    }

    const err = error instanceof Error ? error : new Error(String(error));

    if (err.message.includes('queue')) {
      return Err(new WorkerPoolExhaustedError());
    }

    if (err.message.includes('Unsupported')) {
      return Err(new UnsupportedEncryptionTypeError(type));
    }

    return Err(new EncryptionError(type, err.message, err));
  }
}
