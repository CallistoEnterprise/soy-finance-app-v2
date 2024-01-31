import { create } from "zustand";

interface ConfirmSwapDialogStore {
  isSwapConfirmDialogOpened: boolean,
  setSwapConfirmDialogOpened: (isSwapConfirmDialogOpened: boolean) => void
}

export const useConfirmSwapDialogStore = create<ConfirmSwapDialogStore>((set, get) => ({
  isSwapConfirmDialogOpened: false,
  setSwapConfirmDialogOpened: (isSwapConfirmDialogOpened) => set({isSwapConfirmDialogOpened})
}));
