import {createEvent} from "effector";
import {Farm} from "../FarmsPage";

export const openStakeLPTokensDialog = createEvent("Opens the remove liquidity dialog");
export const closeStakeLPTokensDialog = createEvent("Closes the remove liquidity dialog");

export const openUnStakeLPTokensDialog = createEvent("Opens the remove liquidity dialog");
export const closeUnStakeLPTokensDialog = createEvent("Closes the remove liquidity dialog");

export const setLpTokenToStake = createEvent<Farm>("Any");
export const setLpTokenToUnStake = createEvent<Farm>("Any");

export const setFarmsUserData = createEvent<{[key:string]: {lpBalance: any, staked: any, reward: any}}>("Any");
