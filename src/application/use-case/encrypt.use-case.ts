import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, Ok } from '@domain/common/result';
import {
  IFheService,
  FHE_SERVICE,
  EncryptionResult,
} from '@domain/fhe/service/fhe.service.interface';
import { FheDomainError } from '@domain/fhe/error/fhe.error';
import { EncryptionTypeDto } from '../dto/encrypt-request.dto';

export interface EncryptInput {
  type: EncryptionTypeDto;
  value: string | number | boolean;
  contractAddress?: string;
  userAddress?: string;
}

export interface EncryptOutput {
  type: EncryptionTypeDto;
  data: string;
  inputProof: string;
  contractAddress?: string;
  userAddress?: string;
  encryptionTimeMs: number;
}

@Injectable()
export class EncryptUseCase {
  private readonly logger = new Logger(EncryptUseCase.name);

  constructor(@Inject(FHE_SERVICE) private readonly fheService: IFheService) {}

  async execute(input: EncryptInput): Promise<Result<EncryptOutput, FheDomainError>> {
    const contractShort = input.contractAddress
      ? input.contractAddress.slice(0, 10) + '...' + input.contractAddress.slice(-4)
      : 'none';
    this.logger.debug(`Encrypting ${input.type} for contract=${contractShort}`);

    const result = await this.performEncryption(input);

    if (!result.ok) {
      this.logger.warn(`Encryption failed: ${result.error.code} - ${result.error.message}`);
      return result;
    }

    this.logger.debug(`Encrypted ${input.type} in ${result.value.encryptionTimeMs}ms`);

    const encryptedValue = result.value.encryptedValue;

    return Ok({
      type: input.type,
      data: encryptedValue.data,
      inputProof: encryptedValue.inputProof,
      contractAddress: encryptedValue.contractAddress?.toString(),
      userAddress: encryptedValue.userAddress?.toString(),
      encryptionTimeMs: result.value.encryptionTimeMs,
    });
  }

  private async performEncryption(
    input: EncryptInput,
  ): Promise<Result<EncryptionResult, FheDomainError>> {
    const { contractAddress, userAddress } = input;

    switch (input.type) {
      case EncryptionTypeDto.UINT8:
        return this.fheService.encryptUint8(Number(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.UINT16:
        return this.fheService.encryptUint16(Number(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.UINT32:
        return this.fheService.encryptUint32(BigInt(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.UINT64:
        return this.fheService.encryptUint64(BigInt(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.UINT128:
        return this.fheService.encryptUint128(BigInt(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.UINT256:
        return this.fheService.encryptUint256(BigInt(input.value), contractAddress, userAddress);

      case EncryptionTypeDto.ADDRESS:
        return this.fheService.encryptAddress(input.value as string, contractAddress, userAddress);

      case EncryptionTypeDto.BOOL:
        return this.fheService.encryptBool(input.value as boolean, contractAddress, userAddress);
    }
  }
}
