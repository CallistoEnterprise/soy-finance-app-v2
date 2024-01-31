import { WrappedToken } from "@/config/types/WrappedToken";
import { create } from "zustand";
import { parseUnits } from "viem";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";

interface MigrateTokensStore {
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
  setTokenFrom: (token: WrappedToken) => void,
  setTokenTo: (token: WrappedToken) => void,
  switchTokens: () => void
}


export  const test1Token = new WrappedToken(
  820,
  tokensInClo.soy.address,
  tokensInClo.soy.decimals,
  tokensInClo.soy.symbol,
  tokensInClo.soy.name,
  tokensInClo.soy.logoURI
)

export const test2Token = new WrappedToken(
  820,
  tokensInClo.cloe.address,
  tokensInClo.cloe.decimals,
  tokensInClo.cloe.symbol,
  tokensInClo.cloe.name,
  tokensInClo.cloe.logoURI
)

export const slofiToken = new WrappedToken(
  820,
  "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D",
  18,
  "SLOFI",
  "Sloth Finance Token",
  "/images/all-tokens/SLOFI.svg"
);

export const useMigrateTokensStore = create<MigrateTokensStore>((set, get) => ({
  tokenFrom: test1Token,
  tokenTo: slofiToken,

  setTokenFrom: (token) => set({tokenFrom: token}),
  setTokenTo: (token) => set({tokenTo: token}),
  switchTokens: () => set({tokenFrom: get().tokenTo, tokenTo: get().tokenFrom})
}));

interface MigrateAmountsStore {
  amountIn: bigint | null,
  amountOut: bigint | null,
  amountInString: string,
  amountOutString: string,
  setAmountIn: (amount: string, decimals?: number) => void,
  setAmountOut: (amount: string, decimals?: number) => void,
}

export const useMigrateAmountsStore = create<MigrateAmountsStore>((set, get) => ({
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


interface IDOMigrateTokensStore {
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
}

export const useIDOMigrateTokensStore = create<IDOMigrateTokensStore>((set, get) => ({
  tokenFrom: test1Token,
  tokenTo: slofiToken,
}));

interface IDOMigrateAmountsStore {
  amountIn: bigint | null,
  amountOut: bigint | null,
  amountInString: string,
  amountOutString: string,
  setAmountIn: (amount: string, decimals?: number) => void,
  setAmountOut: (amount: string, decimals?: number) => void,
}

export const useIDOMigrateAmountsStore = create<IDOMigrateAmountsStore>((set, get) => ({
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

interface StakingMigrateTokensStore {
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
}

export const useStakingMigrateTokensStore = create<StakingMigrateTokensStore>((set, get) => ({
  tokenFrom: test1Token,
  tokenTo: slofiToken,
}));

interface StakingMigrateAmountsStore {
  amountIn: bigint | null,
  amountOut: bigint | null,
  amountInString: string,
  amountOutString: string,
  setAmountIn: (amount: string, decimals?: number) => void,
  setAmountOut: (amount: string, decimals?: number) => void,
}

export const useStakingMigrateAmountsStore = create<StakingMigrateAmountsStore>((set, get) => ({
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
