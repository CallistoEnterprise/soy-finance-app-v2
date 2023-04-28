import {createStore} from "effector";
import {BalanceItem} from "../hooks/useNetworkSectionBalance";

export const $balances = createStore<{[key: string]: Array<BalanceItem>}>({}, {
  sid: "balances"
});

export const $isWalletDialogOpened = createStore<boolean>(false, {
  sid: "isWalletDialogOpened"
});
