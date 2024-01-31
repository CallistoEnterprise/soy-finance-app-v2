import { create } from "zustand";
import { Pair } from "@callisto-enterprise/soy-sdk";

interface PairsWithLiquidityStore {
  pairsWithLiquidity: Pair[],
  pairsWithLiquidityLoading: boolean,
  setPairsWithLiquidity: (pairs: Pair[]) => void,
  setPairsWithLiquidityLoading: (isLoading: boolean) => void
}

export const usePairsWithLiquidityStore = create<PairsWithLiquidityStore>((set, get) => ({
  pairsWithLiquidity: [],
  pairsWithLiquidityLoading: true,
  setPairsWithLiquidity: (pairsWithLiquidity) => set({pairsWithLiquidity}),
  setPairsWithLiquidityLoading: (pairsWithLiquidityLoading) => set({pairsWithLiquidityLoading})
}));
