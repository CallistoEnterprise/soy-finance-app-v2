import React, { useEffect, useState } from "react";
import styles from "./ConfirmationPopup.module.scss";
import { useWeb3 } from "../../../processes/web3/hooks/useWeb3";
import Preloader from "../../atoms/Preloader";
import DrawerDialog from "../../atoms/DrawerDialog";

interface Props {
  open: boolean,
  heading?: string,
  details: string
}

const confirmText = {
  metamask: "Confirm operation in your Metamask wallet",
  walletConnect: "Confirm operation in your wallet"
};

export default function ConfirmationPopup({ open, details, heading }: Props) {
  const { walletName } = useWeb3();

  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(
    () => {
      if (open) {
        setInternalOpen(true);
      }
    },
    [open]
  );

  return <DrawerDialog isOpen={open && internalOpen} onClose={() => setInternalOpen(false)}>
    <div className={styles.confirmationPopup}>
      <Preloader type="circular" size={100} />

      <p className={styles.heading}>
        {heading || confirmText[walletName]}
      </p>
      <p className={styles.details}>
        {details}
      </p>
    </div>
  </DrawerDialog>;
}
