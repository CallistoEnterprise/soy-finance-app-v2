import {createEvent, createStore} from "effector";
import {LiquidityInputTokens, RemoveLiquidityTokens, TokenMetadata} from "./types";
import {Token, TokenAmount} from "@callisto-enterprise/soy-sdk";
import {WrappedTokenInfo} from "../../../pages/swap/hooks/useTrade";
import {LiquidityInputData} from "../../../pages/liquidity/models/types";

// export const $swapInputTokens = createStore<TransactionTokensMetadata>({
//   tokenA: null,
//   tokenB: null
// }, {sid: "swapInputTokens"});
//
// export const setSwapTokenA = createEvent<TokenMetadata>("Set tokenFrom for swap transaction");
// export const setSwapTokenB = createEvent<TokenMetadata>("Set tokenTo for swap transaction");
//
// $swapInputTokens.on(
//   setSwapTokenA,
//   (state, data) => {
//     return {...state, tokenA: data};
//   }
// );
//
// $swapInputTokens.on(
//   setSwapTokenB,
//   (state, data) => {
//     return {...state, tokenB: data};
//   }
// );

export const $liquidityInputTokens = createStore<LiquidityInputTokens>({
  tokenA: null,
  tokenB: null
}, {sid: "liquidityInputTokens"});

export const setLiquidityTokenA = createEvent<WrappedTokenInfo | null>("Set tokenFrom for swap transaction");
export const setLiquidityTokenB = createEvent<WrappedTokenInfo | null>("Set tokenTo for swap transaction");

$liquidityInputTokens.on(
  setLiquidityTokenA,
  (state, data) => {
    return {...state, tokenA: data};
  }
);

$liquidityInputTokens.on(
  setLiquidityTokenB,
  (state, data) => {
    return {...state, tokenB: data};
  }
);

export const $liquidityAmountA = createStore<string>("", {sid: "liquidityAmountA" });
export const $liquidityAmountB = createStore<string>("", {sid: "liquidityAmountB" });
export const setLiquidityAmountA = createEvent<string>("Set tokenA tokens amount for liquidity transaction");
export const setLiquidityAmountB = createEvent<string>("Set tokenB tokens amount for liquidity transaction");


$liquidityAmountA.on(
  setLiquidityAmountA,
  (state, data) => {
    return data;
  }
);

$liquidityAmountB.on(
  setLiquidityAmountB,
  (state, data) => {
    return data;
  }
);

export const $removeLiquidityInputTokens = createStore<RemoveLiquidityTokens>({
  tokenA: null,
  tokenB: null,
  lpToken: null
}, {sid: "removeLiquidityInputTokens"});

export const setRemoveLiquidityTokenA = createEvent<WrappedTokenInfo | null>("Set tokenA for remove liquidity transaction");
export const setRemoveLiquidityTokenB = createEvent<WrappedTokenInfo | null>("Set tokenB for remove liquidity transaction");
export const setRemoveLiquidityLPToken = createEvent<Token | null>("Set lp token for remove liquidity")

$removeLiquidityInputTokens.on(
  setRemoveLiquidityTokenA,
  (state, data) => {
    return {...state, tokenA: data};
  }
);

$removeLiquidityInputTokens.on(
  setRemoveLiquidityTokenB,
  (state, data) => {
    return {...state, tokenB: data};
  }
);

$removeLiquidityInputTokens.on(
  setRemoveLiquidityLPToken,
  (state, data) => {
    return {...state, lpToken: data};
  }
);

export const $removeLiquidityAmountA = createStore<string>("", {sid: "removeLiquidityAmountA" });
export const $removeLiquidityAmountB = createStore<string>("", {sid: "removeLiquidityAmountB" });
export const $removeLiquidityAmountLP = createStore<string>("", {sid: "removeLiquidityAmountLP" });

export const setRemoveLiquidityAmountA = createEvent<string>("Set tokenA tokens amount for remove liquidity transaction");
export const setRemoveLiquidityAmountB = createEvent<string>("Set tokenB tokens amount for remove liquidity transaction");
export const setRemoveLiquidityAmountLP = createEvent<string>("Set LP tokens amount for rempve liquidity transaction");

$removeLiquidityAmountA.on(
  setRemoveLiquidityAmountA,
  (state, data) => {
    return data;
  }
);

$removeLiquidityAmountB.on(
  setRemoveLiquidityAmountB,
  (state, data) => {
    return data;
  }
);

$removeLiquidityAmountLP.on(
  setRemoveLiquidityAmountLP,
  (state, data) => {
    return data;
  }
);

