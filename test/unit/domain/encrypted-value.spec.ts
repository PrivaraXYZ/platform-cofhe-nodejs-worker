import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { EthereumAddress } from '@domain/fhe/value-object/ethereum-address';

describe('EncryptedValue', () => {
  const data = '0x1234567890abcdef';
  const inputProof = '0xabcdef1234567890';
  const securityZone = 0;
  const contractAddressStr = '0x1234567890123456789012345678901234567890';
  const userAddressStr = '0xabcdef0123456789abcdef0123456789abcdef01';

  const UTYPE_UINT8 = 0;
  const UTYPE_UINT16 = 1;
  const UTYPE_UINT32 = 2;
  const UTYPE_UINT64 = 5;
  const UTYPE_UINT128 = 6;
  const UTYPE_UINT256 = 8;
  const UTYPE_ADDRESS = 7;
  const UTYPE_BOOL = 13;

  let contractAddress: EthereumAddress;
  let userAddress: EthereumAddress;

  beforeEach(() => {
    const contractResult = EthereumAddress.createContract(contractAddressStr);
    const userResult = EthereumAddress.createUser(userAddressStr);

    if (contractResult.ok && userResult.ok) {
      contractAddress = contractResult.value;
      userAddress = userResult.value;
    }
  });

  describe('createUint8', () => {
    it('should create uint8 encrypted value', () => {
      const value = EncryptedValue.createUint8(data, securityZone, UTYPE_UINT8, inputProof);

      expect(value.type.toString()).toBe('euint8');
      expect(value.data).toBe(data);
      expect(value.securityZone).toBe(securityZone);
      expect(value.utype).toBe(UTYPE_UINT8);
      expect(value.inputProof).toBe(inputProof);
      expect(value.contractAddress).toBeUndefined();
      expect(value.userAddress).toBeUndefined();
    });

    it('should create uint8 encrypted value with optional addresses', () => {
      const value = EncryptedValue.createUint8(
        data,
        securityZone,
        UTYPE_UINT8,
        inputProof,
        contractAddress,
        userAddress,
      );

      expect(value.type.toString()).toBe('euint8');
      expect(value.contractAddress?.toString()).toBe(contractAddressStr.toLowerCase());
      expect(value.userAddress?.toString()).toBe(userAddressStr.toLowerCase());
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
    it('should create uint64 encrypted value without addresses', () => {
      const value = EncryptedValue.createUint64(data, securityZone, UTYPE_UINT64, inputProof);

      expect(value.type.toString()).toBe('euint64');
      expect(value.data).toBe(data);
      expect(value.securityZone).toBe(securityZone);
      expect(value.utype).toBe(UTYPE_UINT64);
      expect(value.inputProof).toBe(inputProof);
      expect(value.contractAddress).toBeUndefined();
      expect(value.userAddress).toBeUndefined();
    });

    it('should create uint64 encrypted value with addresses', () => {
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );

      expect(value.type.toString()).toBe('euint64');
      expect(value.data).toBe(data);
      expect(value.inputProof).toBe(inputProof);
      expect(value.contractAddress?.toString()).toBe(contractAddressStr.toLowerCase());
      expect(value.userAddress?.toString()).toBe(userAddressStr.toLowerCase());
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
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );
      const json = value.toJSON();

      expect(json).toEqual({
        type: 'euint64',
        data,
        securityZone,
        utype: UTYPE_UINT64,
        inputProof,
        contractAddress: contractAddressStr.toLowerCase(),
        userAddress: userAddressStr.toLowerCase(),
      });
    });

    it('should serialize to JSON without addresses', () => {
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

  describe('isForContract', () => {
    it('should return true when contract address matches', () => {
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );

      expect(value.isForContract(contractAddress)).toBe(true);
    });

    it('should return false when contract address does not match', () => {
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );
      const otherResult = EthereumAddress.createContract(
        '0x9999999999999999999999999999999999999999',
      );

      if (otherResult.ok) {
        expect(value.isForContract(otherResult.value)).toBe(false);
      }
    });

    it('should return false when no contract address is set', () => {
      const value = EncryptedValue.createUint64(data, securityZone, UTYPE_UINT64, inputProof);

      expect(value.isForContract(contractAddress)).toBe(false);
    });
  });

  describe('isForUser', () => {
    it('should return true when user address matches', () => {
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );

      expect(value.isForUser(userAddress)).toBe(true);
    });

    it('should return false when user address does not match', () => {
      const value = EncryptedValue.createUint64(
        data,
        securityZone,
        UTYPE_UINT64,
        inputProof,
        contractAddress,
        userAddress,
      );
      const otherResult = EthereumAddress.createUser('0x8888888888888888888888888888888888888888');

      if (otherResult.ok) {
        expect(value.isForUser(otherResult.value)).toBe(false);
      }
    });

    it('should return false when no user address is set', () => {
      const value = EncryptedValue.createUint64(data, securityZone, UTYPE_UINT64, inputProof);

      expect(value.isForUser(userAddress)).toBe(false);
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
