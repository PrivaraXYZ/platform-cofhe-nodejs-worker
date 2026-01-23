import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';

describe('EncryptedValue', () => {
  const data = '0x1234567890abcdef';
  const inputProof = '0xabcdef1234567890';
  const securityZone = 0;

  const UTYPE_UINT8 = 0;
  const UTYPE_UINT16 = 1;
  const UTYPE_UINT32 = 2;
  const UTYPE_UINT64 = 5;
  const UTYPE_UINT128 = 6;
  const UTYPE_UINT256 = 8;
  const UTYPE_ADDRESS = 7;
  const UTYPE_BOOL = 13;

  describe('createUint8', () => {
    it('should create uint8 encrypted value', () => {
      const value = EncryptedValue.createUint8(data, securityZone, UTYPE_UINT8, inputProof);

      expect(value.type.toString()).toBe('euint8');
      expect(value.data).toBe(data);
      expect(value.securityZone).toBe(securityZone);
      expect(value.utype).toBe(UTYPE_UINT8);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createUint16', () => {
    it('should create uint16 encrypted value', () => {
      const value = EncryptedValue.createUint16(data, securityZone, UTYPE_UINT16, inputProof);

      expect(value.type.toString()).toBe('euint16');
      expect(value.data).toBe(data);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createUint32', () => {
    it('should create uint32 encrypted value', () => {
      const value = EncryptedValue.createUint32(data, securityZone, UTYPE_UINT32, inputProof);

      expect(value.type.toString()).toBe('euint32');
      expect(value.data).toBe(data);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createUint64', () => {
    it('should create uint64 encrypted value', () => {
      const value = EncryptedValue.createUint64(data, securityZone, UTYPE_UINT64, inputProof);

      expect(value.type.toString()).toBe('euint64');
      expect(value.data).toBe(data);
      expect(value.securityZone).toBe(securityZone);
      expect(value.utype).toBe(UTYPE_UINT64);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createUint128', () => {
    it('should create uint128 encrypted value', () => {
      const value = EncryptedValue.createUint128(data, securityZone, UTYPE_UINT128, inputProof);

      expect(value.type.toString()).toBe('euint128');
      expect(value.data).toBe(data);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createUint256', () => {
    it('should create uint256 encrypted value', () => {
      const value = EncryptedValue.createUint256(data, securityZone, UTYPE_UINT256, inputProof);

      expect(value.type.toString()).toBe('euint256');
      expect(value.data).toBe(data);
      expect(value.inputProof).toBe(inputProof);
    });
  });

  describe('createAddress', () => {
    it('should create address encrypted value', () => {
      const value = EncryptedValue.createAddress(data, securityZone, UTYPE_ADDRESS, inputProof);

      expect(value.type.toString()).toBe('eaddress');
    });
  });

  describe('createBool', () => {
    it('should create bool encrypted value', () => {
      const value = EncryptedValue.createBool(data, securityZone, UTYPE_BOOL, inputProof);

      expect(value.type.toString()).toBe('ebool');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const value = EncryptedValue.createUint64(data, securityZone, UTYPE_UINT64, inputProof);
      const json = value.toJSON();

      expect(json).toEqual({
        type: 'euint64',
        data,
        securityZone,
        utype: UTYPE_UINT64,
        inputProof,
      });
    });
  });

  describe('normalizeHex', () => {
    it('should keep 0x prefix when present', () => {
      const value = EncryptedValue.createUint64('0xABCDEF', securityZone, UTYPE_UINT64, '0x123456');

      expect(value.data).toBe('0xabcdef');
      expect(value.inputProof).toBe('0x123456');
    });

    it('should add 0x prefix when not present', () => {
      const value = EncryptedValue.createUint64('abcdef', securityZone, UTYPE_UINT64, '123456');

      expect(value.data).toBe('0xabcdef');
      expect(value.inputProof).toBe('0x123456');
    });
  });
});
