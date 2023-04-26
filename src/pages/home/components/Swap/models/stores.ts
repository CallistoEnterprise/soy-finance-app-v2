import {createStore} from "effector";
import {SwapInputData, SwapToken, SwapVariant} from "./types";
import {Route, Trade} from "@callisto-enterprise/soy-sdk";

export const $swapTokens = createStore<{
  tokenFrom: SwapToken | null,
  tokenTo: SwapToken | null
}>({
  tokenFrom: null,
  tokenTo: null
}, {
  sid: "swapTokens"
});

export const $swapInputData = createStore<SwapInputData>({
  tokenFrom: null,
  tokenTo: null,
  amountIn: "",
  amountOut: "",
  swapType: SwapVariant.exactIn
}, {sid: "swapInputData"})

export const $trade = createStore<Trade | null>(null, { sid: "trade" });

export const $swapRoute = createStore<Route | null>(null, { sid: "swapRoute" });

export const $isTradeOutLoading = createStore<boolean>(false, { sid: "isTradeOutLoading" });
export const $isTradeInLoading = createStore<boolean>(false, { sid: "isTradeInLoading" });

