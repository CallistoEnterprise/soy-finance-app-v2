import { create } from "zustand";
import { WrappedToken } from "@/config/types/WrappedToken";


interface ImportPoolStore {
  tokenA: WrappedToken | null,
  tokenB: WrappedToken | null,
  setTokenA: (token: WrappedToken) => void,
  setTokenB: (token: WrappedToken) => void
}

export const useImportPoolStore = create<ImportPoolStore>((set) => ({
  tokenA: null,
  tokenB: null,
  setTokenA: (tokenA) => set({tokenA}),
  setTokenB: (tokenB) => set({tokenB}),
}));
