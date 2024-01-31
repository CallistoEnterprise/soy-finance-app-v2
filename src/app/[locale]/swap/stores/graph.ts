import { create } from "zustand";
import {
  CandleGraphPoint, Timeline,
  TokensCandleGraphData,
  TokensGraphData,
  TokensGraphLabels
} from "@/app/[locale]/swap/stores/types";
import { values } from "idb-keyval";

interface TokenGraphStore {
  tokensGraphData: TokensGraphData,
  tokensCandleGraphData: TokensCandleGraphData,
  tokensLabelData: TokensGraphLabels,
  tokensGraphDataLoading: string[],
  setTokenGraphData: ({address, values, timeline}: {address: string, values: number[], timeline: string }) => void,
  setCandleGraphData: ({address, values, timeline}: {address: string, values: CandleGraphPoint[], timeline: string }) => void,
  setTokensLabelsData: ({address, values, timeline}: { address: string, values: Date[], timeline: Timeline }) => void,

  addLoadingTokenGraph: (address: string) => void,
  removeLoadingTokenGraph: (address: string) => void,
}

export const useTokenGraphStore = create<TokenGraphStore>((set, get) => ({
  tokensGraphData: {},
  tokensCandleGraphData: {},
  tokensLabelData: {},
  tokensGraphDataLoading: [],



  setTokenGraphData: ({ address, values, timeline }) => set({
    tokensGraphData: {
      ...get().tokensGraphData,
      [address]: {
        ...(get().tokensGraphData[address] && get().tokensGraphData[address]),
        [timeline]: values
      }
    }
  }),
  setCandleGraphData: ({ address, values, timeline }) => set({
    tokensCandleGraphData: {
      ...get().tokensCandleGraphData,
      [address]: {
        ...(get().tokensCandleGraphData[address] && get().tokensCandleGraphData[address]),
        [timeline]: values
      }
    }
  }),
  setTokensLabelsData: ({address, values, timeline}) => set({
    tokensLabelData: {
      ...get().tokensLabelData,
      [address]: {
        ...(get().tokensLabelData[address] && get().tokensLabelData[address]),
        [timeline]: values
      }
    }
  }),

  addLoadingTokenGraph: (value) => set({
    tokensGraphDataLoading: [...get().tokensGraphDataLoading, value]
  }),
  removeLoadingTokenGraph: (value) => set({
    tokensGraphDataLoading: get().tokensGraphDataLoading.filter((address) => address !== value)
  })
}));
