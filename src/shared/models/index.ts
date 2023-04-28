import {createEvent} from "effector";
import {BalanceItem} from "../hooks/useNetworkSectionBalance";

export const pushBalance = createEvent<{account: string | null, value: BalanceItem}>("Push balance item after recieving");
export const updateBalance = createEvent<{account: string, chainId}>("Remove balance to load it next time");
export const resetBalance = createEvent("Reset all balances");

export const setWalletDialogOpened = createEvent<boolean>("Open or close wallet dialog");
