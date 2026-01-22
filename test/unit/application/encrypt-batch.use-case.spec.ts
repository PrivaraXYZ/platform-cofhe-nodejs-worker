import { Test, TestingModule } from '@nestjs/testing';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { EncryptUseCase, EncryptOutput } from '@application/use-case/encrypt.use-case';
import { EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

describe('BatchEncryptUseCase', () => {
  let useCase: BatchEncryptUseCase;
  let encryptUseCase: jest.Mocked<EncryptUseCase>;

  const contractAddress = '0x1234567890123456789012345678901234567890';
  const userAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  const createMockEncryptOutput = (type: EncryptionTypeDto): EncryptOutput => ({
    type,
    data: '0xdata',
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

  describe('no context flow (Fhenix)', () => {
    it('should encrypt multiple items without context', async () => {
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
        contractAddress: undefined,
        userAddress: undefined,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress: undefined,
        userAddress: undefined,
      });
    });
  });

  describe('shared context flow', () => {
    it('should encrypt multiple items with shared context', async () => {
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
        contractAddress,
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
        contractAddress,
        userAddress,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        contractAddress,
        userAddress,
      });
    });
  });

  describe('per-item context flow', () => {
    it('should encrypt items with individual contexts', async () => {
      const otherContract = '0x9999999999999999999999999999999999999999';
      const otherUser = '0x8888888888888888888888888888888888888888';

      encryptUseCase.execute
        .mockResolvedValueOnce({
          ok: true,
          value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
        })
        .mockResolvedValueOnce({
          ok: true,
          value: {
            ...createMockEncryptOutput(EncryptionTypeDto.ADDRESS),
            contractAddress: otherContract,
            userAddress: otherUser,
          },
        });

      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '500',
            contractAddress,
            userAddress,
          },
          {
            type: EncryptionTypeDto.ADDRESS,
            value: otherUser,
            contractAddress: otherContract,
            userAddress: otherUser,
          },
        ],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(2);
      }

      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(1, {
        type: EncryptionTypeDto.UINT64,
        value: '500',
        contractAddress,
        userAddress,
      });
      expect(encryptUseCase.execute).toHaveBeenNthCalledWith(2, {
        type: EncryptionTypeDto.ADDRESS,
        value: otherUser,
        contractAddress: otherContract,
        userAddress: otherUser,
      });
    });
  });

  describe('partial context (Fhenix allows optional addresses)', () => {
    it('should work when only contractAddress is provided at batch level', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        contractAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '100' }],
      });

      expect(result.ok).toBe(true);
      expect(encryptUseCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '100',
        contractAddress,
        userAddress: undefined,
      });
    });

    it('should work when only userAddress is provided at batch level', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        userAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '100' }],
      });

      expect(result.ok).toBe(true);
      expect(encryptUseCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '100',
        contractAddress: undefined,
        userAddress,
      });
    });

    it('should work when item has only contractAddress', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '100',
            contractAddress,
          },
        ],
      });

      expect(result.ok).toBe(true);
    });

    it('should work when item has only userAddress', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.BOOL),
      });

      const result = await useCase.execute({
        items: [
          {
            type: EncryptionTypeDto.BOOL,
            value: true,
            userAddress,
          },
        ],
      });

      expect(result.ok).toBe(true);
    });

    it('should allow mixing shared and item-level context (item overrides batch)', async () => {
      const itemContract = '0x9999999999999999999999999999999999999999';
      const itemUser = '0x8888888888888888888888888888888888888888';

      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [
          {
            type: EncryptionTypeDto.UINT64,
            value: '100',
            contractAddress: itemContract,
            userAddress: itemUser,
          },
        ],
      });

      expect(result.ok).toBe(true);
      expect(encryptUseCase.execute).toHaveBeenCalledWith({
        type: EncryptionTypeDto.UINT64,
        value: '100',
        contractAddress: itemContract,
        userAddress: itemUser,
      });
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
        contractAddress,
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
        contractAddress,
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
    it('should handle single item batch without context', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        items: [{ type: EncryptionTypeDto.UINT64, value: '42' }],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(1);
      }
    });

    it('should handle single item batch with shared context', async () => {
      encryptUseCase.execute.mockResolvedValueOnce({
        ok: true,
        value: createMockEncryptOutput(EncryptionTypeDto.UINT64),
      });

      const result = await useCase.execute({
        contractAddress,
        userAddress,
        items: [{ type: EncryptionTypeDto.UINT64, value: '42' }],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.results).toHaveLength(1);
      }
    });
  });
});
