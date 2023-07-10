import {createStore} from "effector";
import {RecentTransaction} from "./types";

export const $isWalletDialogOpened = createStore<boolean>(false, {
  sid: "isWalletDialogOpened"
});

type RecentTransactions = {
  [key: string]: RecentTransaction[]
}

export const $recentTransactions = createStore<RecentTransactions>({}, {
  sid: "recentTransactions"
});

type FavoriteTokens = {
  [key: number]: string[]
}

export const $favoriteTokens = createStore<FavoriteTokens>({}, {
  sid: "favoriteTokens"
});
