/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

const cofheNode = require('cofhejs/node');
const cofhejs = cofheNode.cofhejs;
const Encryptable = cofheNode.Encryptable;

import { JsonRpcProvider } from 'ethers';

export interface EncryptTask {
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'euint256' | 'eaddress' | 'ebool';
  value: string | number | boolean;
  config?: WorkerConfig;
}

export interface BatchEncryptTask {
  items: EncryptTask[];
  config?: WorkerConfig;
}

export interface WorkerConfig {
  rpcUrl: string;
  chainId: number;
  environment: 'mock' | 'testnet';
}

export interface EncryptResult {
  type: string;
  data: string;
  inputProof: string;
  encryptionTimeMs: number;
}

interface CoFheInItem {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: string;
}

let initialized = false;
let initPromise: Promise<void> | null = null;
let currentConfig: WorkerConfig | null = null;

const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001';

function createReadOnlySigner(address: string, ethersProvider: JsonRpcProvider) {
  const provider = {
    getChainId: async () => (await ethersProvider.getNetwork()).chainId.toString(),
    call: async (tx: { to: string; data: string }) => await ethersProvider.call(tx),
    send: async (method: string, params: unknown[]) => await ethersProvider.send(method, params),
  };

  return {
    getAddress: async () => address,
    signTypedData: async () => {
      throw new Error('Read-only signer cannot sign typed data');
    },
    sendTransaction: async () => {
      throw new Error('Read-only signer cannot send transactions');
    },
    provider,
  };
}

async function ensureInitialized(config: WorkerConfig): Promise<void> {
  if (initialized && currentConfig?.rpcUrl === config.rpcUrl) {
    return;
  }

  if (initPromise) {
    await initPromise;
    if (initialized && currentConfig?.rpcUrl === config.rpcUrl) {
      return;
    }
  }

  initPromise = doInitialize(config);
  await initPromise;
}

async function doInitialize(config: WorkerConfig): Promise<void> {
  try {
    const provider = new JsonRpcProvider(config.rpcUrl);
    const readOnlySigner = createReadOnlySigner(DUMMY_ADDRESS, provider);

    const result = await cofhejs.initializeWithEthers({
      ethersProvider: provider,
      ethersSigner: readOnlySigner,
      environment: 'TESTNET',
      generatePermit: false,
    });

    if (!result.success) {
      const errorDetails = result.error?.message || result.error?.toString() || JSON.stringify(result.error);
      throw new Error(`CoFHE initialization failed: ${errorDetails}`);
    }

    initialized = true;
    currentConfig = config;
  } catch (error: any) {
    initPromise = null;
    const errorMessage = error?.message || error?.toString() || JSON.stringify(error);
    throw new Error(`CoFHE initialization failed: ${errorMessage}`);
  }
}

function createEncryptable(type: string, value: string | number | boolean): any {
  switch (type) {
    case 'euint8':
      return Encryptable.uint8(BigInt(value));
    case 'euint16':
      return Encryptable.uint16(BigInt(value));
    case 'euint32':
      return Encryptable.uint32(BigInt(value));
    case 'euint64':
      return Encryptable.uint64(BigInt(value));
    case 'euint128':
      return Encryptable.uint128(BigInt(value));
    case 'euint256':
      return Encryptable.uint256(BigInt(value));
    case 'eaddress':
      return Encryptable.address(String(value));
    case 'ebool':
      return Encryptable.bool(Boolean(value));
    default:
      throw new Error(`Unsupported encryption type: ${type}`);
  }
}

function formatResult(type: string, encrypted: CoFheInItem, encryptionTimeMs: number): EncryptResult {
  return {
    type,
    data: '0x' + encrypted.ctHash.toString(16).padStart(64, '0'),
    inputProof: encrypted.signature,
    encryptionTimeMs,
  };
}

export default async function encrypt(task: EncryptTask): Promise<EncryptResult> {
  const config = task.config || {
    rpcUrl: process.env.COFHE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: parseInt(process.env.COFHE_CHAIN_ID || '421614', 10),
    environment: (process.env.COFHE_ENV as 'mock' | 'testnet') || 'testnet',
  };

  await ensureInitialized(config);

  const startTime = Date.now();
  const encryptable = createEncryptable(task.type, task.value);
  const result = await cofhejs.encrypt([encryptable]);

  if (!result.success || !result.data || result.data.length === 0) {
    throw new Error(`Encryption failed: ${result.error || 'no result returned'}`);
  }

  const [encrypted] = result.data;
  return formatResult(task.type, encrypted as CoFheInItem, Date.now() - startTime);
}

export async function encryptBatch(task: BatchEncryptTask): Promise<EncryptResult[]> {
  const config = task.config || {
    rpcUrl: process.env.COFHE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: parseInt(process.env.COFHE_CHAIN_ID || '421614', 10),
    environment: (process.env.COFHE_ENV as 'mock' | 'testnet') || 'testnet',
  };

  await ensureInitialized(config);

  const startTime = Date.now();
  const encryptables = task.items.map((item) => createEncryptable(item.type, item.value));
  const result = await cofhejs.encrypt(encryptables);

  if (!result.success || !result.data) {
    throw new Error(`Batch encryption failed: ${result.error || 'no result returned'}`);
  }

  const totalTime = Date.now() - startTime;
  const timePerItem = Math.round(totalTime / task.items.length);

  return result.data.map((enc: CoFheInItem, index: number) =>
    formatResult(task.items[index].type, enc, timePerItem)
  );
}
