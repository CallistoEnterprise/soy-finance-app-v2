import React from "react";
import styles from "./Header.module.scss";
import Image from "next/image";
import HeaderNav from "../HeaderNav";
import SwitchLanguage from "../SwitchLanguage";
import { useStore } from "effector-react";
import {$isActive} from "../../../../processes/web3/models/stores";
import dynamic from "next/dynamic";
import ChangeWalletModal from "../../../../processes/web3/ui/ChangeWalletModal";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";
import SwitchTheme from "../SwitchTheme";
import {useColorMode} from "../../../../shared/providers/ThemeProvider";

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
  const { mode } = useColorMode();

  return <header className="container">
    <div className={styles.headerContent}>
      <div className={styles.headerMenu}>
        {mode === "light" ?
          <Image placeholder="blur" blurDataURL="/Logo.svg" width={132} height={46} src="/Logo.svg" alt="Soy finance" /> :
          <Image placeholder="blur" blurDataURL="/Logo-Dark.svg" width={132} height={46} src="/Logo-Dark.svg" alt="Soy finance" />}
        <HeaderNav />
      </div>
      <div className={styles.headerSettings}>
        <SwitchTheme />
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
