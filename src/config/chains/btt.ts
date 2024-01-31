import { defineChain } from "viem";

export const bttc = defineChain({
  id: 199,
  name: 'BitTorrent Chain Mainnet',
  network: 'bttc',
  nativeCurrency: {
    decimals: 18,
    name: 'BitTorrent',
    symbol: 'BTT',
  },
  rpcUrls: {
    public: { http: ['https://rpc.bt.io/', 'https://bttc.trongrid.io'] },
    default: { http: ['https://rpc.bt.io/'] },
  },
  blockExplorers: {
    default: { name: 'BttcScan', url: 'https://bttcscan.com/' }
  },
  contracts: {
    multicall3: {
      address: '0xdEe02B368eEDC16A92f20Df641b2b8Cf877D0aAf'
    },
  },
});
