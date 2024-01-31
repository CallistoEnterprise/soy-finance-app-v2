import { WrappedToken } from "@/config/types/WrappedToken";
import { create } from "zustand";
import { parseUnits } from "viem";

interface RemoveLiquidityTokensStore {
  tokenA: WrappedToken | null,
  tokenB: WrappedToken | null,
  tokenLP: WrappedToken | null,
  setTokenA: (token: WrappedToken | null) => void,
  setTokenB: (token: WrappedToken | null) => void
  setTokenLP: (token: WrappedToken | null) => void
}

export const useRemoveLiquidityTokensStore = create<RemoveLiquidityTokensStore>((set, get) => ({
  tokenA: null,
  tokenB: null,
  tokenLP: null,
  setTokenA: (tokenA) => set({tokenA}),
  setTokenB: (tokenB) => set({tokenB}),
  setTokenLP: (tokenLP) => set({tokenLP}),
}));

interface RemoveLiquidityAmountsStore {
  amountA: bigint | null,
  amountB: bigint | null,
  amountLP: bigint | null,
  amountAString: string,
  amountBString: string,
  amountLPString: string,
  setAmountA: (amount: string, decimals?: number) => void,
  setAmountB: (amount: string, decimals?: number) => void,
  setAmountLP: (amount: string, decimals?: number) => void,
}

export const useRemoveLiquidityAmountsStore = create<RemoveLiquidityAmountsStore>((set, get) => ({
  amountA: null,
  amountB: null,
  amountLP: null,
  amountAString: "",
  amountBString: "",
  amountLPString: "",
  setAmountA: (amount, decimals) => {
    const stringObj = {amountAString: amount};

    if(decimals) {
      return set({amountA: parseUnits(amount, decimals), ...stringObj});
    }

    return set(stringObj);
  },
  setAmountB: (amount, decimals) => {
    const stringObj = {amountBString: amount};

    if(decimals) {
      return set({amountB: parseUnits(amount, decimals), ...stringObj});
    }

    return set(stringObj);
  },
  setAmountLP: (amount, decimals) => {
    const stringObj = {amountLPString: amount};

    if(decimals) {
      return set({amountLP: parseUnits(amount, decimals), ...stringObj});
    }

    return set(stringObj);
  },
}));
