import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FheWorkerPoolService } from '@infrastructure/fhe/fhe-worker-pool.service';
import { FhevmNotInitializedError } from '@domain/fhe/error/fhe.error';

const mockRun = jest.fn().mockResolvedValue({
  data: '0xdata',
  inputProof: '0xinputproof',
  encryptionTimeMs: 1000,
});
const mockDestroy = jest.fn().mockResolvedValue(undefined);

jest.mock('piscina', () => ({
  Piscina: jest.fn().mockImplementation(() => ({
    run: mockRun,
    destroy: mockDestroy,
  })),
}));

describe('FheWorkerPoolService', () => {
  let service: FheWorkerPoolService;

  const validContractAddress = '0x1234567890123456789012345678901234567890';
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configs: Record<string, unknown> = {
          cofhe: {
            network: {
              chainId: 421614,
              networkName: 'Arbitrum Sepolia',
              rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
              environment: 'testnet',
            },
          },
          worker: {
            minThreads: 2,
            maxThreads: 4,
            idleTimeout: 60000,
            maxQueue: 100,
            taskTimeout: 45000,
          },
        };
        return configs[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FheWorkerPoolService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<FheWorkerPoolService>(FheWorkerPoolService);
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(service.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await service.initialize();

      expect(service.isInitialized()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return CoFHE config', () => {
      const config = service.getConfig();

      expect(config.network.chainId).toBe(421614);
      expect(config.network.networkName).toBe('Arbitrum Sepolia');
      expect(config.network.environment).toBe('testnet');
    });
  });

  describe('encryptUint8', () => {
    it('should return error when not initialized', async () => {
      const result = await service.encryptUint8(255);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(FhevmNotInitializedError);
      }
    });

    it('should encrypt uint8 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint8(255);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.encryptedValue.data).toBe('0xdata');
        expect(result.value.encryptedValue.inputProof).toBe('0xinputproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }
    });
  });

  describe('encryptUint16', () => {
    it('should encrypt uint16 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint16(65535);

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptUint32', () => {
    it('should encrypt uint32 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint32(4294967295n);

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptUint64', () => {
    it('should return error when not initialized', async () => {
      const result = await service.encryptUint64(1000n);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(FhevmNotInitializedError);
      }
    });

    it('should encrypt uint64 when initialized without addresses', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.encryptedValue.data).toBe('0xdata');
        expect(result.value.encryptedValue.inputProof).toBe('0xinputproof');
        expect(result.value.encryptionTimeMs).toBe(1000);
      }
    });

    it('should encrypt uint64 when initialized with addresses', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, validContractAddress, validUserAddress);

      expect(result.ok).toBe(true);
    });

    it('should return error for invalid contract address', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, 'invalid', validUserAddress);

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid user address', async () => {
      await service.initialize();

      const result = await service.encryptUint64(1000n, validContractAddress, 'invalid');

      expect(result.ok).toBe(false);
    });
  });

  describe('encryptUint128', () => {
    it('should encrypt uint128 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint128(
        BigInt('340282366920938463463374607431768211455'),
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptUint256', () => {
    it('should encrypt uint256 when initialized', async () => {
      await service.initialize();

      const result = await service.encryptUint256(
        BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptAddress', () => {
    it('should encrypt address when initialized without context', async () => {
      await service.initialize();

      const result = await service.encryptAddress(validUserAddress);

      expect(result.ok).toBe(true);
    });

    it('should encrypt address when initialized with context', async () => {
      await service.initialize();

      const result = await service.encryptAddress(
        validUserAddress,
        validContractAddress,
        validUserAddress,
      );

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptBool', () => {
    it('should encrypt bool when initialized without context', async () => {
      await service.initialize();

      const result = await service.encryptBool(true);

      expect(result.ok).toBe(true);
    });

    it('should encrypt bool when initialized with context', async () => {
      await service.initialize();

      const result = await service.encryptBool(true, validContractAddress, validUserAddress);

      expect(result.ok).toBe(true);
    });
  });

  describe('encrypt (generic)', () => {
    it('should encrypt using generic method', async () => {
      await service.initialize();
      const { EncryptionTypeValue } = await import('@domain/fhe/value-object/encryption-type');

      const result = await service.encrypt({
        type: EncryptionTypeValue.UINT64,
        value: '1000000',
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptBatch', () => {
    it('should encrypt batch when initialized', async () => {
      mockRun.mockResolvedValueOnce([
        { type: 'euint64', data: '0xdata', inputProof: '0xinputproof', encryptionTimeMs: 1000 },
        { type: 'ebool', data: '0xdata', inputProof: '0xinputproof', encryptionTimeMs: 1000 },
      ]);

      await service.initialize();
      const { EncryptionTypeValue } = await import('@domain/fhe/value-object/encryption-type');

      const result = await service.encryptBatch([
        { type: EncryptionTypeValue.UINT64, value: '1000' },
        { type: EncryptionTypeValue.BOOL, value: true },
      ]);

      expect(result.ok).toBe(true);
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy pool on module destroy', async () => {
      await service.initialize();
      await service.onModuleDestroy();

      expect(service.isInitialized()).toBe(false);
    });

    it('should do nothing if pool is not initialized', async () => {
      mockDestroy.mockClear();
      const freshModule = await Test.createTestingModule({
        providers: [
          FheWorkerPoolService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string) => {
                const configs: Record<string, unknown> = {
                  cofhe: {
                    network: {
                      chainId: 421614,
                      networkName: 'Arbitrum Sepolia',
                      rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
                      environment: 'testnet',
                    },
                  },
                  worker: {
                    minThreads: 1,
                    maxThreads: 2,
                    idleTimeout: 1000,
                    maxQueue: 10,
                    taskTimeout: 1000,
                  },
                };
                return configs[key];
              },
            },
          },
        ],
      }).compile();

      const freshService = freshModule.get<FheWorkerPoolService>(FheWorkerPoolService);
      mockDestroy.mockClear();
      await freshService.onModuleDestroy();

      expect(mockDestroy).not.toHaveBeenCalled();
    });
  });

  describe('encryptUint64 error handling', () => {
    it('should handle large uint64 values', async () => {
      await service.initialize();

      const result = await service.encryptUint64(BigInt('18446744073709551615'));

      expect(result.ok).toBe(true);
    });
  });

  describe('encryptAddress error handling', () => {
    it('should return error for invalid address to encrypt', async () => {
      await service.initialize();

      const result = await service.encryptAddress('invalid-address');

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid contract address', async () => {
      await service.initialize();

      const result = await service.encryptAddress(validUserAddress, 'invalid', validUserAddress);

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid user address', async () => {
      await service.initialize();

      const result = await service.encryptAddress(
        validUserAddress,
        validContractAddress,
        'invalid',
      );

      expect(result.ok).toBe(false);
    });
  });

  describe('encryptBool error handling', () => {
    it('should return error for invalid contract address', async () => {
      await service.initialize();

      const result = await service.encryptBool(true, 'invalid', validUserAddress);

      expect(result.ok).toBe(false);
    });

    it('should return error for invalid user address', async () => {
      await service.initialize();

      const result = await service.encryptBool(true, validContractAddress, 'invalid');

      expect(result.ok).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should not reinitialize if already initialized', async () => {
      await service.initialize();
      await service.initialize();

      expect(service.isInitialized()).toBe(true);
    });
  });
});
