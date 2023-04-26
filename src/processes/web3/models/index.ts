import { createEvent } from "effector";
import { WalletType } from "../types";
import {BrowserProvider} from "ethers";
import {Provider} from "@ethersproject/providers";

export const setChainId = createEvent<number | null>("Set chain id for web3 connection");
export const setIsActive = createEvent<boolean | null>("Set is active prop for web3 connection");
export const setChangingNetwork = createEvent<boolean | null>("Set changingNetwork state");
export const setProvider = createEvent<Provider | null>("Set provider");
export const setWeb3Provider = createEvent<BrowserProvider | null>("Set web3Provider with new Web3Provider()");
export const setAccount = createEvent<string | null>("Set account for web3 connection");
export const setConnectionURI = createEvent<string | null>("Set connection url for walletConnect");
export const setWalletName = createEvent<WalletType | null>("Set wallet name: aw, metamask or walletConnect");
export const setIsSupportedNetwork = createEvent<boolean | null>("Set is bridge network supported");
export const setIsSupportedSwapNetwork = createEvent<boolean | null>("Set is swap network supported");
export const setBlockNumber = createEvent<number | null>("Set is swap network supported");
export const setChangingWallet = createEvent<boolean | null>("Set changing wallet");
export const setWalletChangeModalOpen = createEvent<boolean | null>("Toggle opening modal");

export const enableWc2Blockchain = createEvent<number>("Add wc2 blockchain to list");
export const disableWc2Blockchain = createEvent<number>("Remove wc2 blockchain from list");
export const setWc2Blockchains = createEvent<number[]>("Set list of wc2 blockchains");

