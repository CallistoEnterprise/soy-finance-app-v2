import { create } from "zustand";

interface TokenGraphStore {
  liquidityGraphData: string[],
  liquidityLabelsData: Date[],
  liquidityGraphDataLoaded: boolean,
  setLiquidityGraphData: (liquidityGraphData: string[]) => void,
  setLiquidityLabelsData: (liquidityLabelsData: Date[]) => void,
  setLiquidityGraphDataLoaded: () => void,
}

export const useLiquidityGraphStore = create<TokenGraphStore>((set, get) => ({
  liquidityGraphData: [],
  liquidityLabelsData: [],
  liquidityGraphDataLoaded: false,
  setLiquidityGraphData: (liquidityGraphData) => set({liquidityGraphData}),
  setLiquidityLabelsData: (liquidityLabelsData) => set({liquidityLabelsData}),
  setLiquidityGraphDataLoaded: () => set({liquidityGraphDataLoaded: true}),
}));
