import { create } from "zustand";
import { Address } from "viem";

type AwaitingDialogContext = "change-network" | "swap" | "approve" | "add-liquidity" | "remove-liquidity" | "stake" | "unstake";
type SupportedChainId = 61 | 820 | 199;
interface AwaitingDialogStore {
  // context: AwaitingDialogContext,
  label: string,
  chainId: SupportedChainId | null,
  isOpened: boolean,
  setOpened: (label: string) => void,
  toggleOpened: () => void
  setClose: () => void,
  isSubmitted: boolean,
  setSubmitted: (hash: Address, chainId: SupportedChainId) => void,
  hash: Address | undefined
}

export const useAwaitingDialogStore = create<AwaitingDialogStore>()((set, get) => ({
  // context: "change-network",
  label: "Changing network",
  isOpened: false,
  isSubmitted: false,
  hash: undefined,
  chainId: null,

  setOpened: (label) => set({
    label,
    isOpened: true,
    isSubmitted: false,
    hash: undefined
  }),
  setClose: () => set({isOpened: false}),
  toggleOpened: () => set({isOpened: !get().isOpened}),
  setSubmitted: (hash: Address, chainId: SupportedChainId) => set({isSubmitted: true, hash, chainId})
}));
