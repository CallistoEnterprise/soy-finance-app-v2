import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

export const networks: {
  chainId: AvailableChains,
  name: string,
  logo: string
}[]= [
  {
    chainId: 820,
    name: "Callisto Network",
    logo: "/chains/callisto.svg"
  },
  {
    chainId: 199,
    name: "BitTorrent",
    logo: "/chains/btt.svg"
  },
  {
    chainId: 61,
    name: "Ethereum Classic",
    logo: "/chains/etc.svg"
  }
];

export const availableChainIds = [61, 199, 820];
