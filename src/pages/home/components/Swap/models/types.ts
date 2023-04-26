export type SwapToken = {
  token_address: string,
  original_name: string,
  decimal_token: number,
  imgUri: string
}

export enum SwapVariant {
  "exactIn",
  "exactOut"
}

export type SwapInputData = {
  tokenFrom: SwapToken | null,
  tokenTo: SwapToken | null,
  amountIn: string,
  amountOut: string,
  swapType: SwapVariant
}
