import {createEvent, createStore} from "effector";

export const $walletDefaultTab = createStore(0, {sid: "walletDefaultTab"});
export const setWalletDefaultTab = createEvent<1 | 0>("");

$walletDefaultTab.on(setWalletDefaultTab, (_, data) => data);
