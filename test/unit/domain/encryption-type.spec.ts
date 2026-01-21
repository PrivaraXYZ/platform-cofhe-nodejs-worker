import { EncryptionType } from '@domain/fhe/value-object/encryption-type';
import { UnsupportedEncryptionTypeError } from '@domain/fhe/error/fhe.error';

describe('EncryptionType', () => {
  describe('fromString', () => {
    it('should create UINT8 from euint8', () => {
      const result = EncryptionType.fromString('euint8');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT8.toString());
      }
    });

    it('should create UINT16 from euint16', () => {
      const result = EncryptionType.fromString('euint16');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT16.toString());
      }
    });

    it('should create UINT32 from euint32', () => {
      const result = EncryptionType.fromString('euint32');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT32.toString());
      }
    });

    it('should create UINT64 from euint64', () => {
      const result = EncryptionType.fromString('euint64');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT64.toString());
      }
    });

    it('should create UINT128 from euint128', () => {
      const result = EncryptionType.fromString('euint128');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT128.toString());
      }
    });

    it('should create UINT256 from euint256', () => {
      const result = EncryptionType.fromString('euint256');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.UINT256.toString());
      }
    });

    it('should create ADDRESS from eaddress', () => {
      const result = EncryptionType.fromString('eaddress');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.ADDRESS.toString());
      }
    });

    it('should create BOOL from ebool', () => {
      const result = EncryptionType.fromString('ebool');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe(EncryptionType.BOOL.toString());
      }
    });

    it('should return error for unsupported type', () => {
      const result = EncryptionType.fromString('euint512');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(UnsupportedEncryptionTypeError);
        expect(result.error.message).toContain('euint512');
      }
    });
  });

  describe('toString', () => {
    it('should return euint8 for UINT8', () => {
      expect(EncryptionType.UINT8.toString()).toBe('euint8');
    });

    it('should return euint16 for UINT16', () => {
      expect(EncryptionType.UINT16.toString()).toBe('euint16');
    });

    it('should return euint32 for UINT32', () => {
      expect(EncryptionType.UINT32.toString()).toBe('euint32');
    });

    it('should return euint64 for UINT64', () => {
      expect(EncryptionType.UINT64.toString()).toBe('euint64');
    });

    it('should return euint128 for UINT128', () => {
      expect(EncryptionType.UINT128.toString()).toBe('euint128');
    });

    it('should return euint256 for UINT256', () => {
      expect(EncryptionType.UINT256.toString()).toBe('euint256');
    });

    it('should return eaddress for ADDRESS', () => {
      expect(EncryptionType.ADDRESS.toString()).toBe('eaddress');
    });

    it('should return ebool for BOOL', () => {
      expect(EncryptionType.BOOL.toString()).toBe('ebool');
    });
  });

  describe('values', () => {
    it('should return all encryption types', () => {
      const values = EncryptionType.values();

      expect(values).toHaveLength(8);
      expect(values).toContain(EncryptionType.UINT8);
      expect(values).toContain(EncryptionType.UINT16);
      expect(values).toContain(EncryptionType.UINT32);
      expect(values).toContain(EncryptionType.UINT64);
      expect(values).toContain(EncryptionType.UINT128);
      expect(values).toContain(EncryptionType.UINT256);
      expect(values).toContain(EncryptionType.ADDRESS);
      expect(values).toContain(EncryptionType.BOOL);
    });
  });

  describe('equals', () => {
    it('should return true for same types', () => {
      expect(EncryptionType.UINT8.equals(EncryptionType.UINT8)).toBe(true);
      expect(EncryptionType.UINT16.equals(EncryptionType.UINT16)).toBe(true);
      expect(EncryptionType.UINT32.equals(EncryptionType.UINT32)).toBe(true);
      expect(EncryptionType.UINT64.equals(EncryptionType.UINT64)).toBe(true);
      expect(EncryptionType.UINT128.equals(EncryptionType.UINT128)).toBe(true);
      expect(EncryptionType.UINT256.equals(EncryptionType.UINT256)).toBe(true);
      expect(EncryptionType.ADDRESS.equals(EncryptionType.ADDRESS)).toBe(true);
      expect(EncryptionType.BOOL.equals(EncryptionType.BOOL)).toBe(true);
    });

    it('should return false for different types', () => {
      expect(EncryptionType.UINT64.equals(EncryptionType.ADDRESS)).toBe(false);
      expect(EncryptionType.ADDRESS.equals(EncryptionType.BOOL)).toBe(false);
      expect(EncryptionType.BOOL.equals(EncryptionType.UINT64)).toBe(false);
      expect(EncryptionType.UINT8.equals(EncryptionType.UINT16)).toBe(false);
      expect(EncryptionType.UINT128.equals(EncryptionType.UINT256)).toBe(false);
    });
  });

  describe('type checks', () => {
    it('isUint8 should return true only for UINT8', () => {
      expect(EncryptionType.UINT8.isUint8()).toBe(true);
      expect(EncryptionType.UINT64.isUint8()).toBe(false);
      expect(EncryptionType.ADDRESS.isUint8()).toBe(false);
    });

    it('isUint16 should return true only for UINT16', () => {
      expect(EncryptionType.UINT16.isUint16()).toBe(true);
      expect(EncryptionType.UINT64.isUint16()).toBe(false);
      expect(EncryptionType.ADDRESS.isUint16()).toBe(false);
    });

    it('isUint32 should return true only for UINT32', () => {
      expect(EncryptionType.UINT32.isUint32()).toBe(true);
      expect(EncryptionType.UINT64.isUint32()).toBe(false);
      expect(EncryptionType.ADDRESS.isUint32()).toBe(false);
    });

    it('isUint64 should return true only for UINT64', () => {
      expect(EncryptionType.UINT64.isUint64()).toBe(true);
      expect(EncryptionType.ADDRESS.isUint64()).toBe(false);
      expect(EncryptionType.BOOL.isUint64()).toBe(false);
    });

    it('isUint128 should return true only for UINT128', () => {
      expect(EncryptionType.UINT128.isUint128()).toBe(true);
      expect(EncryptionType.UINT64.isUint128()).toBe(false);
      expect(EncryptionType.ADDRESS.isUint128()).toBe(false);
    });

    it('isUint256 should return true only for UINT256', () => {
      expect(EncryptionType.UINT256.isUint256()).toBe(true);
      expect(EncryptionType.UINT64.isUint256()).toBe(false);
      expect(EncryptionType.ADDRESS.isUint256()).toBe(false);
    });

    it('isAddress should return true only for ADDRESS', () => {
      expect(EncryptionType.UINT64.isAddress()).toBe(false);
      expect(EncryptionType.ADDRESS.isAddress()).toBe(true);
      expect(EncryptionType.BOOL.isAddress()).toBe(false);
    });

    it('isBool should return true only for BOOL', () => {
      expect(EncryptionType.UINT64.isBool()).toBe(false);
      expect(EncryptionType.ADDRESS.isBool()).toBe(false);
      expect(EncryptionType.BOOL.isBool()).toBe(true);
    });
  });
});
