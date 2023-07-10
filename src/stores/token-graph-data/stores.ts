import {createEvent, createStore} from "effector";
import {CandleGraphPoint, Timeline, TokensCandleGraphData, TokensGraphData, TokensGraphLabels} from "./types";


export const $tokensGraphData = createStore<TokensGraphData>({}, {sid: "tokensGraphData"});
export const $tokensCandleGraphData = createStore<TokensCandleGraphData>({}, {sid: "tokensCandleGraphData"});
export const $tokensLabelsData = createStore<TokensGraphLabels>({}, {sid: "tokensLabelsData"});
export const $tokensGraphDataLoading = createStore<string[]>([], {sid: "tokensGraphDataLoaded"});

export const setTokenGraphData = createEvent<{ address: string, values: number[], timeline: Timeline }>("Setting tokens graphics data");
export const setTokensCandleGraphData = createEvent<{address: string, values: CandleGraphPoint[], timeline: Timeline}>("Setting tokens graphics data");
export const setTokensLabelsData = createEvent<{ address: string, values: Date[], timeline: Timeline }>("Setting tokens graphics data");
export const addLoadingTokenGraph = createEvent<string>("Setting tokens graphics data");
export const removeLoadingTokenGraph = createEvent<string>("Setting tokens graphics data");

$tokensGraphData.on(setTokenGraphData, (state, data) => ({
  ...state,
  [data.address]: {
    ...(state[data.address] && state[data.address]),
    [data.timeline]: data.values
  }
}));
$tokensCandleGraphData.on(setTokensCandleGraphData, (state, data) => ({
  ...state,
  [data.address]: {
    ...(state[data.address] && state[data.address]),
    [data.timeline]: data.values
  }
}));

$tokensLabelsData.on(setTokensLabelsData, (state, data) => ({
  ...state,
  [data.address]: {
    ...(state[data.address] && state[data.address]),
    [data.timeline]: data.values
  }
}));

$tokensGraphDataLoading.on(addLoadingTokenGraph, (_, data) => [..._, data]);
$tokensGraphDataLoading.on(removeLoadingTokenGraph,
  (state, data) => state.filter((address) => address !== data));
