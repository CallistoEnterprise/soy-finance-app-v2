import DialogHeader from "@/components/DialogHeader";
import Dialog from "@/components/atoms/Dialog";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import clsx from "clsx";
import { useTransactionSettingsStore } from "@/app/[locale]/swap/stores";
import { useCallback, useState } from "react";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import addToast from "@/other/toast";
import {useTranslations} from "use-intl";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

function InputWithUnits({units, value, setValue}: {units: string, value: number, setValue: (value: number) => void}) {
  return <div className="relative">
    <input className="w-full border border-primary-border rounded-2 pr-[47px] pl-4 bg-secondary-bg h-10 outline-0 text-primary-text focus:border-green active:border-green peer" value={value.toString()} onChange={(e) => {
      setValue(+e.target.value);
    }} type="text"/>
    <div className="absolute right-0 top-0 bottom-0 w-[47px] h-10 p-2.5 border-l border-primary-border text-primary-text flex items-center justify-center text-16 peer-focus:border-green peer-active:border-green">{units}</div>
  </div>;
}

export default function TransactionSettingsDialog({isOpen, setIsOpen}: Props) {
  const t = useTranslations("TransactionSettingsDialog");

  const {deadline, slippage, setSlippage, setDeadline} = useTransactionSettingsStore();

  const [slippageValue, setSlippageValue] = useState(slippage);
  const [deadlineValue, setDeadlineValue] = useState(deadline);

  const handleSave = useCallback(() => {
    setSlippage(slippageValue);
    setDeadline(deadlineValue);

    addToast("Settings updated");
    setIsOpen(false);
  }, [setSlippage, slippageValue, setDeadline, deadlineValue, setIsOpen]);


  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setSlippageValue(slippage);
      setDeadlineValue(deadline);
    }, 300);
  }, [deadline, setIsOpen, slippage]);

  return <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="w-full sm:w-[550px] rounded-5 gap-2.5">
      <DialogHeader title={t("settings")} handleClose={() => setIsOpen(false)} />
      <div>
        <div className="p-4 md:p-10 flex flex-col gap-5">
          <div>
            <span className="text-16">{t("slippage_tolerance")}</span>
            <div className="grid grid-cols-[1fr_1fr_1fr_110px] xl:grid-cols-4 gap-2.5 mt-2">
              {[0.1, 0.5, 1].map((value) => {
                return <button key={value} className={clsx(
                  "text-16 border border-green rounded-2 duration-200",
                  slippageValue === value ? "pointer-events-none bg-green text-white" : "hover:bg-green/10 text-primary-text"
                )} onClick={() => {
                  setSlippageValue(value);
                }}>{value}%</button>
              })}

              <InputWithUnits units="%" value={slippageValue} setValue={setSlippageValue} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-16">{t("transaction_deadline")}</span>
            <div className="w-[110px]">
              <InputWithUnits units={t("minutes")} value={deadlineValue} setValue={setDeadlineValue} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <PrimaryButton onClick={handleClose} variant="outlined" fullWidth>{t("cancel")}</PrimaryButton>
            <PrimaryButton onClick={handleSave} disabled={!slippageValue || !deadlineValue} fullWidth>{t("save")}</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  </DrawerDialog>
}
