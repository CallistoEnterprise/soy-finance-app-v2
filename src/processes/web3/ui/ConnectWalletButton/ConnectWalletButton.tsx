import React from "react";
import styles from "./ConnectWalletButton.module.scss";
import Button from "../../../../components/atoms/Button";
import useTranslation from "next-translate/useTranslation";
import {useEvent} from "effector-react";
import {setWalletChangeModalOpen} from "../../models";

export default function ConnectWalletButton({fullWidth = false, variant = "contained"}) {
  const { t } = useTranslation('common');
  const setIsOpened = useEvent(setWalletChangeModalOpen);

  return <Button variant={variant} onClick={() => setIsOpened(true)} fullWidth={fullWidth}>{t("connect_wallet")}</Button>;
}
