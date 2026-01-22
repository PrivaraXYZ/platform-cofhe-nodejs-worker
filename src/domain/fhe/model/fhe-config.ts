export interface CoFheNetworkConfig {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  environment: 'mock' | 'testnet';
}

export interface CoFheConfig {
  network: CoFheNetworkConfig;
}
