import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EncryptController } from '@interface/http/encrypt/encrypt.controller';
import { EncryptUseCase, EncryptOutput } from '@application/use-case/encrypt.use-case';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { FhevmNotInitializedError, BatchValidationError } from '@domain/fhe/error/fhe.error';

describe('EncryptController', () => {
  let controller: EncryptController;
  let useCase: jest.Mocked<EncryptUseCase>;
  let batchUseCase: jest.Mocked<BatchEncryptUseCase>;

  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const mockOutput: EncryptOutput = {
    type: EncryptionTypeDto.UINT64,
    data: '0xdata',
    securityZone: 0,
    utype: 5,
    inputProof: '0xinputproof',
    encryptionTimeMs: 1000,
  };

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const mockBatchUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncryptController],
      providers: [
        { provide: EncryptUseCase, useValue: mockUseCase },
        { provide: BatchEncryptUseCase, useValue: mockBatchUseCase },
      ],
    }).compile();

    controller = module.get<EncryptController>(EncryptController);
    useCase = module.get(EncryptUseCase);
    batchUseCase = module.get(BatchEncryptUseCase);
  });

  describe('encrypt', () => {
    it('should return encrypted value for valid request without addresses', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encrypt({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: undefined,
        userAddress: undefined,
      });
    });

    it('should return encrypted value for valid request with addresses', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encrypt({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });

    it('should throw error when use case fails', async () => {
      const error = new FhevmNotInitializedError();
      useCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encrypt({
          type: EncryptionTypeDto.UINT64,
          value: '1000',
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('encryptUint8', () => {
    it('should encrypt uint8 value', async () => {
      const uint8Output = { ...mockOutput, type: EncryptionTypeDto.UINT8 };
      useCase.execute.mockResolvedValue({ ok: true, value: uint8Output });

      const result = await controller.encryptUint8({
        value: 255,
      });

      expect(result.type).toBe(EncryptionTypeDto.UINT8);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT8,
        value: 255,
        contractAddress: undefined,
        userAddress: undefined,
      });
    });
  });

  describe('encryptUint16', () => {
    it('should encrypt uint16 value', async () => {
      const uint16Output = { ...mockOutput, type: EncryptionTypeDto.UINT16 };
      useCase.execute.mockResolvedValue({ ok: true, value: uint16Output });

      const result = await controller.encryptUint16({
        value: 65535,
      });

      expect(result.type).toBe(EncryptionTypeDto.UINT16);
    });
  });

  describe('encryptUint32', () => {
    it('should encrypt uint32 value', async () => {
      const uint32Output = { ...mockOutput, type: EncryptionTypeDto.UINT32 };
      useCase.execute.mockResolvedValue({ ok: true, value: uint32Output });

      const result = await controller.encryptUint32({
        value: '4294967295',
      });

      expect(result.type).toBe(EncryptionTypeDto.UINT32);
    });
  });

  describe('encryptUint64', () => {
    it('should encrypt uint64 value without addresses', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encryptUint64({
        value: '1000',
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: undefined,
        userAddress: undefined,
      });
    });

    it('should encrypt uint64 value with addresses', async () => {
      useCase.execute.mockResolvedValue({ ok: true, value: mockOutput });

      const result = await controller.encryptUint64({
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result).toEqual(mockOutput);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });
  });

  describe('encryptUint128', () => {
    it('should encrypt uint128 value', async () => {
      const uint128Output = { ...mockOutput, type: EncryptionTypeDto.UINT128 };
      useCase.execute.mockResolvedValue({ ok: true, value: uint128Output });

      const result = await controller.encryptUint128({
        value: '340282366920938463463374607431768211455',
      });

      expect(result.type).toBe(EncryptionTypeDto.UINT128);
    });
  });

  describe('encryptUint256', () => {
    it('should encrypt uint256 value', async () => {
      const uint256Output = { ...mockOutput, type: EncryptionTypeDto.UINT256 };
      useCase.execute.mockResolvedValue({ ok: true, value: uint256Output });

      const result = await controller.encryptUint256({
        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      });

      expect(result.type).toBe(EncryptionTypeDto.UINT256);
    });
  });

  describe('encryptAddress', () => {
    it('should encrypt address value without context', async () => {
      const addressOutput = { ...mockOutput, type: EncryptionTypeDto.ADDRESS };
      useCase.execute.mockResolvedValue({ ok: true, value: addressOutput });

      const result = await controller.encryptAddress({
        value: validUserAddress,
      });

      expect(result.type).toBe(EncryptionTypeDto.ADDRESS);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.ADDRESS,
        value: validUserAddress,
        contractAddress: undefined,
        userAddress: undefined,
      });
    });

    it('should encrypt address value with context', async () => {
      const addressOutput = { ...mockOutput, type: EncryptionTypeDto.ADDRESS };
      useCase.execute.mockResolvedValue({ ok: true, value: addressOutput });

      const result = await controller.encryptAddress({
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });

      expect(result.type).toBe(EncryptionTypeDto.ADDRESS);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.ADDRESS,
        value: validUserAddress,
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
      });
    });
  });

  describe('encryptBool', () => {
    it('should encrypt bool value without context', async () => {
      const boolOutput = { ...mockOutput, type: EncryptionTypeDto.BOOL };
      useCase.execute.mockResolvedValue({ ok: true, value: boolOutput });

      const result = await controller.encryptBool({
        value: true,
      });

      expect(result.type).toBe(EncryptionTypeDto.BOOL);
      expect(useCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress: undefined,
        userAddress: undefined,
      });
    });
  });

  describe('encryptBatch', () => {
    it('should return batch results for valid request without addresses', async () => {
      const batchOutput = {
        results: [mockOutput, { ...mockOutput, type: EncryptionTypeDto.BOOL }],
        totalEncryptionTimeMs: 2000,
      };
      batchUseCase.execute.mockResolvedValue({ ok: true, value: batchOutput });

      const result = await controller.encryptBatch({
        items: [
          { type: EncryptionTypeDto.UINT64, value: '1000' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalEncryptionTimeMs).toBe(2000);
    });

    it('should return batch results for valid request with addresses', async () => {
      const batchOutput = {
        results: [mockOutput, { ...mockOutput, type: EncryptionTypeDto.BOOL }],
        totalEncryptionTimeMs: 2000,
      };
      batchUseCase.execute.mockResolvedValue({ ok: true, value: batchOutput });

      const result = await controller.encryptBatch({
        contractAddress: validContractAddress,
        userAddress: validUserAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '1000' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalEncryptionTimeMs).toBe(2000);
    });

    it('should throw BadRequestException for BatchValidationError', async () => {
      const error = new BatchValidationError('Test validation error');
      batchUseCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encryptBatch({
          contractAddress: validContractAddress,
          items: [{ type: EncryptionTypeDto.UINT64, value: '1000' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw domain error when use case fails', async () => {
      const error = new FhevmNotInitializedError();
      batchUseCase.execute.mockResolvedValue({ ok: false, error });

      await expect(
        controller.encryptBatch({
          items: [{ type: EncryptionTypeDto.UINT64, value: '1000' }],
        }),
      ).rejects.toThrow(error);
    });
  });
});
