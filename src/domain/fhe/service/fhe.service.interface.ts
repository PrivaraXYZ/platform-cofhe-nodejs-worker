import { Result } from '@domain/common/result';
import { EncryptedValue } from '../value-object/encrypted-value';
import { CoFheConfig } from '../model/fhe-config';
import { FheDomainError } from '../error/fhe.error';
import { EncryptionTypeValue } from '../value-object/encryption-type';

export interface EncryptionResult {
  encryptedValue: EncryptedValue;
  encryptionTimeMs: number;
}

export interface EncryptionInput {
  type: EncryptionTypeValue;
  value: string | number | boolean | bigint;
  contractAddress?: string;
  userAddress?: string;
}

export interface IFheService {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  getConfig(): CoFheConfig;

  encrypt(input: EncryptionInput): Promise<Result<EncryptionResult, FheDomainError>>;

  encryptBatch(inputs: EncryptionInput[]): Promise<Result<EncryptionResult[], FheDomainError>>;

  encryptUint8(
    value: number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptUint16(
    value: number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptUint32(
    value: bigint | number,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptUint64(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptUint128(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptUint256(
    value: bigint,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptAddress(
    address: string,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
  encryptBool(
    value: boolean,
    contractAddress?: string,
    userAddress?: string,
  ): Promise<Result<EncryptionResult, FheDomainError>>;
}

export const FHE_SERVICE = Symbol('IFheService');
