import { create } from "zustand";
import { WrappedToken } from "@/config/types/WrappedToken";
import { Trade, TradeType } from "@callisto-enterprise/soy-sdk";
import { parseUnits } from "viem";

interface SwapTokensStore {
  tokenFrom: WrappedToken | null,
  tokenTo: WrappedToken | null,
  setTokenFrom: (token: WrappedToken | null) => void,
  setTokenTo: (token: WrappedToken | null) => void,
  switchTokens: () => void
}

export const useSwapTokensStore = create<SwapTokensStore>((set, get) => ({
  tokenFrom: null,
  tokenTo: null,

  setTokenFrom: (token) => set({tokenFrom: token}),
  setTokenTo: (token) => set({tokenTo: token}),
  switchTokens: () => set({tokenFrom: get().tokenTo, tokenTo: get().tokenFrom})
}));

interface SwapAmountsStore {
  amountIn: bigint | null,
  amountOut: bigint | null,
  amountInString: string,
  amountOutString: string,
  setAmountIn: (amount: string, decimals?: number) => void,
  setAmountOut: (amount: string, decimals?: number) => void,
}

export const useSwapAmountsStore = create<SwapAmountsStore>((set, get) => ({
  amountIn: null,
  amountOut: null,
  amountInString: "",
  amountOutString: "",
  setAmountIn: (amount, decimals) => {
    const stringObj = {amountInString: amount};

    if(decimals) {
      return set({amountIn: parseUnits(amount, decimals), ...stringObj});
    }

    return set(stringObj);
  },
  setAmountOut: (amount, decimals) => {
    const stringObj = {amountOutString: amount};

    if(decimals) {
      return set({amountOut: parseUnits(amount, decimals), ...stringObj});
    }

    return set(stringObj);
  },
}));

interface TransactionSettingsStore {
  slippage: number,
  deadline: number,
  setSlippage: (slippage: number) => void,
  setDeadline: (deadline: number) => void,
}

export const useTransactionSettingsStore = create<TransactionSettingsStore>((set, get) => ({
  slippage: 0.5,
  deadline: 20,

  setSlippage: (slippage) => set({slippage}),
  setDeadline: (deadline) => set({deadline}),
}));

interface TradeStore {
  trade: Trade | null,
  tradeType: TradeType,

  setTrade: (trade: Trade | null) => void,
  setTradeType: (tradeType: TradeType) => void
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trade: null,
  tradeType: TradeType.EXACT_INPUT,

  setTrade: (trade) => set({trade}),
  setTradeType: (tradeType) => set({tradeType}),
}));
