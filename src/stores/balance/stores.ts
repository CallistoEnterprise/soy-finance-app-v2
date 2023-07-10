import {createEvent, createStore} from "effector";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import {FixedNumber} from "ethers";

type NetworkBalance = {
  [key: string]: FixedNumber
}

type TokenBalances = {
  [key: ChainId]: NetworkBalance
}

export const $tokenBalances = createStore<TokenBalances>({}, {sid: "tokenBalances"});

export const setNetworkBalances = createEvent<{ balances: NetworkBalance, chainId: ChainId }>("Setting token balance for chain");
export const updateNetworkBalance = createEvent<NetworkBalance>("Update balance for network");

export const updateTokenBalance = createEvent<FixedNumber>("Update specific token balance");

export const $loadingTokens = createStore<string[]>([], {sid: "loadingTokens"});
export const $loadingChains = createStore<number[]>([], {sid: "loadingChains"});

export const addLoadingToken = createEvent<string>("Add single loading token");
export const addLoadingChain = createEvent<number>("Add network that balance is currently loading")

export const removeLoadingToken = createEvent<string>("Add single loading token");
export const removeLoadingChain = createEvent<number>("Add network that balance is currently loading")

$tokenBalances.on(setNetworkBalances,
  (_, data) => ({..._, [data.chainId]: data.balances}));

$loadingChains.on(addLoadingChain, (state, data) => [...state, data]);
$loadingTokens.on(addLoadingToken, (state, data) => [...state, data]);

$loadingChains.on(removeLoadingChain, (state, data) => state.filter((chain) => chain !== data));
$loadingTokens.on(removeLoadingToken, (state, data) => state.filter((address) => address !== data));


