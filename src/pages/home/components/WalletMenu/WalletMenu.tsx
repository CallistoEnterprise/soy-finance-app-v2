import React, {useEffect, useRef, useState} from "react";
import styles from "./WalletMenu.module.scss";
import Svg from "../../../../shared/components/Svg/Svg";
import clsx from "clsx";
import Portal from "../../../../shared/components/Portal";
import Divider from "../../../../shared/components/Divider";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import useTranslation from "next-translate/useTranslation";
import {useEvent} from "effector-react";
import {setWalletDialogOpened} from "../../../../shared/models";
import WalletDialog from "../WalletDialog";

function formatAddress(address: string | null) {
  if(!address) {
    return "";
  }

  return `${address.substring(0,4)}...${address.slice(-4)}`;
}

export default function WalletMenu() {
  const { t } = useTranslation('common');

  const walletRef = useRef<HTMLDivElement | null>(null);
  const [isWalletMenuOpened, setWalletMenuOpened] = useState(false);
  const { account, disconnect } = useWeb3();

  const setWalletDialogOpenedFn = useEvent(setWalletDialogOpened);

  const [walletPositions, setWalletPositions] = useState({
    top: 0,
    right: 0
  });

  useEffect(
    () => {
      if (walletRef.current) {
        const currentRef = walletRef.current as HTMLDivElement;

        setWalletPositions({
          top: currentRef.getBoundingClientRect().y + currentRef.getBoundingClientRect().height + 20,
          right: currentRef.getBoundingClientRect().right
        });
      }
    },
    [walletRef, isWalletMenuOpened]
  );

  return <>
    <div ref={walletRef}>
      <button className={styles.dropdownButton} onClick={() => setWalletMenuOpened(true)} color="secondary">
                <span className={styles.buttonContent}>
                  <span className={styles.walletIcon}>
                    <Svg iconName="wallet" />
                  </span>

                  {formatAddress(account)}
                  <span className={clsx(
                    styles.expandArrow,
                    isWalletMenuOpened && styles.opened)
                  }>
                    <Svg size={16} iconName="expand-arrow" />
                  </span>
                </span>
      </button>
      <Portal root="dropdown-root" isOpen={isWalletMenuOpened} onClose={() => {
        setWalletMenuOpened(false);
      }} isTransitioningClassName={styles.in} className={clsx(
        styles.dialogContainer,
        isWalletMenuOpened && styles.open
      )}>
        <div style={{top: walletPositions.top, left: walletPositions.right, transform: "translate(-100%)"}}  className={styles.walletMenuDropdown}>
          <nav>
            <ul className={styles.walletMenuList}>
              <li>
                <div className={styles.walletMenuItem} onClick={() => {
                  setWalletMenuOpened(false);
                  setWalletDialogOpenedFn(true);
                }} role="button">
                  <span className={styles.iconWrapper}><Svg iconName="wallet" /></span>
                  <span>{t("wallet")}</span>
                </div>
              </li>
              <li>
                <div className={styles.walletMenuItem} role="button">
                  <Svg iconName="history" />
                  <span>{t("recent_transactions")}</span>
                </div>
              </li>
              <Divider />
              <li>
                <div onClick={() => {
                  disconnect();
                  setWalletMenuOpened(false);
                }} className={styles.walletMenuItem} role="button">
                  <Svg iconName="logout" />
                  <span>{t("disconnect")}</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
        <div className={styles.backdrop} onClick={() => {
          setWalletMenuOpened(false);
        }} />
      </Portal>
    </div>
    <WalletDialog />
  </>;
}
