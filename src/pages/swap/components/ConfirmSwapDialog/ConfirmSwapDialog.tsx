import React, {useMemo} from "react";
import styles from "./ConfirmSwapDialog.module.scss";
import {useSwapAction} from "../../hooks/useSwapAction";
import Button from "../../../../components/atoms/Button";
import {useEvent, useStore} from "effector-react";
import {$isSwapConfirmDialogOpened, $swapInputData, $swapRoute, $swapSlippage, $trade} from "../../models/stores";
import Svg from "../../../../components/atoms/Svg/Svg";
import {setSwapConfirmDialogOpened} from "../../models";
import {TradeType} from "@callisto-enterprise/soy-sdk";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import {formatBalanceToEight} from "../../../../shared/utils";
import Route from "../../../../components/molecules/Route";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {
  computeSlippageAdjustedAmounts,
  computeSlippageAdjustedAmountsOut,
  computeTradePriceBreakdown,
  ONE_BIPS
} from "../../functions";
import Text from "../../../../components/atoms/Text";

export default function ConfirmSwapDialog() {
  const { handleSwap } = useSwapAction();
  const swapInputData = useStore($swapInputData);
  const trade = useStore($trade);

  const {priceImpactWithoutFee} = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const route = useStore($swapRoute);

  const isSwapConfirmDialogOpened = useStore($isSwapConfirmDialogOpened);
  const setSwapConfirmDialogOpenedFn = useEvent(setSwapConfirmDialogOpened);

  const slippage = useStore($swapSlippage);

  const {priceIn} = useMemo(() => {
    const formattedPrice = trade?.executionPrice?.toSignificant(6);

    return {
      priceIn: formattedPrice
    }
  }, [trade]);

  const {priceOut} = useMemo(() => {
    const formattedPrice = trade?.executionPrice?.invert()?.toSignificant(6);

    return {
      priceOut: formattedPrice
    }
  }, [trade]);

  return <DrawerDialog isOpen={isSwapConfirmDialogOpened} onClose={() => setSwapConfirmDialogOpenedFn(false)}>

    <DialogHeader handleClose={() => setSwapConfirmDialogOpenedFn(false)} title="Confirm swap" />

    <div className={styles.dialogContent}>
      <div className={styles.tokens}>
        <div className={styles.tokenBlock}>
          <div className={styles.tokenName}>
            <img width={24} height={24} src={swapInputData.tokenFrom?.logoURI} alt={swapInputData.tokenFrom?.name} />
           {swapInputData.tokenFrom?.symbol}
          </div>
          <Text variant={20} weight={700}>
             {formatBalanceToEight(swapInputData.amountIn)}
          </Text>
        </div>
        <div className={styles.arrowTo}>
          <Svg iconName="arrow-right" />
        </div>
        <div className={styles.tokenBlock}>
          <div className={styles.tokenName}>
            <img width={24} height={24} src={swapInputData.tokenTo?.logoURI} alt={swapInputData.tokenTo?.name} />
            {swapInputData.tokenTo?.symbol}
          </div>
          <Text variant={20} weight={700}>
            {formatBalanceToEight(swapInputData.amountOut)}
          </Text>

        </div>
      </div>

      <p className="mt-20 mb-20 font-secondary font-400 font-14 text-center">Output it estimated. You will receive at least {swapInputData.amountOut} {swapInputData.tokenTo?.symbol} or the transaction will revert</p>

      <div className={styles.bottomInfo}>
        <div className={styles.infoRow}>
          <span>1 {swapInputData.tokenTo?.symbol} price</span>
          <span>{priceOut} {swapInputData.tokenFrom?.symbol}</span>
        </div>

        <div className={styles.infoRow}>
          <span>1 {swapInputData.tokenFrom?.symbol} price</span>
          <span>{priceIn} {swapInputData.tokenTo?.symbol}</span>
        </div>

        <div className={styles.infoRow}>
        <span>
          {trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
        </span>
          <span>
          {!trade && "—"}
            {trade?.tradeType === TradeType.EXACT_INPUT
              ? `${computeSlippageAdjustedAmounts(trade, slippage)} ${swapInputData.tokenTo?.symbol}`
              : `${computeSlippageAdjustedAmountsOut(trade || undefined, slippage)} ${swapInputData.tokenTo?.symbol}`
            }
        </span>
        </div>

        <div className={styles.infoRow}>
          <span>Price impact</span>
          {priceImpactWithoutFee ? (priceImpactWithoutFee.lessThan(ONE_BIPS) ? '< 0.01%' : `${priceImpactWithoutFee.toFixed(2)}%`) : '—'}
        </div>

        <div className={styles.infoRow}>
          <span>Route</span>
          <Route route={route} />
        </div>
      </div>
      <div className={styles.buttons}>
        <Button fullWidth variant="outlined" onClick={() => setSwapConfirmDialogOpenedFn(false)}>Cancel</Button>
        <Button fullWidth onClick={handleSwap}>Swap</Button>
      </div>
    </div>

  </DrawerDialog>;
}
