/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

const { createCofheConfig, createCofheClient } = require('@cofhe/sdk/node');
const { Encryptable } = require('@cofhe/sdk');
const { arbSepolia } = require('@cofhe/sdk/chains');
const { Ethers6Adapter } = require('@cofhe/sdk/adapters');

import { JsonRpcProvider, AbstractSigner, type TransactionRequest, type Provider } from 'ethers';

export interface EncryptTask {
  type:
    | 'euint8'
    | 'euint16'
    | 'euint32'
    | 'euint64'
    | 'euint128'
    | 'euint256'
    | 'eaddress'
    | 'ebool';
  value: string | number | boolean;
  userAddress: string;
  config?: WorkerConfig;
}

export interface BatchEncryptTask {
  items: Omit<EncryptTask, 'userAddress' | 'config'>[];
  userAddress: string;
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
  securityZone: number;
  utype: number;
  inputProof: string;
  encryptionTimeMs: number;
}

interface EncryptedItemInput {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: string;
}

let client: any = null;
let initPromise: Promise<void> | null = null;
let currentConfig: WorkerConfig | null = null;
let currentUserAddress: string | null = null;

class ReadOnlySigner extends AbstractSigner {
  private readonly _address: string;

  constructor(address: string, provider: Provider) {
    super(provider);
    this._address = address;
  }

  async getAddress(): Promise<string> {
    return this._address;
  }

  async signTransaction(_tx: TransactionRequest): Promise<string> {
    throw new Error('Read-only signer cannot sign transactions');
  }

  async signMessage(_message: string | Uint8Array): Promise<string> {
    throw new Error('Read-only signer cannot sign messages');
  }

  async signTypedData(
    _domain: any,
    _types: any,
    _value: any,
  ): Promise<string> {
    throw new Error('Read-only signer cannot sign typed data');
  }

  connect(provider: Provider): ReadOnlySigner {
    return new ReadOnlySigner(this._address, provider);
  }
}

async function ensureInitialized(config: WorkerConfig, userAddress: string): Promise<void> {
  const configMatches = currentConfig?.rpcUrl === config.rpcUrl;
  const userMatches = currentUserAddress === userAddress.toLowerCase();

  if (client && configMatches && userMatches) {
    return;
  }

  if (initPromise) {
    await initPromise;
    if (client && configMatches && userMatches) {
      return;
    }
  }

  initPromise = doInitialize(config, userAddress);
  await initPromise;
}

async function doInitialize(config: WorkerConfig, userAddress: string): Promise<void> {
  try {
    const provider = new JsonRpcProvider(config.rpcUrl);
    const normalizedUserAddress = userAddress.toLowerCase();
    const signer = new ReadOnlySigner(normalizedUserAddress, provider);

    const sdkConfig = createCofheConfig({
      supportedChains: [arbSepolia],
    });

    client = createCofheClient(sdkConfig);

    const { publicClient, walletClient } = await Ethers6Adapter(provider, signer);
    await client.connect(publicClient, walletClient);

    currentConfig = config;
    currentUserAddress = normalizedUserAddress;
  } catch (error: any) {
    client = null;
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
      throw new Error('euint256 is not supported by @cofhe/sdk');
    case 'eaddress':
      return Encryptable.address(String(value));
    case 'ebool':
      return Encryptable.bool(Boolean(value));
    default:
      throw new Error(`Unsupported encryption type: ${type}`);
  }
}

function formatResult(
  type: string,
  encrypted: EncryptedItemInput,
  encryptionTimeMs: number,
): EncryptResult {
  return {
    type,
    data: '0x' + encrypted.ctHash.toString(16).padStart(64, '0'),
    securityZone: encrypted.securityZone,
    utype: encrypted.utype,
    inputProof: encrypted.signature,
    encryptionTimeMs,
  };
}

export async function encrypt(task: EncryptTask): Promise<EncryptResult> {
  if (!task.userAddress) {
    throw new Error('userAddress is required for encryption');
  }

  const config = task.config || {
    rpcUrl: process.env.COFHE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: parseInt(process.env.COFHE_CHAIN_ID || '421614', 10),
    environment: (process.env.COFHE_ENV as 'mock' | 'testnet') || 'testnet',
  };

  await ensureInitialized(config, task.userAddress);

  const startTime = Date.now();
  const encryptable = createEncryptable(task.type, task.value);
  const result = await client.encryptInputs([encryptable]).execute();

  if (!result || result.length === 0) {
    throw new Error('Encryption failed: no result returned');
  }

  const [encrypted] = result;
  return formatResult(task.type, encrypted as EncryptedItemInput, Date.now() - startTime);
}

export async function encryptBatch(task: BatchEncryptTask): Promise<EncryptResult[]> {
  if (!task.userAddress) {
    throw new Error('userAddress is required for batch encryption');
  }

  const config = task.config || {
    rpcUrl: process.env.COFHE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: parseInt(process.env.COFHE_CHAIN_ID || '421614', 10),
    environment: (process.env.COFHE_ENV as 'mock' | 'testnet') || 'testnet',
  };

  await ensureInitialized(config, task.userAddress);

  const startTime = Date.now();
  const encryptables = task.items.map((item) => createEncryptable(item.type, item.value));
  const result = await client.encryptInputs(encryptables).execute();

  if (!result) {
    throw new Error('Batch encryption failed: no result returned');
  }

  const totalTime = Date.now() - startTime;
  const timePerItem = Math.round(totalTime / task.items.length);

  return result.map((enc: EncryptedItemInput, index: number) =>
    formatResult(task.items[index].type, enc, timePerItem),
  );
}
