import {createStore} from "effector";
import {BalanceItem} from "../hooks/useNetworkSectionBalance";
import {RecentTransaction} from "./types";

export const $balances = createStore<{[key: string]: BalanceItem[]}>({}, {
  sid: "balances"
});

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
