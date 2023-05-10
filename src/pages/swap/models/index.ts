import {createEvent} from "effector";
import {SwapInputData, SwapToken} from "./types";
import {Route, Trade} from "@callisto-enterprise/soy-sdk";

export const setTokenFrom = createEvent<SwapToken | null>("Set swap token from");
export const setTokenTo = createEvent<SwapToken | null>("Set swap token to");

export const setAmountIn = createEvent<string>("Set swap token from");
export const setAmountOut = createEvent<string>("Set swap token to");

export const changeOrder = createEvent("Change input and output data");

export const setSwapInputData = createEvent<SwapInputData>("Set swap input data");
export const resetInputData = createEvent("Reset input data");

export const setTrade = createEvent<Trade | null>("Setting best trade so far");
export const setRoute = createEvent<Route | null>("Setting route based on best trade");

export const setTradeInLoading = createEvent<boolean>("Set value of tradeIn is loading");
export const setTradeOutLoading = createEvent<boolean>("Set value of tradeOut is loading");

export const setTokenSpendApproved = createEvent<boolean>("Set token spending approve");
export const setTokenSpendEnabling = createEvent<boolean>("Set token spending enabling status");
export const setTokenSpendRequesting = createEvent<boolean>("Set token spending requesting status");
export const setSwapSettingsDialogOpened = createEvent<boolean>("Open dialog for settings");

export const setSwapSlippage = createEvent<number>("Set slippage in percents");
export const setSwapDeadline = createEvent<number>("Set deadline in percents");

export const setFiatPrices = createEvent<{[key:string]: number}>("Set prices for chainId");

export const setSwapConfirmDialogOpened = createEvent<boolean>("Set opened or closer swap confirmation dialog");
export const setMobileChartOpened = createEvent<boolean>("Open or close mobile chart");
