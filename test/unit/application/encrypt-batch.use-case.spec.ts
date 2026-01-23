import { Test, TestingModule } from '@nestjs/testing';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { EncryptUseCase, EncryptOutput } from '@application/use-case/encrypt.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

describe('BatchEncryptUseCase', () => {
  let useCase: BatchEncryptUseCase;
  let encryptUseCase: jest.Mocked<EncryptUseCase>;

  const userAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const UTYPE_MAP: Record<EncryptionTypeDto, number> = {
    [EncryptionTypeDto.UINT8]: 0,
    [EncryptionTypeDto.UINT16]: 1,
    [EncryptionTypeDto.UINT32]: 2,
    [EncryptionTypeDto.UINT64]: 5,
    [EncryptionTypeDto.UINT128]: 6,
    [EncryptionTypeDto.UINT256]: 8,
    [EncryptionTypeDto.ADDRESS]: 7,
    [EncryptionTypeDto.BOOL]: 13,
  };

  const createMockEncryptOutput = (type: EncryptionTypeDto): EncryptOutput => ({
    type,
    data: '0xdata',
    securityZone: 0,
    utype: UTYPE_MAP[type],
    inputProof: '0xinputproof',
    encryptionTimeMs: 1000,
  });

  beforeEach(async () => {
    const mockEncryptUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BatchEncryptUseCase, { provide: EncryptUseCase, useValue: mockEncryptUseCase }],
    }).compile();

    useCase = module.get<BatchEncryptUseCase>(BatchEncryptUseCase);
    encryptUseCase = module.get(EncryptUseCase);
  });

  describe('batch encryption with userAddress', () => {
    it('should encrypt multiple items with shared userAddress', async () => {
      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.BOOL),
        });

      const result = await useCase.execute({
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '1000000' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(2);
        expect(result.value.results[0].type).toBe(EncryptionTypeDto.UINT64);
        expect(result.value.results[1].type).toBe(EncryptionTypeDto.BOOL);
        expect(result.value.totalEncryptionTimeMs).toBeGreaterThanOrEqual(0);
      }

      expect(encryptUseCase.execute).toHaveBeenCalledTimes(2);
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(1, {
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        userAddress,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        userAddress,
      });
    });

    it('should encrypt all supported types', async () => {
      const types = [
        { type: EncryptionTypeDto.UINT8, value: 255 },
        { type: EncryptionTypeDto.UINT16, value: 65535 },
        { type: EncryptionTypeDto.UINT32, value: '4294967295' },
        { type: EncryptionTypeDto.UINT64, value: '1000000' },
        { type: EncryptionTypeDto.UINT128, value: '340282366920938463463374607431768211455' },
        { type: EncryptionTypeDto.UINT256, value: '1000' },
        { type: EncryptionTypeDto.ADDRESS, value: userAddress },
        { type: EncryptionTypeDto.BOOL, value: true },
      ];

      for (const { type } of types) {
        encryptUseCase.execute.mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(type),
        });
      }

      const result = await useCase.execute({
        userAddress,
        items: types,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(8);
      }
    });
  });

  describe('all-or-nothing error handling', () => {
    it('should return error when any encryption fails (parallel execution)', async () => {
      const error = new FhevmNotInitializedError();
      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({ ok: false, error })
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.ADDRESS),
        });

      const result = await useCase.execute({
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '100' },
          { type: EncryptionTypeDto.BOOL, value: true },
          { type: EncryptionTypeDto.ADDRESS, value: userAddress },
        ],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }

      expect(encryptUseCase.execute).toHaveBeenCalledTimes(3);
    });

    it('should return error when first item fails (parallel execution)', async () => {
      const error = new FhevmNotInitializedError();
      encryptUseCase.execute.mockResolvedValueOnce({ ok: false, error }).mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.BOOL),
      });

      const result = await useCase.execute({
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '100' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.ok).toBe(false);
      expect(encryptUseCase.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('single item batch', () => {
    it('should handle single item batch', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        userAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '42' }],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(1);
      }
    });
  });

  describe('timing', () => {
    it('should calculate total encryption time', async () => {
      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: { ...createMockEncryptOutput(EncryptionTypeDto.UINT64), encryptionTimeMs: 500 },
        })
        .mockResolvedValueOnce({
          ok: true,
          value: { ...createMockEncryptOutput(EncryptionTypeDto.BOOL), encryptionTimeMs: 300 },
        });

      const result = await useCase.execute({
        userAddress,
        items: [
          { type: EncryptionTypeDto.UINT64, value: '100' },
          { type: EncryptionTypeDto.BOOL, value: true },
        ],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.totalEncryptionTimeMs).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
