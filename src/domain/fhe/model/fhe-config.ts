export interface CoFheNetworkConfig {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  environment: 'mock' | 'testnet';
}

export interface CoFheConfig {
  network: CoFheNetworkConfig;
}

export const DEFAULT_COFHE_CONFIG: CoFheConfig = {
  network: {
    chainId: 421614,
    networkName: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    environment: 'testnet',
  },
};
