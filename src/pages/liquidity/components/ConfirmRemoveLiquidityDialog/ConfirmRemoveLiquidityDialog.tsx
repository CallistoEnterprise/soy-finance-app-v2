import React, {useCallback} from "react";
import styles from "./ConfirmRemoveLiquidityDialog.module.scss";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityAmountA,
  $liquidityAmountB,
  $liquidityInputTokens, $removeLiquidityAmountA, $removeLiquidityAmountB, $removeLiquidityAmountLP,
  $removeLiquidityInputTokens
} from "../../../../shared/web3/models/init";
import {useLiquidity} from "../../models/hooks/useLiquidity";
import {$isConfirmAddLiquidityDialogOpened, $isConfirmRemoveLiquidityDialogOpened} from "../../models/stores";
import {setConfirmAddLiquidityDialogOpened, setConfirmRemoveLiquidityDialogOpened} from "../../models";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import Image from "next/image";
import {formatBalanceToEight, getLogo} from "../../../../shared/utils";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import {useRemoveLiquidity} from "../../models/hooks/useRemoveLiquidity";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import Svg from "../../../../components/atoms/Svg";
import {TradeType} from "@callisto-enterprise/soy-sdk";
import {computeSlippageAdjustedAmounts, computeSlippageAdjustedAmountsOut, ONE_BIPS} from "../../../swap/functions";
import Route from "../../../../components/molecules/Route";

function InfoRow({label, value}) {
  return <div className={styles.infoRow}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
}

export default function ConfirmRemoveLiquidityDialog() {
  const {tokenA, tokenB} = useStore($removeLiquidityInputTokens);
  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);
  const amountLP = useStore($removeLiquidityAmountLP);

  const {
    pair,
    removeLiquidity
  } = useRemoveLiquidity();

  const isOpen = useStore($isConfirmRemoveLiquidityDialogOpened);
  const setOpen = useEvent(setConfirmRemoveLiquidityDialogOpened);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return <DrawerDialog isOpen={isOpen} onClose={handleClose}>

    <DialogHeader handleClose={handleClose} title="You will receive" />

    <div className={styles.dialogContent}>
      <div className={styles.tokens}>
        <div className={styles.tokenBlock}>
          <div className={styles.tokenName}>
            <img width={24} height={24} src={getLogo({address: tokenA?.address.toLowerCase()})} alt="" />
            {tokenA?.symbol}
          </div>
          <Text variant={20} weight={700}>
            {amountA}
          </Text>
        </div>
        <div className={styles.arrowTo}>
          <Svg iconName="add-token" />
        </div>
        <div className={styles.tokenBlock}>
          <div className={styles.tokenName}>
            <img width={24} height={24} src={getLogo({address: tokenB?.address.toLowerCase()})} alt="" />
            {tokenB?.symbol}
          </div>
          <Text variant={20} weight={700}>
            {amountB}
          </Text>

        </div>
      </div>

      <p className="mt-20 mb-20 font-secondary font-400 font-14 text-center">Output is estimated if price changes by more than 0,5% your transaction will be revert</p>

      <div className={styles.bottomInfo}>
        <div className={styles.infoRow}>
          <span>{tokenA?.symbol}/{tokenB?.symbol} burned</span>
          <span>{amountLP}</span>
        </div>

        <div className={styles.infoRow}>
          <span>1 {tokenA?.symbol} price</span>
          <span>{pair?.priceOf(tokenA!).toSignificant(6)} {tokenB?.symbol}</span>
        </div>

        <div className={styles.infoRow}>
          <span>1 {tokenB?.symbol} price</span>
          <span>{pair?.priceOf(tokenB!).toSignificant(6)} {tokenA?.symbol}</span>
        </div>
      </div>
      <div className={styles.buttons}>
        {/*<Button fullWidth variant="outlined" onClick={handleClose}>Cancel</Button>*/}
        <Button fullWidth onClick={removeLiquidity}>Confirm</Button>
      </div>
    </div>

  </DrawerDialog>;
}
