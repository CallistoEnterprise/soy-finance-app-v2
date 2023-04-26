import React, { useMemo, useState } from "react";
import {
  BigintIsh,
  ChainId,
  CurrencyAmount,
  Fraction,
  JSBI,
  Percent,
  TokenAmount,
  Trade, TradeType
} from "@callisto-enterprise/soy-sdk";
import {useEvent, useStore} from "effector-react";
import styles from "./Swap.module.scss";
import Switch from "../../../../shared/components/Switch";
import IconButton from "../../../../shared/components/IconButton";
import Svg from "../../../../shared/components/Svg/Svg";
import Button from "../../../../shared/components/Button";
import {$swapInputData, $swapRoute, $swapTokens, $trade} from "./models/stores";
import {changeOrder, setAmountIn, setAmountOut, setTokenFrom, setTokenTo} from "./models";
import {isNativeToken} from "../../../../shared/utils";
import SwapTokenCard from "../SwapTokenCard";
import {useTrade, WCLO_ADDRESS} from "./hooks/useTrade";
import {useSwapAction} from "./hooks/useSwapAction";

export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

function getAddress(address) {
  if(isNativeToken(address)) {
    return WCLO_ADDRESS;
  }

  return address;
}


const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes price breakdown for the trade
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
      trade.route.pairs.reduce<Fraction | BigintIsh>(
        (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
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

export function basisPointsToPercent(num: number): Percent {
  return new Percent(
    JSBI.BigInt(num),
    JSBI.BigInt(10000)
  );
}

function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.minimumAmountOut(pct).toSignificant(4);
}


function computeSlippageAdjustedAmountsOut(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.maximumAmountIn(pct).toSignificant(4);
}


export default function Swap() {
  const swapInputData = useStore($swapInputData);

  const [showInverted, setShowInverted] = useState(false);

  const setTokenFromFn = useEvent(setTokenFrom);
  const setTokenToFn = useEvent(setTokenTo);
  const setAmountInFn = useEvent(setAmountIn);
  const setAmountOutFn = useEvent(setAmountOut);

  const trade = useStore($trade);
  const route = useStore($swapRoute);

  console.log(route);

  const {showPrice, label} = useMemo(() => {
    const show = Boolean(trade?.executionPrice?.baseCurrency && trade?.executionPrice?.quoteCurrency)

    const formattedPrice = showInverted ? trade?.executionPrice?.toSignificant(6) : trade?.executionPrice?.invert()?.toSignificant(6);
    const tokensLabel = showInverted
      ? `${trade?.executionPrice?.quoteCurrency?.symbol} per ${trade?.executionPrice?.baseCurrency?.symbol}`
      : `${trade?.executionPrice?.baseCurrency?.symbol} per ${trade?.executionPrice?.quoteCurrency?.symbol}`;

    const priceLabel = `${formattedPrice || "-"} ${tokensLabel}`;

    return {
      showPrice: show,
      label: priceLabel
    }
  }, [trade, showInverted]);

  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])

  const changeOrderFn = useEvent(changeOrder);
  const [checked, setChecked] = useState(false);

  const [isFromTokenPickDialogOpened, setFromTokenPickDialogOpened] = useState(false);
  const [isToTokenPickDialogOpened, setToTokenPickDialogOpened] = useState(false);

  const {
    recalculateTradeOut,
    recalculateTradeIn
  } = useTrade();

  const allowedSlippage = 0.5;

  const {handleSwap} = useSwapAction();

  return <div className="paper">
    <div className={styles.swapHeader}>
      <h1 className="font-32 bold font-primary">Swap</h1>
      <div className={styles.settings}>
        <span className="font-14 font-primary">PRO mode</span>
        <Switch checked={checked} setChecked={() => setChecked(!checked)} />
        <IconButton onClick={() => {
          console.log("Filters")
        }}>
          <Svg iconName="filters" />
        </IconButton>
      </div>
    </div>

    <SwapTokenCard
      setDialogOpened={setFromTokenPickDialogOpened}
      isDialogOpened={isFromTokenPickDialogOpened}
      pickedToken={swapInputData.tokenFrom}
      inputValue={swapInputData.amountIn}
      setToken={setTokenFromFn}
      handleInputChange={setAmountInFn}
      recalculateTrade={recalculateTradeIn}
    />

    <div className={styles.changeOrder}>
      <IconButton variant="action" onClick={async () => {
        changeOrderFn();
        await recalculateTradeIn(swapInputData.amountOut, swapInputData.tokenTo, swapInputData.tokenFrom);
      }}>
        <Svg iconName="swap" />
      </IconButton>
    </div>

    <SwapTokenCard
      setDialogOpened={setToTokenPickDialogOpened}
      isDialogOpened={isToTokenPickDialogOpened}
      pickedToken={swapInputData.tokenTo}
      inputValue={swapInputData.amountOut}
      setToken={setTokenToFn}
      handleInputChange={setAmountOutFn}
      recalculateTrade={recalculateTradeOut}
    />

    <div className={styles.summary}>
      <div className={styles.infoRow}>
        <span>Price</span>
        <span className={styles.priceContent}>
          {showPrice && label || "-"}
          <IconButton variant="default" onClick={() => setShowInverted(!showInverted)}>
            <Svg iconName="swap" />
          </IconButton>
        </span>
      </div>
      <div className={styles.infoRow}>
        <span>Slippage tolerance</span>
        <span>0.5%</span>
      </div>
    </div>
    {!swapInputData.tokenTo || !swapInputData.tokenFrom ? <Button
      variant="outlined"
      disabled={!swapInputData.tokenTo || !swapInputData.tokenFrom}
      fullWidth
      mode="default"
    >
      Enter an amount
     </Button> :
      <Button onClick={handleSwap} mode="default">
        Swap
     </Button>}
    <div className={styles.bottomInfo}>
      <div className={styles.infoRow}>
        <span>
          {trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
        </span>
        <span>
          {trade?.tradeType === TradeType.EXACT_INPUT
            ? computeSlippageAdjustedAmounts(trade, 0.5)
            : computeSlippageAdjustedAmountsOut(trade || undefined, 0.5)
          }
        </span>
      </div>
      <div className={styles.infoRow}>
        <span>Price impact</span>
        {priceImpactWithoutFee ? (priceImpactWithoutFee.lessThan(ONE_BIPS) ? '< 0.01%' : `${priceImpactWithoutFee.toFixed(2)}%`) : '-'}
      </div>
      <div className={styles.infoRow}>
        <span>Liquidity provider fee</span>
        <span>{realizedLPFee ? `${realizedLPFee?.toSignificant(6)} ${trade?.inputAmount.currency.symbol}` : '-'}</span>
      </div>
      <div className={styles.infoRow}>
        <span>Route</span>
        <div>
          {route
            ? <div className={styles.route}>
              {route.path.map((r, index) => {
                return <><span key={r.symbol}>
                {r.symbol}
              </span>
                  {index !== route?.path.length - 1 && <Svg size={20} iconName="arrow-next"/>}</>;
              })}
            </div>
            : <span>—</span>}
        </div>
      </div>
    </div>
  </div>;
}


