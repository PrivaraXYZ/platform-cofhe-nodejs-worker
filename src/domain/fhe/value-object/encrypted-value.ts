import { EncryptionType, EncryptionTypeValue } from './encryption-type';

export interface EncryptedValueJson {
  type: string;
  data: string;
  securityZone: number;
  utype: number;
  inputProof: string;
}

export class EncryptedValue {
  private constructor(
    public readonly type: EncryptionType,
    public readonly data: string,
    public readonly securityZone: number,
    public readonly utype: number,
    public readonly inputProof: string,
  ) {}

  static create(
    type: EncryptionTypeValue | string,
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    const encType = EncryptionType.fromString(type);
    if (!encType.ok) {
      throw new Error(`Invalid encryption type: ${type}`);
    }
    return new EncryptedValue(
      encType.value,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint8(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT8,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint16(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT16,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint32(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT32,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint64(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT64,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint128(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT128,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createUint256(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.UINT256,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createAddress(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.ADDRESS,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  static createBool(
    data: string,
    securityZone: number,
    utype: number,
    inputProof: string,
  ): EncryptedValue {
    return new EncryptedValue(
      EncryptionType.BOOL,
      EncryptedValue.normalizeHex(data),
      securityZone,
      utype,
      EncryptedValue.normalizeHex(inputProof),
    );
  }

  toJSON(): EncryptedValueJson {
    return {
      type: this.type.toString(),
      data: this.data,
      securityZone: this.securityZone,
      utype: this.utype,
      inputProof: this.inputProof,
    };
  }

  private static normalizeHex(hex: string): string {
    const normalized = hex.toLowerCase();
    return normalized.startsWith('0x') ? normalized : `0x${normalized}`;
  }
}
