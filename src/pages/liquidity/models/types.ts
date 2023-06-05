import {SwapToken} from "../../swap/models/types";

export type LiquidityInputData = {
  tokenFrom: SwapToken | null,
  tokenTo: SwapToken | null,
  amountIn: string,
  amountOut: string,
}
