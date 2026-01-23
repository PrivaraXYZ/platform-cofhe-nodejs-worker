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
import { WorkerConfig } from '../config/worker.config';

interface WorkerResult {
  type: string;
  data: string;
  securityZone: number;
  utype: number;
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
    return this.executeEncryption(input.type, input.value, input.userAddress);
  }

  async encryptBatch(
    inputs: EncryptionInput[],
  ): Promise<Result<EncryptionResult[], FheDomainError>> {
    if (!this.pool) {
      return Err(new FhevmNotInitializedError());
    }

    const userAddress = inputs[0]?.userAddress;
    if (!userAddress) {
      return Err(new EncryptionError('batch', 'userAddress is required for encryption'));
    }

    try {
      const tasks = inputs.map((input) => ({
        type: input.type,
        value: this.normalizeValue(input.type, input.value),
      }));

      const results = await Promise.race([
        this.pool.run(
          { items: tasks, userAddress, config: this.workerTaskConfig },
          { name: 'encryptBatch' },
        ) as Promise<WorkerResult[]>,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new EncryptionTimeoutError(this.workerConfig.taskTimeout)),
            this.workerConfig.taskTimeout,
          ),
        ),
      ]);

      const encryptionResults: EncryptionResult[] = results.map((result) => ({
        encryptedValue: EncryptedValue.create(
          result.type,
          result.data,
          result.securityZone,
          result.utype,
          result.inputProof,
        ),
        encryptionTimeMs: result.encryptionTimeMs,
      }));

      return Ok(encryptionResults);
    } catch (error) {
      return this.handleError(error, 'batch');
    }
  }

  async encryptUint8(
    value: number,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT8, value, userAddress);
  }

  async encryptUint16(
    value: number,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT16, value, userAddress);
  }

  async encryptUint32(
    value: bigint | number,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT32, value, userAddress);
  }

  async encryptUint64(
    value: bigint,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT64, value, userAddress);
  }

  async encryptUint128(
    value: bigint,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT128, value, userAddress);
  }

  async encryptUint256(
    value: bigint,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.UINT256, value, userAddress);
  }

  async encryptAddress(
    address: string,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.ADDRESS, address, userAddress);
  }

  async encryptBool(
    value: boolean,
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    return this.executeEncryption(EncryptionTypeValue.BOOL, value, userAddress);
  }

  private normalizeValue(
    type: EncryptionTypeValue,
    value: string | number | boolean | bigint,
  ): string | number | boolean {
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
    userAddress: string,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    if (!this.pool) {
      return Err(new FhevmNotInitializedError());
    }

    if (!userAddress) {
      return Err(new EncryptionError(type, 'userAddress is required for encryption'));
    }

    try {
      const normalizedValue = this.normalizeValue(type, value);

      const result = await Promise.race([
        this.pool.run(
          { type, value: normalizedValue, userAddress, config: this.workerTaskConfig },
          { name: 'encrypt' },
        ) as Promise<WorkerResult>,
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
        result.securityZone,
        result.utype,
        result.inputProof,
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
