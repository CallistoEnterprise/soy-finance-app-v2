import React from "react";
import styles from "./ConnectWalletButton.module.scss";
import Button from "../../../../shared/components/Button";
import useTranslation from "next-translate/useTranslation";
import {useEvent} from "effector-react";
import {setWalletChangeModalOpen} from "../../models";

export default function ConnectWalletButton() {
  const { t } = useTranslation('common');
  const setIsOpened = useEvent(setWalletChangeModalOpen);

  return <Button onClick={() => setIsOpened(true)}>{t("connect_wallet")}</Button>;
}
