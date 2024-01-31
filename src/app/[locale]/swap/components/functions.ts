import { BigintIsh, ChainId, CurrencyAmount, JSBI, Percent, TokenAmount, Trade } from "@callisto-enterprise/soy-sdk";

export function basisPointsToPercent(num: number): Percent {
  return new Percent(
    JSBI.BigInt(num || 0),
    JSBI.BigInt(10000)
  );
}

export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.minimumAmountOut(pct).toSignificant(4);
}

export function computeSlippageAdjustedAmountsOut(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.maximumAmountIn(pct).toSignificant(4);
}
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

export const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
export const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
export const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

export function computeTradePriceBreakdown(
  trade?: Trade | null,
  chainId = ChainId.MAINNET,
): {
  priceImpactWithoutFee: Percent | undefined
  realizedLPFee: CurrencyAmount | undefined | null
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
      trade.route.pairs.reduce(
        (currentFee) => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT,
      ),
    )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const numerator = priceImpactWithoutFeeFraction?.numerator as BigintIsh;

  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient, chainId))

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}
