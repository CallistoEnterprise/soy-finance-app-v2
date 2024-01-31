import { create } from "zustand";
import { WrappedToken } from "@/config/types/WrappedToken";

interface StakeLPTokensStore {
  isStakeLPTokensDialogOpened: boolean,
  lpTokenToStake: any,
  setIsStakeLPTokensDialogOpened: (isOpened: boolean) => void,
  setLpTokenToStake: (token: any) => void
}

export const useStakeLPTokensStore = create<StakeLPTokensStore>((set, get) => ({
  isStakeLPTokensDialogOpened: false,
  lpTokenToStake: null,

  setIsStakeLPTokensDialogOpened: (isStakeLPTokensDialogOpened) => set({isStakeLPTokensDialogOpened}),
  setLpTokenToStake: (lpTokenToStake) => set({lpTokenToStake}),
}));

interface UnstakeLPTokensStore {
  isUnstakeLPTokensDialogOpened: boolean,
  lpTokenToUnstake: any | null,
  setIsUnstakeLPTokensDialogOpened: (isOpened: boolean) => void,
  setLpTokenToUnstake: (token: any) => void
}

export const useUnstakeLPTokensStore = create<UnstakeLPTokensStore>((set, get) => ({
  isUnstakeLPTokensDialogOpened: false,
  lpTokenToUnstake: null,

  setIsUnstakeLPTokensDialogOpened: (isUnstakeLPTokensDialogOpened) => set({isUnstakeLPTokensDialogOpened}),
  setLpTokenToUnstake: (lpTokenToUnstake) => set({lpTokenToUnstake}),
}));
