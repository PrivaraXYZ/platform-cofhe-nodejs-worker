import { Result, Ok, Err } from '@domain/common/result';
import { UnsupportedEncryptionTypeError } from '../error/fhe.error';

export enum EncryptionTypeValue {
  UINT8 = 'euint8',
  UINT16 = 'euint16',
  UINT32 = 'euint32',
  UINT64 = 'euint64',
  UINT128 = 'euint128',
  UINT256 = 'euint256',
  ADDRESS = 'eaddress',
  BOOL = 'ebool',
}

const SUPPORTED_TYPES = new Set(Object.values(EncryptionTypeValue));

export class EncryptionType {
  static readonly UINT8 = new EncryptionType(EncryptionTypeValue.UINT8);
  static readonly UINT16 = new EncryptionType(EncryptionTypeValue.UINT16);
  static readonly UINT32 = new EncryptionType(EncryptionTypeValue.UINT32);
  static readonly UINT64 = new EncryptionType(EncryptionTypeValue.UINT64);
  static readonly UINT128 = new EncryptionType(EncryptionTypeValue.UINT128);
  static readonly UINT256 = new EncryptionType(EncryptionTypeValue.UINT256);
  static readonly ADDRESS = new EncryptionType(EncryptionTypeValue.ADDRESS);
  static readonly BOOL = new EncryptionType(EncryptionTypeValue.BOOL);

  private constructor(private readonly value: EncryptionTypeValue) {}

  static fromString(type: string): Result<EncryptionType, UnsupportedEncryptionTypeError> {
    if (!SUPPORTED_TYPES.has(type as EncryptionTypeValue)) {
      return Err(new UnsupportedEncryptionTypeError(type));
    }
    return Ok(new EncryptionType(type as EncryptionTypeValue));
  }

  static values(): EncryptionType[] {
    return [
      EncryptionType.UINT8,
      EncryptionType.UINT16,
      EncryptionType.UINT32,
      EncryptionType.UINT64,
      EncryptionType.UINT128,
      EncryptionType.UINT256,
      EncryptionType.ADDRESS,
      EncryptionType.BOOL,
    ];
  }

  toString(): string {
    return this.value;
  }

  equals(other: EncryptionType): boolean {
    return this.value === other.value;
  }

  isUint8(): boolean {
    return this.value === EncryptionTypeValue.UINT8;
  }

  isUint16(): boolean {
    return this.value === EncryptionTypeValue.UINT16;
  }

  isUint32(): boolean {
    return this.value === EncryptionTypeValue.UINT32;
  }

  isUint64(): boolean {
    return this.value === EncryptionTypeValue.UINT64;
  }

  isUint128(): boolean {
    return this.value === EncryptionTypeValue.UINT128;
  }

  isUint256(): boolean {
    return this.value === EncryptionTypeValue.UINT256;
  }

  isAddress(): boolean {
    return this.value === EncryptionTypeValue.ADDRESS;
  }

  isBool(): boolean {
    return this.value === EncryptionTypeValue.BOOL;
  }
}
