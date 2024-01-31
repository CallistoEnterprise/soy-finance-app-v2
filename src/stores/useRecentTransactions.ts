import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Address } from "viem";

const localStorageKey = "recent-transactions";

export enum RecentTransactionStatus {
  PENDING,
  SUCCESS,
  ERROR
}

export interface RecentTransaction {
  status: RecentTransactionStatus,
  hash: Address,
  chainId: number,
  title: string,
  isViewed: boolean,
  account: Address
}

interface RecentTransactions {
  transactions: { [key: string]: Array<RecentTransaction> },
  isViewed: boolean,
  setIsViewed: (id: string, address: string, isViewed?: boolean) => void,
  addTransaction: (transaction: Omit<RecentTransaction, "status" | "id" | "isViewed">, account: string) => void,
  updateTransactionStatus: (id: string, status: RecentTransactionStatus, account: string) => void,
  clearTransactions: () => void
}

export const useRecentTransactionsStore = create<RecentTransactions>()(persist((set, get) => ({
  transactions: {},
  isViewed: true,
  addTransaction: (transaction, account) => set((state) => {
    const updatedTransactions = { ...state.transactions };

    const currentAccountTransactions = updatedTransactions[account];

    if (!currentAccountTransactions) {
      updatedTransactions[account] = [];
    }

    updatedTransactions[account] = [{
      ...transaction,
      status: RecentTransactionStatus.PENDING,
      isViewed: false
    }, ...updatedTransactions[account]];
    return { transactions: updatedTransactions, isViewed: false };
  }),
  updateTransactionStatus: (hash, status, account) => set((state) => {
    const transactionIndex = state.transactions[account].findIndex((_transaction) => {
      return _transaction.hash === hash;
    });

    if (transactionIndex !== -1) {
      const updatedTransactions = { ...state.transactions };
      updatedTransactions[account][transactionIndex] = { ...state.transactions[account][transactionIndex], status };

      return { transactions: updatedTransactions }
    }

    return {};
  }),
  setIsViewed: (hash, account, isViewed = true) => set((state) => {
    const transactionIndex = state.transactions[account].findIndex((_transaction) => {
      return _transaction.hash === hash;
    });

    if (transactionIndex !== -1) {
      const updatedTransactions = { ...state.transactions };
      updatedTransactions[account][transactionIndex] = { ...state.transactions[account][transactionIndex], isViewed };

      return { transactions: updatedTransactions }
    }

    return {};
  }),
  clearTransactions: () => set(() => {
    return { transactions: {} };
  })
}), {
  name: localStorageKey, // name of the item in the storage (must be unique)
}));


