import { registerAs } from '@nestjs/config';
import { CoFheConfig } from '@domain/fhe/model/fhe-config';

export default registerAs(
  'cofhe',
  (): CoFheConfig => ({
    network: {
      chainId: parseInt(process.env.COFHE_CHAIN_ID || '421614', 10),
      networkName: process.env.COFHE_NETWORK_NAME || 'Arbitrum Sepolia',
      rpcUrl: process.env.COFHE_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      environment: (process.env.COFHE_ENV as 'mock' | 'testnet') || 'testnet',
    },
  }),
);
