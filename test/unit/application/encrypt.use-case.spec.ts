import { Test, TestingModule } from '@nestjs/testing';
import { EncryptUseCase } from '@application/use-case/encrypt.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import {
  IFheService,
  FHE_SERVICE,
  EncryptionResult,
} from '@domain/fhe/service/fhe.service.interface';
import { EncryptedValue } from '@domain/fhe/value-object/encrypted-value';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

describe('EncryptUseCase', () => {
  let useCase: EncryptUseCase;
  let fheService: jest.Mocked<IFheService>;

  const contractAddress = '0x1234567890123456789012345678901234567890';
  const userAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  beforeEach(async () => {
    const mockFheService: Partial<jest.Mocked<IFheService>> = {
      encryptUint8: jest.fn(),
      encryptUint16: jest.fn(),
      encryptUint32: jest.fn(),
      encryptUint64: jest.fn(),
      encryptUint128: jest.fn(),
      encryptUint256: jest.fn(),
      encryptAddress: jest.fn(),
      encryptBool: jest.fn(),
      encrypt: jest.fn(),
      isInitialized: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptUseCase, { provide: FHE_SERVICE, useValue: mockFheService }],
    }).compile();

    useCase = module.get<EncryptUseCase>(EncryptUseCase);
    fheService = module.get(FHE_SERVICE);
  });

  const createMockResult = (
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bool',
  ): EncryptionResult => {
    let encryptedValue: EncryptedValue;

    switch (type) {
      case 'uint8':
        encryptedValue = EncryptedValue.createUint8('0xdata', '0xinputproof');
        break;
      case 'uint16':
        encryptedValue = EncryptedValue.createUint16('0xdata', '0xinputproof');
        break;
      case 'uint32':
        encryptedValue = EncryptedValue.createUint32('0xdata', '0xinputproof');
        break;
      case 'uint64':
        encryptedValue = EncryptedValue.createUint64('0xdata', '0xinputproof');
        break;
      case 'uint128':
        encryptedValue = EncryptedValue.createUint128('0xdata', '0xinputproof');
        break;
      case 'uint256':
        encryptedValue = EncryptedValue.createUint256('0xdata', '0xinputproof');
        break;
      case 'address':
        encryptedValue = EncryptedValue.createAddress('0xdata', '0xinputproof');
        break;
      case 'bool':
        encryptedValue = EncryptedValue.createBool('0xdata', '0xinputproof');
        break;
    }

    return { encryptedValue, encryptionTimeMs: 1000 };
  };

  describe('execute with uint8', () => {
    it('should encrypt uint8 value successfully', async () => {
      const mockResult = createMockResult('uint8');
      fheService.encryptUint8!.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT8,
        value: 255,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT8);
        expect(result.value.data).toBe('0xdata');
        expect(result.value.inputProof).toBe('0xinputproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }

      expect(fheService.encryptUint8).toHaveBeenCalledWith(255, undefined, undefined);
    });
  });

  describe('execute with uint16', () => {
    it('should encrypt uint16 value successfully', async () => {
      const mockResult = createMockResult('uint16');
      fheService.encryptUint16!.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT16,
        value: 65535,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT16);
      }

      expect(fheService.encryptUint16).toHaveBeenCalledWith(65535, undefined, undefined);
    });
  });

  describe('execute with uint32', () => {
    it('should encrypt uint32 value successfully', async () => {
      const mockResult = createMockResult('uint32');
      fheService.encryptUint32!.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT32,
        value: '4294967295',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT32);
      }

      expect(fheService.encryptUint32).toHaveBeenCalledWith(
        BigInt('4294967295'),
        undefined,
        undefined,
      );
    });
  });

  describe('execute with uint64', () => {
    it('should encrypt uint64 value successfully without addresses', async () => {
      const mockResult = createMockResult('uint64');
      fheService.encryptUint64.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT64);
        expect(result.value.data).toBe('0xdata');
        expect(result.value.inputProof).toBe('0xinputproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }

      expect(fheService.encryptUint64).toHaveBeenCalledWith(
        BigInt('1000000'),
        undefined,
        undefined,
      );
    });

    it('should encrypt uint64 value successfully with addresses', async () => {
      const mockResult = createMockResult('uint64');
      fheService.encryptUint64.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        contractAddress,
        userAddress,
      });

      expect(result.ok).toBe(true);
      expect(fheService.encryptUint64).toHaveBeenCalledWith(
        BigInt('1000000'),
        contractAddress,
        userAddress,
      );
    });
  });

  describe('execute with uint128', () => {
    it('should encrypt uint128 value successfully', async () => {
      const mockResult = createMockResult('uint128');
      fheService.encryptUint128!.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT128,
        value: '340282366920938463463374607431768211455',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT128);
      }

      expect(fheService.encryptUint128).toHaveBeenCalledWith(
        BigInt('340282366920938463463374607431768211455'),
        undefined,
        undefined,
      );
    });
  });

  describe('execute with uint256', () => {
    it('should encrypt uint256 value successfully', async () => {
      const mockResult = createMockResult('uint256');
      fheService.encryptUint256!.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT256,
        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.UINT256);
      }

      expect(fheService.encryptUint256).toHaveBeenCalled();
    });
  });

  describe('execute with address', () => {
    it('should encrypt address value successfully', async () => {
      const mockResult = createMockResult('address');
      fheService.encryptAddress.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.ADDRESS,
        value: userAddress,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.ADDRESS);
      }

      expect(fheService.encryptAddress).toHaveBeenCalledWith(userAddress, undefined, undefined);
    });
  });

  describe('execute with bool', () => {
    it('should encrypt bool value successfully', async () => {
      const mockResult = createMockResult('bool');
      fheService.encryptBool.mockResolvedValue({ ok: true, value: mockResult });

      const result = await useCase.execute({
        type: EncryptionTypeDto.BOOL,
        value: true,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.type).toBe(EncryptionTypeDto.BOOL);
      }

      expect(fheService.encryptBool).toHaveBeenCalledWith(true, undefined, undefined);
    });
  });

  describe('error handling', () => {
    it('should return error when service fails', async () => {
      const error = new FhevmNotInitializedError();
      fheService.encryptUint64.mockResolvedValue({ ok: false, error });

      const result = await useCase.execute({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });
  });
});
