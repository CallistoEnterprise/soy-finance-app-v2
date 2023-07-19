import {createEvent, createStore} from "effector";

type SavedPoolPair = [string, string];

export const $trackedPools = createStore<{[key: number]: SavedPoolPair[]} | null>(null, {sid: "trackedPools"});
export const setTrackedPairs = createEvent<{[key: number]: SavedPoolPair[]}>("");
export const addTrackedPair = createEvent<{chainId: number, pairToTrack: SavedPoolPair}>("");

$trackedPools.on(setTrackedPairs, (_, data) => data);

$trackedPools.on(addTrackedPair, (state, data) => {
  if(!state) {
    localStorage.setItem("trackedTokenPairs", JSON.stringify({}));
    return {};
  }

  if(!state[data.chainId]) {
    const newPoolsState = {...state, [data.chainId]: [data.pairToTrack]}
    localStorage.setItem("trackedTokenPairs", JSON.stringify(newPoolsState));
    return newPoolsState;
  }

  const newPoolsState = {...state, [data.chainId]: [...state[data.chainId], data.pairToTrack]}
  localStorage.setItem("trackedTokenPairs", JSON.stringify(newPoolsState));
  return newPoolsState;
});
