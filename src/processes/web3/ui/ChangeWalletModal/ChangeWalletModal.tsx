import clsx from "clsx";
import Dialog from "../../../../components/molecules/Dialog";
import styles from "./ChangeWalletModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {$isWalletChangeModalOpened} from "../../models/stores";
import {setWalletChangeModalOpen} from "../../models";
import dynamic from "next/dynamic";
import Preloader from "../../../../components/atoms/Preloader";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";

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

  return <DrawerDialog
    isOpen={isOpened}
    onClose={() => {
      handleClose();
    }}
  >
    <DialogHeader title="Choose wallet" handleClose={handleClose} />
    <div className={clsx(
      styles.modalWrapper
    )}>
      <DynamicChangeWalletContent />
    </div>
  </DrawerDialog>;
}
