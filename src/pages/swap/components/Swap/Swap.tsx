import React, {useEffect, useMemo, useState} from "react";
import {
  BigintIsh,
  ChainId,
  CurrencyAmount,
  Fraction,
  JSBI,
  Percent,
  TokenAmount,
  Trade,
  TradeType
} from "@callisto-enterprise/soy-sdk";
import {useEvent, useStore} from "effector-react";
import styles from "./Swap.module.scss";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import Button from "../../../../components/atoms/Button";
import {$swapInputData, $swapRoute, $swapSlippage, $trade} from "../../models/stores";
import {
  changeOrder,
  resetInputData,
  setAmountIn,
  setAmountOut,
  setSwapConfirmDialogOpened,
  setSwapSettingsDialogOpened,
  setTokenFrom,
  setTokenTo
} from "../../models";
import {isNativeToken} from "../../../../shared/utils";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import {useTrade} from "../../hooks/useTrade";
import {useSwapAction} from "../../hooks/useSwapAction";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useSwapApprove} from "../../hooks/useSwapApprove";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import useNetworkSectionBalance from "../../../../shared/hooks/useNetworkSectionBalance";
import SwapSettingsDialog from "../SwapSettingsDialog";
import ConfirmSwapDialog from "../ConfirmSwapDialog";
import InfoRow from "../../../../components/atoms/InfoRow";
import PageCard from "../../../../components/atoms/PageCard";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import Route from "../../../../components/molecules/Route";
import Text from "../../../../components/atoms/Text";
import Switch from "../../../../components/atoms/Switch";

export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

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

  return {priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount}
}

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


