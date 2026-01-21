jest.mock('piscina', () => ({
  Piscina: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue({
      data: '0xdata',
      inputProof: '0xinputproof',
      encryptionTimeMs: 1000,
    }),
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
}));
