import { createStore } from "effector";
import { WalletType } from "../types";
import {BrowserProvider} from "ethers";

export const $chainId = createStore<number | null>(null, {
  sid: "chainId"
});

export const $isActive = createStore<boolean | null>(null, {
  sid: "isActive"
});

export const $isChangingNetwork = createStore<boolean | null>(null, {
  sid: "isChangingNetwork"
});

export const $provider = createStore<any>(null, {
  sid: "provider"
});

export const $web3Provider = createStore<BrowserProvider | null>(null, {
  sid: "web3Provider"
});

export const $account = createStore<string | null>(null, {
  sid: "account"
});

export const $connectionURI = createStore<string | null>(null, {
  sid: "connectionURI"
});

export const $walletName = createStore<WalletType | null>(null, {
  sid: "walletName"
});

export const $isSupportedNetwork = createStore<boolean | null>(null, {
  sid: "isSupportedNetwork"
});

export const $isSupportedSwapNetwork = createStore<boolean | null>(null, {
  sid: "isSupportedSwapNetwork"
});

export const $blockNumber = createStore<number | null>(null, {
  sid: "blockNumber"
});

export const $isChangingWallet = createStore<boolean | null>(false, {
  sid: "isChangingWallet"
});

export const $isWalletChangeModalOpened = createStore<boolean | null>(false, {
  sid: "isWalletChangeModalOpened"
});

export const $wc2blockchains = createStore<number[]>([], {
  sid: "wc2blockchains"
});

