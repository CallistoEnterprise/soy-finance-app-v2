import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecentTransactionStatus } from "@/stores/useRecentTransactions";

const localStorageKey = "staking-migration-date";

interface StakingMigrationDate {
  date: Date | null,
  setDate: (date: Date) => void
}

export const useStakingMigrationDateStore = create<StakingMigrationDate>()(persist((set) => ({
  date: null,
  setDate: (date) => set({date})
}), {
  name: localStorageKey, // name of the item in the storage (must be unique)
}));
