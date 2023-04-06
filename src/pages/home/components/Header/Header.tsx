import React from "react";
import styles from "./Header.module.scss";
import Image from "next/image";
import HeaderNav from "../HeaderNav";
import SwitchLanguage from "../SwitchLanguage";
import {useEvent, useStore} from "effector-react";
import {$isActive, $isWalletChangeModalOpened} from "../../../../processes/web3/models/stores";
import dynamic from "next/dynamic";
import Button from "../../../../shared/components/Button";
import {setWalletChangeModalOpen} from "../../../../processes/web3/models";
import useTranslation from "next-translate/useTranslation";
import Portal from "../../../../shared/components/Portal";
import Dialog from "../../../../shared/components/Dialog";
import ChangeWalletModal from "../../../../processes/web3/ui/ChangeWalletModal";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";

const DynamicHeaderNetwork = dynamic(() => import("../HeaderNetwork"), {
  ssr: false,
  loading: () => <div className={styles.loading} />
});

const DynamicWalletMenu = dynamic(() => import("../WalletMenu"), {
  ssr: false,
  loading: () => <div className={styles.loading} />
});

export default function Header() {
  const isActive = useStore($isActive);
  console.log("Rerenders");

  return <header className={styles.container}>
    <div className={styles.headerContent}>
      <div className={styles.headerMenu}>
        <Image placeholder="blur" blurDataURL="/Logo.svg" width={132} height={46} src="/Logo.svg" alt="Soy finance" />
        <HeaderNav />
      </div>
      <div className={styles.headerSettings}>
        <SwitchLanguage />
        {isActive && <DynamicHeaderNetwork />}
        {!isActive ? <>
          <ConnectWalletButton />
          <ChangeWalletModal />
        </> : <DynamicWalletMenu />}
      </div>
    </div>
  </header>;
}
