import { create } from "zustand";
import { WrappedToken } from "@/config/types/WrappedToken";

interface FarmsUserDataStore {
  farmsUserData: any,
  setFarmsUserData: (farmsUserData: any) => void
}
export const useFarmsUserDataStore = create<FarmsUserDataStore>((set, get) => ({
  farmsUserData: {},

  setFarmsUserData: (farmsUserData) => set({farmsUserData})
}));
