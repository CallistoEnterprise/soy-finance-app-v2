import {createEvent, createStore} from "effector";
import {TradeHistory} from "./types";

const defaultTradeHistoryState: TradeHistory = {
  add: [],
  remove: [],
  swap: []
};

export const $tradeHistory = createStore<TradeHistory>(defaultTradeHistoryState, {sid: "tradeHistory"});
export const $isTradeHistoryLoaded = createStore<boolean>(false, {sid: "isTradeHistoryLoaded"});

export const setTradeHistory = createEvent<TradeHistory>("Set add, remove and swap trade history");
export const setTradeHistoryLoaded = createEvent<boolean>("Set true after trade history request");

$tradeHistory.on(setTradeHistory, (_, data) => data);
$isTradeHistoryLoaded.on(setTradeHistoryLoaded, (_, data) => data);
