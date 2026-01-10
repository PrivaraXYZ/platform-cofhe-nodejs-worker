import { EncryptionType, EncryptionTypeValue } from './encryption-type';
import { EthereumAddress } from './ethereum-address';

export interface EncryptedValueJson {
  type: string;
  data: string;
  inputProof: string;
  contractAddress?: string;
  userAddress?: string;
}

export class EncryptedValue {
  private constructor(
    public readonly type: EncryptionType,
    public readonly data: string,
    public readonly inputProof: string,
    public readonly contractAddress?: EthereumAddress,
    public readonly userAddress?: EthereumAddress,
  ) {}

  static create(
    type: EncryptionTypeValue | string,
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    const encType = EncryptionType.fromString(type);
    if (!encType.ok) {
      throw new Error(`Invalid encryption type: ${type}`);
    }
    return new EncryptedValue(
      encType.value,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint8(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT8,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint16(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT16,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint32(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT32,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint64(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT64,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint128(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT128,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createUint256(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT256,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createAddress(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.ADDRESS,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  static createBool(
    data: string,
    inputProof: string,
    contractAddress?: EthereumAddress,
    userAddress?: EthereumAddress,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.BOOL,
      EncryptedValue.normalizeHex(data),
      EncryptedValue.normalizeHex(inputProof),
      contractAddress,
      userAddress,
    );
  }

  isForContract(address: EthereumAddress): boolean {
    return this.contractAddress?.equals(address) ?? false;
  }

  isForUser(address: EthereumAddress): boolean {
    return this.userAddress?.equals(address) ?? false;
  }

  toJSON(): EncryptedValueJson {
    return {
      type: this.type.toString(),
      data: this.data,
      inputProof: this.inputProof,
      contractAddress: this.contractAddress?.toString(),
      userAddress: this.userAddress?.toString(),
    };
  }

  private static normalizeHex(hex: string): string {
    const normalized = hex.toLowerCase();
    return normalized.startsWith('0x') ? normalized : `0x${normalized}`;
  }
}
