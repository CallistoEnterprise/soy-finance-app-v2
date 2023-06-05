import {Token} from "@callisto-enterprise/soy-sdk";
import {WrappedTokenInfo} from "../../../pages/swap/hooks/useTrade";

export type TokenMetadata = {
  token_address: string,
  original_name: string,
  decimal_token: number,
  imgUri: string
}

export type LiquidityInputTokens = {
  tokenA: WrappedTokenInfo | null,
  tokenB: WrappedTokenInfo | null,
}

export type RemoveLiquidityTokens = {
  tokenA: WrappedTokenInfo | null,
  tokenB: WrappedTokenInfo | null,
  lpToken: Token | null
}
