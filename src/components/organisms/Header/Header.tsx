import React, {useState} from "react";
import styles from "./Header.module.scss";
import Image from "next/image";
import HeaderNav from "../../molecules/HeaderNav";
import { useStore } from "effector-react";
import {$isActive} from "../../../processes/web3/models/stores";
import dynamic from "next/dynamic";
import ChangeWalletModal from "../../../processes/web3/ui/ChangeWalletModal";
import ConnectWalletButton from "../../../processes/web3/ui/ConnectWalletButton";
import {useColorMode} from "../../../shared/providers/ThemeProvider";
import Drawer from "../../atoms/Drawer/Drawer";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";
import SettingsMenu from "../../molecules/SettingsMenu";
import {socialLinks} from "../../../shared/constants/links/socials";
import Link from "next/link";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";

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

  const {showMessage} = useSnackbar();

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
        <SettingsMenu />
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
        </> : <DynamicWalletMenu expandDirection="top" />}
      </div>
      <div className={styles.burger}>
        <IconButton onClick={() => setMenuOpen(true)}>
          <Svg iconName="menu" />
        </IconButton>
        <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} position="left">
            <div className={styles.drawerContent}>
              <div>
                <h3 className={styles.blockTitle}>Exchange</h3>
                <div className={styles.links}>
                  <Link className={styles.link} href="/swap">
                    <Svg iconName="swap" />
                    Swap
                  </Link>
                  <Link className={styles.link} href="/liquidity">
                    <Svg iconName="liquidity" />
                    Liquidity
                  </Link>
                </div>
              </div>
              <div>
                <h3 className={styles.blockTitle}>Farming</h3>
                <div className={styles.links}>
                  <Link className={styles.link} href="/farms">
                    <Svg iconName="farm" />
                    Farms
                  </Link>
                  <a onClick={() => {
                    setMenuOpen(false);
                    showMessage("Coming soon...", "info");
                  }} className={styles.link} href="#">
                    <Svg iconName="boost" />
                    Boost token
                  </a>
                  <a onClick={() => {
                    setMenuOpen(false);
                    showMessage("Coming soon...", "info");
                  }} className={styles.link} href="#">
                    <Svg iconName="burn" />
                    Burn & Boost
                  </a>
                </div>
              </div>
              <div>
                <h3 className={styles.blockTitle}>Safety On Yields</h3>
                <div className={styles.links}>
                  <a onClick={() => {
                    setMenuOpen(false);
                    showMessage("Coming soon...", "info");
                  }} className={styles.link} href="#">
                    <Svg iconName="safe-trading" />
                    Safe trading
                  </a>
                  <a onClick={() => {
                    setMenuOpen(false);
                    showMessage("Coming soon...", "info");
                  }} className={styles.link} href="#">
                    <Svg iconName="listing" />
                    Safelisting
                  </a>
                </div>
              </div>
              <div>
                <h3 className={styles.blockTitle}>More</h3>
                <div className={styles.links}>
                  <a target="_blank" className={styles.link} href="https://app2.soy.finance/pools">
                    <Svg iconName="staked" />
                    Staking
                  </a>
                  <a onClick={() => {
                    setMenuOpen(false);
                    showMessage("Coming soon...", "info");
                  }} className={styles.link} href="#">
                    <Svg iconName="futures" />
                    Futures
                  </a>
                  <a target="_blank" className={styles.link} href="https://bridge.soy.finance/">
                    <Svg iconName="bridge" />
                    Bridge
                  </a>
                  <a target="_blank" className={styles.link} href="https://app2.soy.finance/">
                    <Svg iconName="history" />
                    Soy Finance V2
                  </a>
                </div>
              </div>
              <div>
                <h3 className={styles.blockTitle}>Social media</h3>
                <div className={styles.socials}>
                  {socialLinks.map((item, index) => {
                    return <a key={item.icon} target="_blank" href={item.link}>
                      <IconButton variant="social" key={index}>
                        <Svg sprite="social" iconName={item.icon} />
                      </IconButton>
                    </a>
                  })}
                </div>
              </div>
            </div>
        </Drawer>
      </div>
    </div>
  </header>;
}
