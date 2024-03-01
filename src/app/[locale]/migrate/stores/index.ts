import { WrappedToken } from "@/config/types/WrappedToken";
import { create } from "zustand";
import { parseUnits } from "viem";
import { tokensInClo, wclo } from "@/config/token-lists/tokenListInCLO";

interface MigrateTokensStore {
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
  setTokenFrom: (token: WrappedToken) => void,
  setTokenTo: (token: WrappedToken) => void,
  switchTokens: () => void
}

export  const soyToken = new WrappedToken(
  tokensInClo.soy.chainId,
  tokensInClo.soy.address,
  tokensInClo.soy.decimals,
  tokensInClo.soy.symbol,
  tokensInClo.soy.name,
  tokensInClo.soy.logoURI
)

export const cloeToken = new WrappedToken(
  tokensInClo.cloe.chainId,
  tokensInClo.cloe.address,
  tokensInClo.cloe.decimals,
  tokensInClo.cloe.symbol,
  tokensInClo.cloe.name,
  tokensInClo.cloe.logoURI
)

export const slofiToken = new WrappedToken(
  tokensInClo.slofi.chainId,
  tokensInClo.slofi.address,
  tokensInClo.slofi.decimals,
  tokensInClo.slofi.symbol,
  tokensInClo.slofi.name,
  tokensInClo.slofi.logoURI
);

export const ceToken = new WrappedToken(
  tokensInClo.ce.chainId,
  tokensInClo.ce.address,
  tokensInClo.ce.decimals,
  tokensInClo.ce.symbol,
  tokensInClo.ce.name,
  tokensInClo.ce.logoURI
);

export const clo = new WrappedToken(
  820,
  wclo.address,
  wclo.decimals,
  wclo.symbol,
  wclo.name,
  wclo.logoURI
)

export const useMigrateTokensStore = create<MigrateTokensStore>((set, get) => ({
  tokenFrom: cloeToken,
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
  tokenFrom: soyToken,
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

export const useCLOMigrateTokensStore = create<CLOMigrateAmountsStore>((set, get) => ({
  migrationRate: 10000,
  tokenFrom: clo,
  tokenTo: ceToken,

  setTokenFrom: (token) => {
    if(token.symbol == tokensInClo.cloe.symbol)
      set({migrationRate: 200000});  // 1 CLOE = 20 CE
    else
      set({migrationRate: 10000});  // 1 CLO = 1 CE
    set({tokenFrom: token});
  }
  //setTokenTo: (token) => set({tokenTo: token}),
  //switchTokens: () => set({tokenFrom: get().tokenTo, tokenTo: get().tokenFrom})
}));

interface CLOMigrateAmountsStore {
  migrationRate: number,
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
  setTokenFrom: (token: WrappedToken) => void,
  //setTokenTo: (token: WrappedToken) => void,
  //switchTokens: () => void
}

interface StakingMigrateTokensStore {
  tokenFrom: WrappedToken,
  tokenTo: WrappedToken,
}

export const useStakingMigrateTokensStore = create<StakingMigrateTokensStore>((set, get) => ({
  tokenFrom: soyToken,
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
