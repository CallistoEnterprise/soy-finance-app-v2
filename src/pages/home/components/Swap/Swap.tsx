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
import IconButton from "../../../../shared/components/IconButton";
import Svg from "../../../../shared/components/Svg/Svg";
import Button from "../../../../shared/components/Button";
import {$swapInputData, $swapRoute, $swapSlippage, $trade} from "./models/stores";
import {
  changeOrder,
  resetInputData,
  setAmountIn,
  setAmountOut,
  setSwapInputData, setSwapSettingsDialogOpened,
  setTokenFrom,
  setTokenTo,
  setTrade
} from "./models";
import {isNativeToken} from "../../../../shared/utils";
import SwapTokenCard from "../SwapTokenCard";
import {useTrade} from "./hooks/useTrade";
import {useSwapAction} from "./hooks/useSwapAction";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useSwapApprove} from "./hooks/useSwapApprove";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import useNetworkSectionBalance from "../../../../shared/hooks/useNetworkSectionBalance";
import SwapSettingsDialog from "../SwapSettingsDialog";

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
  const { isActive, chainId, isSupportedSwapNetwork, changeNetwork } = useWeb3();
  const swapInputData = useStore($swapInputData);

  useEffect(() => {
    resetInputDataFn();
    // setTradeFn(null);

  }, [chainId]);

  const { showMessage } = useSnackbar();
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

  console.log(slippage);

  const {contracts, network} = useNetworkSectionBalance({chainId});


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

  const { handleSwap } = useSwapAction();

  function showComingSoon() {
    showMessage("Coming soon", "info");
  }

  if(chainId && !isSupportedSwapNetwork) {
    return <div className="paper">
      <p className={styles.isNotSupported}>Swap is not supported via this chain</p>

      <div className="center mt-20">
        <Button onClick={() => changeNetwork(820)}>Change to Callisto</Button>
      </div>
    </div>
  }

  return <div className="paper">
    <div className={styles.swapHeader}>
      <h1 className="font-32 bold font-primary">Swap</h1>
      <div className={styles.settings}>
        {/*<span className="font-14 font-primary">PRO mode</span>*/}
        {/*<Switch checked={checked} setChecked={() => setChecked(!checked)} />*/}
        <IconButton onClick={() => {
          setSwapSettingsDialogOpenedFn(true);
        }}>
          <Svg iconName="filters"/>
        </IconButton>
      </div>
      <SwapSettingsDialog />
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
        <Svg iconName="swap"/>
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
          {showPrice && <>
            {label}
            <button className={styles.showInvertedButton} onClick={() => setShowInverted(!showInverted)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.3498 10.8742C7.4998 11.0242 7.5748 11.1992 7.5748 11.3992C7.5748 11.5992 7.4998 11.7742 7.3498 11.9242L4.8498 14.4242L11.9998 14.4242C12.2165 14.4242 12.3956 14.4951 12.5373 14.6367C12.679 14.7784 12.7498 14.9576 12.7498 15.1742C12.7498 15.3909 12.679 15.5701 12.5373 15.7117C12.3956 15.8534 12.2165 15.9242 11.9998 15.9242L4.8498 15.9242L7.3748 18.4492C7.5248 18.5992 7.59563 18.7701 7.5873 18.9617C7.57897 19.1534 7.4998 19.3242 7.3498 19.4742C7.1998 19.6242 7.0248 19.6992 6.8248 19.6992C6.6248 19.6992 6.4498 19.6242 6.2998 19.4742L2.5248 15.6992C2.44146 15.6159 2.38313 15.5326 2.3498 15.4492C2.31647 15.3659 2.2998 15.2742 2.2998 15.1742C2.2998 15.0742 2.31647 14.9826 2.3498 14.8992C2.38313 14.8159 2.44146 14.7326 2.5248 14.6492L6.3248 10.8492C6.4748 10.6992 6.64563 10.6284 6.8373 10.6367C7.02897 10.6451 7.1998 10.7242 7.3498 10.8742ZM17.6998 4.52422L21.4748 8.29922C21.5581 8.38255 21.6165 8.46589 21.6498 8.54922C21.6831 8.63255 21.6998 8.72422 21.6998 8.82422C21.6998 8.92422 21.6831 9.01589 21.6498 9.09922C21.6165 9.18255 21.5581 9.26589 21.4748 9.34922L17.6748 13.1492C17.5248 13.2992 17.354 13.3701 17.1623 13.3617C16.9706 13.3534 16.7998 13.2742 16.6498 13.1242C16.4998 12.9742 16.4248 12.7992 16.4248 12.5992C16.4248 12.3992 16.4998 12.2242 16.6498 12.0742L19.1498 9.57422L11.9998 9.57422C11.7831 9.57422 11.604 9.50339 11.4623 9.36172C11.3206 9.22005 11.2498 9.04088 11.2498 8.82422C11.2498 8.60755 11.3206 8.42839 11.4623 8.28672C11.604 8.14505 11.7831 8.07422 11.9998 8.07422L19.1498 8.07422L16.6248 5.54922C16.4748 5.39922 16.404 5.22839 16.4123 5.03672C16.4206 4.84505 16.4998 4.67422 16.6498 4.52422C16.7998 4.37422 16.9748 4.29922 17.1748 4.29922C17.3748 4.29922 17.5498 4.37422 17.6998 4.52422Z"
                  fill="currentColor"/>
              </svg>
            </button>
          </> || "—"}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span>Slippage tolerance</span>
        <span>{slippage}%</span>
      </div>
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
                        onClick={handleApprove}>Enable {swapInputData.tokenFrom.original_name}</Button> :
              <Button fullWidth onClick={handleSwap}>Swap</Button>}
          </>}
        </>}
      </> : null}
    </>}
    <div className={styles.bottomInfo}>
      <div className={styles.infoRow}>
        <span>
          {trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
        </span>
        <span>
          {!trade && "—"}
          {trade?.tradeType === TradeType.EXACT_INPUT
            ? computeSlippageAdjustedAmounts(trade, slippage)
            : computeSlippageAdjustedAmountsOut(trade || undefined, slippage)
          }
        </span>
      </div>
      <div className={styles.infoRow}>
        <span>Price impact</span>
        {priceImpactWithoutFee ? (priceImpactWithoutFee.lessThan(ONE_BIPS) ? '< 0.01%' : `${priceImpactWithoutFee.toFixed(2)}%`) : '—'}
      </div>
      <div className={styles.infoRow}>
        <span>Liquidity provider fee</span>
        <span>{realizedLPFee ? `${realizedLPFee?.toSignificant(6)} ${trade?.inputAmount.currency.symbol}` : '—'}</span>
      </div>
      <div className={styles.infoRow}>
        <span>Route</span>
        <div>
          {route
            ? <div className={styles.route}>
              {route.path.map((r, index) => {
                return <React.Fragment key={index}><span key={r.symbol}>
                {r.symbol}
              </span>
                  {index !== route?.path.length - 1 && <Svg size={20} iconName="arrow-next"/>}</React.Fragment>;
              })}
            </div>
            : <span>—</span>}
        </div>
      </div>
    </div>
  </div>;
}


