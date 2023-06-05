import React, {ChangeEvent, useCallback, useState} from "react";
import styles from "./SwapSettingsDialog.module.scss";
import Dialog from "../../../../components/molecules/Dialog";
import {useEvent, useStore} from "effector-react";
import {$isSwapSettingsDialogOpened, $swapDeadline, $swapSlippage} from "../../models/stores";
import {setSwapDeadline, setSwapSettingsDialogOpened, setSwapSlippage} from "../../models";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import Button from "../../../../components/atoms/Button";
import clsx from "clsx";
import InputWithUnits from "../../../../components/molecules/InputWithUnits";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";

export default function SwapSettingsDialog() {
  const isSwapSettingsDialogOpened = useStore($isSwapSettingsDialogOpened);
  const setSwapSettingsDialogOpenedFn = useEvent(setSwapSettingsDialogOpened);

  const slippage = useStore($swapSlippage);
  const setSlippage = useEvent(setSwapSlippage);

  const { showMessage } = useSnackbar();

  const deadline = useStore($swapDeadline);
  const setDeadline = useEvent(setSwapDeadline);

  const [slippageValue, setSlippageValue] = useState(slippage);
  const [deadlineValue, setDeadlineValue] = useState(deadline);

  const handleSave = useCallback(() => {
    setSlippage(slippageValue);
    setDeadline(deadlineValue);

    showMessage("Settings updated");
    setSwapSettingsDialogOpenedFn(false);
  }, [setSlippage, slippageValue, setDeadline, deadlineValue, showMessage, setSwapSettingsDialogOpenedFn]);


  const handleClose = useCallback(() => {
    setSwapSettingsDialogOpenedFn(false);
    setTimeout(() => {
      setSlippageValue(slippage);
      setDeadlineValue(deadline);
    }, 300);
  }, [deadline, setSwapSettingsDialogOpenedFn, slippage]);

  return <DrawerDialog isOpen={isSwapSettingsDialogOpened} onClose={handleClose}>
    <div className={styles.swapSettingsDialog}>
      <DialogHeader title="Settings" handleClose={handleClose} />

      <div className={styles.swapSettingsDialogContent}>
        <div>
          <p className="font-500">Slippage tolerance</p>
          <div className={styles.slippageControls}>
            {[0.1, 0.5, 1].map((value) => {
              return <button key={value} className={clsx(styles.tabButton, slippageValue === value && styles.active)} onClick={() => {
                setSlippageValue(value);
              }}>{value}%</button>
            })}

            <InputWithUnits units="%" value={slippageValue} setValue={setSlippageValue} />
          </div>
        </div>

        <div className={styles.deadline}>
          <p className="font-500">Transaction deadline</p>
          <div className={styles.deadlineInput}>
            <InputWithUnits units="min" value={deadlineValue} setValue={setDeadlineValue} />
          </div>
        </div>

        <div className={styles.actionButtons}>
          <Button onClick={handleClose} variant="outlined" fullWidth>Cancel</Button>
          <Button onClick={handleSave} disabled={!slippageValue || !deadlineValue} fullWidth>Save</Button>
        </div>
      </div>
    </div>

  </DrawerDialog>;
}
