import {createStore} from "effector";

export const $isStakeLPTokensDialogOpened = createStore<boolean>(false, {sid: "isStakeLPTokensDialogOpened"});
export const $isUnStakeLPTokensDialogOpened = createStore<boolean>(false, {sid: "isUnStakeLPTokensDialogOpened"});

export const $lpTokenToStake = createStore<any>(null);
export const $lpTokenToUnStake = createStore<any>(null);
