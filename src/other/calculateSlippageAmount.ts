export default function calculateSlippageAmount(amountOut: bigint, slippage: number) {
  return amountOut * (BigInt(1000) - BigInt(slippage * 10)) / BigInt(1000);
}
