import {createEvent} from "effector";
import {SwapInputData, SwapToken} from "./types";
import {Route, Trade} from "@callisto-enterprise/soy-sdk";

export const setTokenFrom = createEvent<SwapToken | null>("Set swap token from");
export const setTokenTo = createEvent<SwapToken | null>("Set swap token to");

export const setAmountIn = createEvent<string>("Set swap token from");
export const setAmountOut = createEvent<string>("Set swap token to");

export const changeOrder = createEvent("Change input and output data");

export const setSwapInputData = createEvent<SwapInputData>("Set swap input data");

export const setTrade = createEvent<Trade | null>("Setting best trade so far");
export const setRoute = createEvent<Route | null>("Setting route based on best trade");

export const setTradeInLoading = createEvent<boolean>("Set value of tradeIn is loading");
export const setTradeOutLoading = createEvent<boolean>("Set value of tradeOut is loading");
