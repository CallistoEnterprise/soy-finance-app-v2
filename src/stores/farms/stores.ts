import {createEvent, createStore} from "effector";

export const $farms = createStore({
  820: [],
  199: [],
  61: []
});

export const setFarmsForChain = createEvent<{chainId, farms}>("Setting farms data for specific chain");

$farms.on(setFarmsForChain, (state, data) => ({...state, [data.chainId]: data.farms}));
