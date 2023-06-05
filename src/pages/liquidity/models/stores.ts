import {createStore} from "effector";
import {SwapToken} from "../../swap/models/types";
import {LiquidityInputData} from "./types";
import {Pair} from "@callisto-enterprise/soy-sdk";
import {WrappedTokenInfo} from "../../swap/hooks/useTrade";

export const $liquidityTokens = createStore<{
  firstToken: SwapToken | null,
  secondToken: SwapToken | null
}>({
  firstToken: null,
  secondToken: null
}, {sid: "liquidityTokens"});

export const $liquidityInputData = createStore<LiquidityInputData>({
  tokenFrom: null,
  tokenTo: null,
  amountIn: "",
  amountOut: "",
}, {sid: "liquidityInputData"});

export const $removeLiquidityTokens = createStore<{
  tokenA: SwapToken | null,
  tokenB: SwapToken | null,
  lpToken: SwapToken | null
}>({
  tokenA: null,
  tokenB: null,
  lpToken: null
});


export const $isRemoveLiquidityDialogOpened = createStore<boolean>(false, {sid: "isRemoveLiquidityDialogOpened"});
export const $isImportPoolDialogOpened = createStore<boolean>(false, {sid: "isImportPoolDialogOpened"});

export const $pairsWithLiquidity = createStore< {pairs: Pair[], loading: boolean}>({pairs: [], loading: true}, {sid: "pairsWithLiquidity"});

export const $importTokenA = createStore<WrappedTokenInfo | null>(null, {sid: "importTokenA"});
export const $importTokenB = createStore<WrappedTokenInfo | null>(null, {sid: "importTokenB"});
