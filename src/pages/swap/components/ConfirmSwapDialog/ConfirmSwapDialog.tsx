import React, {useMemo} from "react";
import styles from "./ConfirmSwapDialog.module.scss";
import {useSwapAction} from "../../hooks/useSwapAction";
import Button from "../../../../components/atoms/Button";
import {useEvent, useStore} from "effector-react";
import {$isSwapConfirmDialogOpened, $swapInputData, $swapRoute, $swapSlippage, $trade} from "../../models/stores";
import {
  computeSlippageAdjustedAmounts,
  computeSlippageAdjustedAmountsOut,
  computeTradePriceBreakdown,
  ONE_BIPS
} from "../Swap/Swap";
import Svg from "../../../../components/atoms/Svg/Svg";
import Dialog from "../../../../components/molecules/Dialog";
import {setSwapConfirmDialogOpened} from "../../models";
import {TradeType} from "@callisto-enterprise/soy-sdk";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import {formatBalanceToEight} from "../../../../shared/utils";
import Route from "../../../../components/molecules/Route";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";

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
            <img width={24} height={24} src={swapInputData.tokenFrom?.imgUri} alt={swapInputData.tokenFrom?.original_name} />
            {swapInputData.tokenFrom?.original_name}
          </div>
          <span className="font-700 font-20">
            {formatBalanceToEight(swapInputData.amountIn)}
          </span>
        </div>
        <div className={styles.arrowTo}>
          <Svg iconName="arrow-right" />
        </div>
        <div className={styles.tokenBlock}>
          <div className={styles.tokenName}>
            <img width={24} height={24} src={swapInputData.tokenTo?.imgUri} alt={swapInputData.tokenTo?.original_name} />
            {swapInputData.tokenTo?.original_name}
          </div>
          <span className="font-700 font-20">
            {formatBalanceToEight(swapInputData.amountOut)}
          </span>

        </div>
      </div>

      <p className="mt-20 mb-20 font-secondary font-400 font-14 text-center">Output it estimated. You will receive at least 31.01234 BUSDT or the transaction will revert</p>

      <div className={styles.bottomInfo}>
        <div className={styles.infoRow}>
          <span>1 {swapInputData.tokenTo?.original_name} price</span>
          <span>{priceOut} {swapInputData.tokenFrom?.original_name}</span>
        </div>

        <div className={styles.infoRow}>
          <span>1 {swapInputData.tokenFrom?.original_name} price</span>
          <span>{priceIn} {swapInputData.tokenTo?.original_name}</span>
        </div>

        <div className={styles.infoRow}>
        <span>
          {trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
        </span>
          <span>
          {!trade && "—"}
            {trade?.tradeType === TradeType.EXACT_INPUT
              ? `${computeSlippageAdjustedAmounts(trade, slippage)} ${swapInputData.tokenTo?.original_name}`
              : `${computeSlippageAdjustedAmountsOut(trade || undefined, slippage)} ${swapInputData.tokenTo?.original_name}`
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
