import {createEvent} from "effector";
import {SwapToken} from "../../swap/models/types";
import {Pair} from "@callisto-enterprise/soy-sdk";
import {WrappedTokenInfo} from "../../swap/hooks/useTrade";

export const setLiquidityFirstToken = createEvent<SwapToken | null>("Set swap token from");
export const setLiquiditySecondToken = createEvent<SwapToken | null>("Set swap token to");

export const setLiquidityAmountIn = createEvent<string>("Set swap token from");
export const setLiquidityAmountOut = createEvent<string>("Set swap token to");

export const openRemoveLiquidityDialog = createEvent("Opens the remove liquidity dialog");
export const closeRemoveLiquidityDialog = createEvent("Closes the remove liquidity dialog");

export const openImportPoolDialog = createEvent("Opens the remove liquidity dialog");
export const closeImportPoolDialog = createEvent("Closes the remove liquidity dialog");

export const setPairsWithLiquidityLoading = createEvent<boolean>("Set state of pairs loading");
export const setPairsWithLiquidity = createEvent<Pair[]>("Set pairs with liquidity found");

export const setImportTokenA = createEvent<WrappedTokenInfo>("");
export const setImportTokenB = createEvent<WrappedTokenInfo>("");
