import React, {useState} from "react";
import styles from "./RemoveLiquidityDialog.module.scss";
import Dialog from "../../../../components/molecules/Dialog";
import {useEvent, useStore} from "effector-react";
import {closeRemoveLiquidityDialog} from "../../models";
import {$isRemoveLiquidityDialogOpened} from "../../models/stores";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import Text from "../../../../components/atoms/Text";
import Switch from "../../../../components/atoms/primitive/Switch";
import PercentageButtons from "../../../../components/molecules/PercentageButtons";
import clsx from "clsx";
import Button from "../../../../components/atoms/Button";



function Progress({percents, color}: {percents: number, color: "green" | "purple" | "pink"}) {
  return <>
    <div className={styles.progressContainer}>
      <div className={clsx(styles.progressBar, styles[color])} style={{width: `${percents}%`}} />
    </div>
  </>
}

export default function RemoveLiquidityDialog() {
  const isOpen = useStore($isRemoveLiquidityDialogOpened);
  const handleClose = useEvent(closeRemoveLiquidityDialog);

  const [isDetailed, setIsDetailed] = useState(false);

  return <Dialog isOpen={isOpen} onClose={handleClose}>
    <div className={styles.removeLiquidityDialog}>
      <DialogHeader title="Remove liquidity" handleClose={handleClose} />
      {!isDetailed ? <div className={styles.dialogBody}>
        <div className={styles.amountLabel}>
          <Text variant={20} weight={700}>Amount</Text>
          <div className={styles.switchWrapper}>
            <Text variant={14} weight={500}>Detailed</Text>
            <Switch checked={isDetailed} setChecked={() => setIsDetailed(true)} />
          </div>
        </div>
        <div className={styles.percentageSettings}>
          <Text weight={700}>80 %</Text>
          <div style={{marginBottom: 13}} />
          <Progress percents={80} color="green" />
          <div style={{marginBottom: 20}} />
          <PercentageButtons fullWidth handleClick={null} balance={0} inputValue={2} />
        </div>
        <div className={styles.receiveBlock}>
          <div className={styles.greyHeader}>
            <Text>You will receive</Text>
          </div>
          <div className={styles.blockRows}>
            <div className={styles.blockRow}>
              <Text color="secondary">USDT deposit</Text>
              <Text color="secondary">331.92</Text>
            </div>
            <div className={styles.blockRow}>
              <Text color="secondary">ETH deposit</Text>
              <Text color="secondary">1.92</Text>
            </div>
          </div>
        </div>
        <div className={styles.pricesBlock}>
          <div className={styles.greyHeader}>
            <Text>Prices</Text>
          </div>
          <div className={styles.blockRows}>
            <div className={styles.blockRow}>
              <Text color="secondary">1 USDT</Text>
              <Text color="secondary">131.2</Text>
            </div>
            <div className={styles.blockRow}>
              <Text color="secondary">1 ETH</Text>
              <Text color="secondary">1.92</Text>
            </div>
          </div>
        </div>
      </div> :
        <div className={styles.dialogBody}>
          <div className={styles.amountLabel}>
            <Text variant={20} weight={700}>Amount</Text>
            <div className={styles.switchWrapper}>
              <Text variant={14} weight={500}>Detailed</Text>
              <Switch checked={isDetailed} setChecked={() => setIsDetailed(false)} />
            </div>
          </div>
          <div>detailed !OKASD</div>
        </div>}
      <div className={styles.dialogFooter}>
        <Button fullWidth>Remove</Button>
      </div>
    </div>
  </Dialog>;
}
