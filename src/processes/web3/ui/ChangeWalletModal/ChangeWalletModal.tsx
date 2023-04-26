import clsx from "clsx";
import Dialog from "../../../../shared/components/Dialog";
import styles from "./ChangeWalletModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {$isWalletChangeModalOpened} from "../../models/stores";
import {setWalletChangeModalOpen} from "../../models";
import dynamic from "next/dynamic";
import Preloader from "../../../../shared/components/Preloader/Preloader";

const DynamicChangeWalletContent = dynamic(() => import("../ChangeWalletContent"), {
  loading: () => {
    return <div className={styles.loading}>
      <Preloader size={100} />
    </div>
  }
})

export default function ChangeWalletModal() {
  const isOpened = useStore($isWalletChangeModalOpened);

  const setWalletChangeModalOpenFn = useEvent(setWalletChangeModalOpen);

  const handleClose = () => setWalletChangeModalOpenFn(false);

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