export default function Swap() {
  const { isActive, chainId, isSupportedSwapNetwork, changeNetwork } = useWeb3();
  const swapInputData = useStore($swapInputData);

  useEffect(() => {
    resetInputDataFn();
    // setTradeFn(null);

  }, [chainId]);

  const [tradeType, setTradeType] = useState(TradeType.EXACT_INPUT);
  const [showInverted, setShowInverted] = useState(false);
  const { handleApprove, approved } = useSwapApprove({ token: swapInputData.tokenFrom });
  const setTokenFromFn = useEvent(setTokenFrom);
  const setTokenToFn = useEvent(setTokenTo);
  const setAmountInFn = useEvent(setAmountIn);
  const setAmountOutFn = useEvent(setAmountOut);
  const resetInputDataFn = useEvent(resetInputData);

  const setSwapSettingsDialogOpenedFn = useEvent(setSwapSettingsDialogOpened);

  const trade = useStore($trade);
  const route = useStore($swapRoute);
  const slippage = useStore($swapSlippage);

  const {contracts, network} = useNetworkSectionBalance({chainId});

  const setSwapConfirmDialogOpenedFn = useEvent(setSwapConfirmDialogOpened);

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

  const {priceImpactWithoutFee, realizedLPFee} = useMemo(() => computeTradePriceBreakdown(trade), [trade])

  const changeOrderFn = useEvent(changeOrder);

  const [isFromTokenPickDialogOpened, setFromTokenPickDialogOpened] = useState(false);
  const [isToTokenPickDialogOpened, setToTokenPickDialogOpened] = useState(false);

  const [checked, setChecked] = useState(true);

  const {
    recalculateTradeOut,
    recalculateTradeIn
  } = useTrade();

  const isEnoughBalance = useMemo(() => {
    if(!swapInputData.tokenFrom) {
      return false;
    }

    const balance = isNativeToken(swapInputData.tokenFrom.token_address)
      ? network?.balance
      : contracts?.find(c => c.symbol === swapInputData.tokenFrom?.original_name)?.balance;

    if(!+balance) {
      return false;
    }


    if(+balance < +swapInputData.amountIn) {
      return false;
    }

    return true;
  }, [swapInputData.tokenFrom, swapInputData.amountIn, contracts, network]);

  const receiveOrSold = useMemo(() => {
    if(!trade) {
      return "—"
    }

    return trade?.tradeType === TradeType.EXACT_INPUT
      ? computeSlippageAdjustedAmounts(trade, slippage)
      : computeSlippageAdjustedAmountsOut(trade || undefined, slippage)
  }, [trade, slippage]);

  if(chainId && !isSupportedSwapNetwork) {
    return <div className="paper">
      <p className={styles.isNotSupported}>Swap is not supported via this chain</p>

      <div className="center mt-20">
        <Button onClick={() => changeNetwork(820)}>Change to Callisto</Button>
      </div>
    </div>
  }

  return <PageCard>
    <PageCardHeading title="Swap" content={<div className={styles.settings}>
      <Text variant={14}>PRO mode</Text>
      <>
        <Switch checked={checked} setChecked={() => setChecked(!checked)} />
        <IconButton onClick={() => {
          setSwapSettingsDialogOpenedFn(true);
        }}>
          <Svg iconName="filter" />
        </IconButton>
      </>
    </div>} />
    <SwapSettingsDialog />

    <TokenSelector
      setDialogOpened={setFromTokenPickDialogOpened}
      isDialogOpened={isFromTokenPickDialogOpened}
      pickedToken={swapInputData.tokenFrom}
      inputValue={swapInputData.amountIn}
      label="From"
      handleInputChange={(amount) => {
        setAmountInFn(amount);
        setTradeType(TradeType.EXACT_INPUT);
        recalculateTradeIn(amount, swapInputData.tokenFrom);
      }}
      handleTokenChange={(token) => {
        setTokenFromFn(token);
        if(tradeType === TradeType.EXACT_INPUT) {
          if (swapInputData.amountIn && swapInputData.tokenTo) {
            recalculateTradeIn(swapInputData.amountIn, token, swapInputData.tokenTo);
          }
        }

        if(tradeType === TradeType.EXACT_OUTPUT) {
          if(swapInputData.amountOut && swapInputData.tokenFrom) {
            recalculateTradeOut(swapInputData.amountOut, token, swapInputData.tokenFrom);
          }
        }
      }}
    />

    <div className={styles.changeOrder}>
      <IconButton variant="action" onClick={async () => {
        changeOrderFn();
        await recalculateTradeIn(swapInputData.amountOut, swapInputData.tokenTo, swapInputData.tokenFrom);
      }}>
        <Svg iconName="swap"/>
      </IconButton>
    </div>

    <TokenSelector
      setDialogOpened={setToTokenPickDialogOpened}
      isDialogOpened={isToTokenPickDialogOpened}
      pickedToken={swapInputData.tokenTo}
      inputValue={swapInputData.amountOut}
      label="To"
      handleInputChange={(amount) => {
        setAmountOutFn(amount);
        setTradeType(TradeType.EXACT_OUTPUT);
        recalculateTradeOut(amount, swapInputData.tokenTo);
      }}
      handleTokenChange={(token) => {
        setTokenToFn(token);
        if(tradeType === TradeType.EXACT_INPUT) {
          if(swapInputData.amountIn && swapInputData.tokenFrom) {
            recalculateTradeIn(swapInputData.amountIn, swapInputData.tokenFrom, token);
          }
        }

        if(tradeType === TradeType.EXACT_OUTPUT) {
          if(swapInputData.amountOut && swapInputData.tokenFrom) {
            recalculateTradeOut(swapInputData.amountOut, token, swapInputData.tokenFrom);
          }
        }

      }}
    />

    <div className={styles.summary}>
      <InfoRow label="Price" value={<span className={styles.priceContent}>
          {showPrice && <>
            {label}
            <button className={styles.showInvertedButton} onClick={() => setShowInverted(!showInverted)}>
             <Svg iconName="swap" />
            </button>
          </> || "—"}
        </span>} />
      <InfoRow label="Slippage tolerance" value={`${slippage}%`} />
    </div>
    {!isActive && <ConnectWalletButton fullWidth/>}
    {isActive && <>
      {!+swapInputData.amountIn && <Button fullWidth variant="outlined" disabled>Enter amount</Button>}
      {+swapInputData.amountIn ? <>
        {(!swapInputData.tokenTo || !swapInputData.tokenFrom) &&
        <Button fullWidth variant="outlined" disabled>Select tokens to swap</Button>}
        {swapInputData.tokenTo && swapInputData.tokenFrom && <>
          {!isEnoughBalance && <Button fullWidth variant="outlined" disabled>Insufficient balance</Button>}
          {isEnoughBalance && <>
            {!approved
              ? <Button fullWidth variant="outlined"
                        onClick={(handleApprove)}>Enable {swapInputData.tokenFrom.original_name}</Button>
              : <Button fullWidth onClick={() => setSwapConfirmDialogOpenedFn(true)}>Swap</Button>}
          </>}
        </>}
      </> : null}
    </>}
    <div className={styles.bottomInfo}>
      <InfoRow label={trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'} value={receiveOrSold} />
      <InfoRow label="Price impact" value={priceImpactWithoutFee ? (priceImpactWithoutFee.lessThan(ONE_BIPS) ? '< 0.01%' : `${priceImpactWithoutFee.toFixed(2)}%`) : '—'} />
      <InfoRow label="Liquidity provider fee" value={realizedLPFee ? `${realizedLPFee?.toSignificant(6)} ${trade?.inputAmount.currency.symbol}` : '—'} />
      <InfoRow label="Route" value={<Route route={route} />} />
    </div>
    <ConfirmSwapDialog />
  </PageCard>;
}


