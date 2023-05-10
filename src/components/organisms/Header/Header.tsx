import React, {useState} from "react";
import styles from "./Header.module.scss";
import Image from "next/image";
import HeaderNav from "../../molecules/HeaderNav";
import SwitchLanguage from "../../molecules/SwitchLanguage";
import { useStore } from "effector-react";
import {$isActive} from "../../../processes/web3/models/stores";
import dynamic from "next/dynamic";
import ChangeWalletModal from "../../../processes/web3/ui/ChangeWalletModal";
import ConnectWalletButton from "../../../processes/web3/ui/ConnectWalletButton";
import SwitchTheme from "../../molecules/SwitchTheme";
import {useColorMode} from "../../../shared/providers/ThemeProvider";
import Drawer from "../../atoms/Drawer/Drawer";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";

const DynamicHeaderNetwork = dynamic(() => import("../HeaderNetwork"), {
  ssr: false,
  loading: () => <div className={styles.loading} />
});

const DynamicWalletMenu = dynamic(() => import("../../molecules/WalletMenu"), {
  ssr: false,
  loading: () => <div className={styles.loading} />
});

export default function Header() {
  const isActive = useStore($isActive);
  const { mode } = useColorMode();

  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className={styles.mobileWalletMenu}>

        {isActive && <DynamicHeaderNetwork expandDirection="top" />}
        {!isActive ? <>
          <ConnectWalletButton fullWidth />
          <ChangeWalletModal />
        </> : <DynamicWalletMenu />}
      </div>
      <div>
        <IconButton onClick={() => setMenuOpen(true)}>
          <Svg iconName="menu" />
        </IconButton>
        <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} position="left">
          Swap
        </Drawer>
      </div>
    </div>
  </header>;
}
