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

export const $tokenSpendApproved = createStore<boolean>(true, {sid: "tokenSpendApproved"});
export const $tokenSpendEnabling = createStore<boolean>(false, {sid: "tokenSpendEnabling"});
export const $tokenSpendRequesting = createStore<boolean>(false, {sid: "tokenSpendRequesting"});

export const $isSwapSettingsDialogOpened = createStore<boolean>(false, {sid: "isSwapSettingsDialogOpened"});

export const $swapDeadline = createStore<number>(20, {sid: "swapDeadline"});
export const $swapSlippage = createStore<number>(0.5, {sid: "swapSlippage"});

export const $swapFiatPrices = createStore<{[key: string]: number} | null>(null, {sid: "swapFiatPrices"});

export const $isSwapConfirmDialogOpened = createStore<boolean>(false, {sid: "isSwapConfirmDialogOpened"})

export const $isMobileChartOpened = createStore<boolean>(false, {sid: "isMobileChartOpened"});
