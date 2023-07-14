import React, {useEffect, useRef, useState} from "react";
import styles from "./SettingsMenu.module.scss";
import Svg from "../../atoms/Svg/Svg";
import clsx from "clsx";
import Portal from "../../atoms/Portal";
import useTranslation from "next-translate/useTranslation";
import WalletDialog from "../WalletDialog";
import IconButton from "../../atoms/IconButton";
import DialogHeader from "../DialogHeader";
import Flex from "../../layout/Flex";
import Switch from "../../atoms/Switch";
import {useColorMode} from "../../../shared/providers/ThemeProvider";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import Text from "../../atoms/Text";

export default function SettingsMenu({expandDirection = "bottom"}) {
  const {t} = useTranslation('common');

  const {mode, toggleTheme} = useColorMode();

  const walletRef = useRef<HTMLDivElement | null>(null);
  const [isWalletMenuOpened, setWalletMenuOpened] = useState(false);

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
    [walletRef, expandDirection, isWalletMenuOpened]
  );
  const {showMessage} = useSnackbar();

  return <>
    <div ref={walletRef}>
      <IconButton
        variant="menu"
        onClick={() => setWalletMenuOpened(true)}
        // isOpened={isWalletMenuOpened}
      >
        <Svg iconName="settings" />
      </IconButton>

      <Portal root="dropdown-root" isOpen={isWalletMenuOpened} onClose={() => {
        setWalletMenuOpened(false);
      }} isTransitioningClassName={styles.in} className={clsx(
        styles.dialogContainer,
        isWalletMenuOpened && styles.open
      )}>
        <div style={{top: walletPositions.top, left: walletPositions.right, bottom: walletPositions.bottom, transform: "translate(-100%)"}}
             className={styles.walletMenuDropdown}>
          <DialogHeader variant="dropdown" title="Settings" handleClose={() => setWalletMenuOpened(false)} />
          <div className={styles.content}>
            <ul className={styles.list}>
              <li>
                <Flex gap={8}>
                  <div className={styles.menuIcon}><Svg iconName="night" /></div>
                  <Text variant={14}>Dark mode</Text>
                </Flex>
                <div>
                  <Switch checked={mode === "dark"} setChecked={toggleTheme} />
                </div>
              </li>
              <li className={styles.lang} role="button" onClick={() => {
                showMessage("Coming soon...");
              }}>
                <Flex gap={8}>
                  <div className={styles.menuIcon}><Svg iconName="web3" /></div>
                  <Text variant={14}>Language</Text>
                </Flex>
                <div className={styles.menuIcon}><Svg iconName="arrow-right" /></div>
              </li>
              <li>
                <Flex gap={8}>
                  <div className={styles.menuIcon}><Svg iconName="line" /></div>
                  <Text variant={14}>Show chart</Text>
                </Flex>
                <div className={styles.switchWrapper}>
                  <Switch checked={true} setChecked={() => {
                    showMessage("Coming soon...");
                  }} />
                </div>
              </li>
              <li>
                <Flex gap={8}>
                  <div className={styles.menuIcon}><Svg iconName="table" /></div>
                  <Text variant={14}>Show table</Text>
                </Flex>
                <div className={styles.switchWrapper}>
                  <Switch checked={true} setChecked={() => {
                    showMessage("Coming soon...");
                  }} />
                </div>
              </li>
              <li>
                <Flex gap={8}>
                  <div className={styles.menuIcon}><Svg iconName="sound" /></div>
                  <Text>Sounds</Text>
                </Flex>
                <div className={styles.switchWrapper}>
                  <Switch checked={false} setChecked={() => {
                    showMessage("Coming soon...");
                  }} />
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.backdrop} onClick={() => {
          setWalletMenuOpened(false);
        }} />
      </Portal>
    </div>
    <WalletDialog defaultTab={defaultTab} />
  </>;
}
