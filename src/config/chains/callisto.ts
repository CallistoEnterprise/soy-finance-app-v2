import { defineChain } from "viem";

export const callisto = defineChain({
  id: 820,
  name: 'Callisto Network',
  network: 'callisto',
  nativeCurrency: {
    decimals: 18,
    name: 'Callisto',
    symbol: 'CLO',
  },
  rpcUrls: {
    public: { http: ['https://rpc.callistodao.org'] },
    default: { http: ['https://rpc.callistodao.org'] },
  },
  blockExplorers: {
    default: { name: 'CallistoScan', url: 'https://explorer.callisto.network' },
  },
  contracts: {
    multicall3: {
      address: '0xA8873640557a928016bFaf8d5D8B98f042A479C9'
    },
  },
});
