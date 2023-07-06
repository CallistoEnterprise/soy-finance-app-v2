import React, {useEffect, useRef, useState} from "react";
import styles from "./WalletMenu.module.scss";
import Svg from "../../atoms/Svg/Svg";
import clsx from "clsx";
import Portal from "../../atoms/Portal";
import Divider from "../../atoms/Divider";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import useTranslation from "next-translate/useTranslation";
import {useEvent} from "effector-react";
import {setWalletDialogOpened} from "../../../shared/models";
import WalletDialog from "../WalletDialog";
import OpenDropdownButton from "../OpenDropdownButton";
import DropdownItem from "../DropdownItem";
import {formatAddress} from "../../../shared/utils";



export default function WalletMenu({expandDirection = "bottom"}) {
  const {t} = useTranslation('common');

  const walletRef = useRef<HTMLDivElement | null>(null);
  const [isWalletMenuOpened, setWalletMenuOpened] = useState(false);
  const {account, disconnect} = useWeb3();

  const setWalletDialogOpenedFn = useEvent(setWalletDialogOpened);

  const [walletPositions, setWalletPositions] = useState({
    [expandDirection === "bottom" ? "top" : "bottom"]: 0,
    right: 0
  });

  const [defaultTab, setDefaultTab] = useState(0);

  useEffect(
    () => {
      if (walletRef.current) {
        const currentRef = walletRef.current as HTMLDivElement;

        setWalletPositions({
          [expandDirection === "bottom" ? "top" : "bottom"]: expandDirection === "bottom"
            ? currentRef.getBoundingClientRect().y + currentRef.getBoundingClientRect().height + 20
            : currentRef.getBoundingClientRect().height + 20,
          right: currentRef.getBoundingClientRect().right
        });
      }
    },
    [walletRef, expandDirection]
  );

  return <>
    <div ref={walletRef}>
      <OpenDropdownButton
        handleClick={() => setWalletMenuOpened(true)}
        label={formatAddress(account)}
        isOpened={isWalletMenuOpened}
        img={<Svg iconName="wallet"/>}
      />
      <Portal root="dropdown-root" isOpen={isWalletMenuOpened} onClose={() => {
        setWalletMenuOpened(false);
      }} isTransitioningClassName={styles.in} className={clsx(
        styles.dialogContainer,
        isWalletMenuOpened && styles.open
      )}>
        <div style={{top: walletPositions.top, left: walletPositions.right, bottom: walletPositions.bottom, transform: "translate(-100%)"}}
             className={styles.walletMenuDropdown}>
          <nav>
            <ul className={styles.walletMenuList}>
              <li>
                <DropdownItem handleClick={() => {
                  setWalletMenuOpened(false);
                  setWalletDialogOpenedFn(true);
                  setDefaultTab(0);
                }} label={t("wallet")} image={<Svg iconName="wallet"/>}
                />
              </li>
              <li>
                <DropdownItem handleClick={() => {
                  setWalletMenuOpened(false);
                  setWalletDialogOpenedFn(true);
                  setDefaultTab(1);
                }} label={t("recent_transactions")} image={<Svg iconName="history"/>}
                />
              </li>
              <Divider/>
              <li>
                <DropdownItem handleClick={() => {
                  disconnect();
                  setWalletMenuOpened(false);
                }} label={t("disconnect")} image={<Svg iconName="logout"/>}
                />
              </li>
            </ul>
          </nav>
        </div>
        <div className={styles.backdrop} onClick={() => {
          setWalletMenuOpened(false);
        }} />
      </Portal>
    </div>
    <WalletDialog defaultTab={defaultTab} />
  </>;
}
