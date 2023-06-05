import { useEffect, useState } from "react";
import {useWeb3} from "../../hooks/useWeb3";
import styles from "./ChangeWalletContent.module.scss";
import MetamaskCard from "../MetamaskCard";
import WalletConnectCard from "../WalletConnectCard";
import Button from "../../../../components/atoms/Button";
import {wallets} from "../../constants/wallets";
import QRCode from "react-qr-code";

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

import Image from "next/image";
import IconButton from "../../../../components/atoms/IconButton";
import useTranslation from "next-translate/useTranslation";
import {useEvent, useStore} from "effector-react";
import {disableWc2Blockchain, enableWc2Blockchain, setWalletChangeModalOpen} from "../../models";
import {$wc2blockchains} from "../../models/stores";
import PickButton from "../../../../components/atoms/PickButton";
import Svg from "../../../../components/atoms/Svg/Svg";


export default function ChangeWalletContent() {
  const { connect, walletName, connectionURI } = useWeb3();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(1);
  const [currentWallet, setCurrentWallet] = useState(walletName);

  const setWalletChangeModalOpenFn = useEvent(setWalletChangeModalOpen);

  const enableWc2BlockchainFn = useEvent(enableWc2Blockchain);
  const disableWcBlockchainFn = useEvent(disableWc2Blockchain);

  const wc2Blockchains = useStore($wc2blockchains);

  const handleClose = () => setWalletChangeModalOpenFn(false);

  useEffect(
    () => {
      if(connectionURI) {
        setStep(3);
      }
    },
    [connectionURI]
  );

  useEffect(
    () => {
      setStep(1);
    },
    [walletName]
  );

  function isMobileDevice() {
    if (window) {
      return "ontouchstart" in window || "onmsgesturechange" in window;
    }
  }

  return <>
      {step === 2 && <IconButton className={styles.backButton} onClick={() => {
        setStep(1);
      }}>
        <Svg iconName="back" />
      </IconButton>}
    {step === 3 && <IconButton className={styles.backButton} onClick={() => {
      setStep(2);
    }}>
      <Svg iconName="back" />
    </IconButton>}
      {step === 1 && <>
        <div className={styles.walletsWrapper}>
          <MetamaskCard active={currentWallet === "metamask"} onClick={
            () => {
              setCurrentWallet("metamask");
            }
          } />

          <WalletConnectCard active={currentWallet === "walletConnect"} onClick={() => {
            setCurrentWallet("walletConnect");
          }} />
        </div>
        <Button fullWidth onClick={async () => {
          if (!currentWallet) {
            console.log("No walletr");
            return;
          }

          if (currentWallet === "metamask") {
            if (isMobileDevice() && !(window as any).ethereum) {
              return window.open(`https://metamask.app.link/dapp/${window.location.hostname}/swap`);
            }

            if (!isMobileDevice() && !(window as any).ethereum) {
              return;
            }
          }

          const currentConnection = localStorage.getItem("wc@2:client:0.3//session");

          if(currentWallet === "walletConnect" && currentConnection && JSON.parse(currentConnection).length) {
            connect(currentWallet);
            return;
          }

          if(currentWallet === "walletConnect") {
            setStep(2);
            return;
          }

          connect(currentWallet);

          if (currentWallet === "metamask") {
            handleClose();
          }
        }}>{t("connect")}</Button>
      </>}
    {step === 2 && <>
      {currentWallet === "walletConnect" && <>
        <div className={styles.title}>
          <Image alt={wallets[currentWallet].name} src={wallets[currentWallet].image} width={24} height={24} />
          <span>{wallets[currentWallet].name}</span>
        </div>
        <p className={styles.subheading}>Select one or more networks to which you want to connect your wallet</p>

        <div className={styles.pickNetworks}>
          <PickButton withCheckmark onClick={() => wc2Blockchains.includes(820) ? disableWcBlockchainFn(820) : enableWc2BlockchainFn(820)} isActive={wc2Blockchains.includes(820)}>
            <span className={styles.pickButtonContent}>Callisto Network</span>
          </PickButton>
          <PickButton withCheckmark onClick={() => wc2Blockchains.includes(199) ? disableWcBlockchainFn(199) : enableWc2BlockchainFn(199)} isActive={wc2Blockchains.includes(199)}>
            <span className={styles.pickButtonContent}>BitTorrent</span>
          </PickButton>
          <PickButton withCheckmark onClick={() => wc2Blockchains.includes(61) ? disableWcBlockchainFn(61) : enableWc2BlockchainFn(61)} isActive={wc2Blockchains.includes(61)}>
            <span className={styles.pickButtonContent}>Ethereum Classic</span>
          </PickButton>
        </div>

        <Button fullWidth onClick={() => {
          connect(currentWallet);
        }}>
          Continue
        </Button>
      </>}
    </>}
    {step === 3 && <>
      {currentWallet === "walletConnect" && <>
        <div className={styles.title}>
          <Image alt={wallets[currentWallet].name} src={wallets[currentWallet].image} width={24} height={24} />
          <span>{wallets[currentWallet].name}</span>
        </div>
        <div className={styles.qrWrapper}>
          <div style={{ background: "#fff",
            margin: "20px auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8 }}>
            <QRCode size={294} value={connectionURI || ""} />
          </div>
          Scan QR code with a compatible wallet
        </div>
        <Button fullWidth onClick={async () => {
          await copyToClipboard(connectionURI || "");
          console.log("Successfully copied!");
        }} size="small">
          Copy to clipboard
        </Button>
      </>}
    </>}
  </>
}
