import clsx from "clsx";
import Dialog from "../../../../shared/components/Dialog";
import styles from "./ChangeWalletModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {$isWalletChangeModalOpened} from "../../models/stores";
import {setWalletChangeModalOpen} from "../../models";
import dynamic from "next/dynamic";
import CircularProgress from "../../../../shared/components/CircularProgress";

const DynamicChangeWalletContent = dynamic(() => import("../ChangeWalletContent"), {
  loading: () => {
    console.log("Loading started");
    return <div className={styles.loading}>
      <CircularProgress size={40} />
    </div>
  }
})

export default function ChangeWalletModal() {
  const isOpened = useStore($isWalletChangeModalOpened);

  const setWalletChangeModalOpenFn = useEvent(setWalletChangeModalOpen);

  const handleClose = () => setWalletChangeModalOpenFn(false);

  console.log("REnder c");
  return <Dialog
    isOpen={isOpened}
    onClose={() => {
      handleClose();
    }}
  >
    <div className={clsx(
      styles.modalWrapper
    )}>
      <DynamicChangeWalletContent />
    </div>
  </Dialog>;
}
