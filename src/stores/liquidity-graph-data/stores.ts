import {createEvent, createStore} from "effector";

export const $liquidityGraphData = createStore<string[]>([], {sid: "liquidityGraphData"});
export const $liquidityLabelsData = createStore<Date[]>([], {sid: "liquidityLabelsData"});
export const $liquidityGraphDataLoaded = createStore<boolean>(false, {sid: "liquidityGraphDataLoaded"});

export const setLiquidityGraphData = createEvent<string[]>("Setting liquidity graphics data");
export const setLiquidityLabelsData = createEvent<Date[]>("Setting liquidity graphics data");
export const setLiquidityGraphDataLoaded = createEvent("Setting liquidity graphics data");

$liquidityGraphData.on(setLiquidityGraphData, (_, data) => data);
$liquidityLabelsData.on(setLiquidityLabelsData, (_, data) => data);

$liquidityGraphDataLoaded.on(setLiquidityGraphDataLoaded, () => true);
