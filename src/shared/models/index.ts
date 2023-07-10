import {createEvent} from "effector";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import {RecentTransaction} from "./types";

export const setWalletDialogOpened = createEvent<boolean>("Open or close wallet dialog");

type RecentTransactions = {
  [key: string]: Array<RecentTransaction>
}

export const setRecentTransactions = createEvent<RecentTransactions>("Set all recent transactions");

export const addRecentTransaction = createEvent<{chainId: ChainId,
  hash: string,
  summary: string
}>("Add recent transaction");

export const editTransactionStatus = createEvent<{chainId: ChainId, hash: string, status: "pending" | "error" | "succeed"}>({});

export const resetTransactions = createEvent();

type FavoriteTokens = {
  [key: number]: string[]
}

export const setFavoriteTokens = createEvent<FavoriteTokens>("Favorite tokens init");

export const addFavoriteToken = createEvent<{chainId: ChainId, tokenAddress: string}>("Add favorite token to list");
export const removeFavoriteToken = createEvent<{chainId: ChainId, tokenAddress: string}>("Remove favorite token to list");
