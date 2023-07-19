import React, {useCallback, useMemo} from "react";
import styles from "./ConfirmAddLiquidityDialog.module.scss";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {useEvent, useStore} from "effector-react";
import {$isConfirmAddLiquidityDialogOpened} from "../../models/stores";
import {setConfirmAddLiquidityDialogOpened} from "../../models";
import Button from "../../../../components/atoms/Button";
import {useLiquidity} from "../../models/hooks/useLiquidity";
import {$liquidityAmountA, $liquidityAmountB, $liquidityInputTokens} from "../../../../shared/web3/models/init";
import Image from "next/image";
import {getLogo} from "../../../../shared/utils";
import Text from "../../../../components/atoms/Text";

function InfoRow({label, value}) {
  return <div className={styles.infoRow}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
}

export default function ConfirmAddLiquidityDialog() {
  const {tokenA, tokenB} = useStore($liquidityInputTokens);
  const amountA = useStore($liquidityAmountA);
  const amountB = useStore($liquidityAmountB);

  const {
    priceA,
    priceB,
    addLiquidity
  } = useLiquidity();

  const isOpen = useStore($isConfirmAddLiquidityDialogOpened);
  const setOpen = useEvent(setConfirmAddLiquidityDialogOpened);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);



  return <DrawerDialog isOpen={isOpen} onClose={handleClose}>
    <div className={styles.confirmAdd}>
      <div className={styles.header}>
        <div className={styles.images}>
          <Image width={58} height={58} src={getLogo({address: tokenA?.address.toLowerCase()})} alt="" />
          <Image width={58} height={58} src={getLogo({address: tokenB?.address.toLowerCase()})} alt="" />
        </div>
        <Text variant={24} weight={700}>{tokenA?.symbol}/{tokenB?.symbol}</Text>
      </div>

      <div className={styles.infoRows}>
        <InfoRow label={`${tokenA?.symbol} deposit`} value={amountA} />
        <InfoRow label={`${tokenB?.symbol} deposit`} value={amountB} />
        <InfoRow label={`${tokenA?.symbol} rate`} value={`1 ${tokenA?.symbol} = ${priceB?.toSignificant(2)} ${tokenB?.symbol}`} />
        <InfoRow label={`${tokenB?.symbol} rate`} value={`1 ${tokenB?.symbol} = ${priceA?.toSignificant(2)} ${tokenA?.symbol}`} />
      </div>
      <Button fullWidth onClick={addLiquidity}>Supply liquidity</Button>
    </div>
  </DrawerDialog>;
}
