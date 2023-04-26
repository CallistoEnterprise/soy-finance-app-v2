import { useEffect, useState } from "react";
import {useWeb3} from "../../hooks/useWeb3";
import styles from "./ChangeWalletContent.module.scss";
import MetamaskCard from "../MetamaskCard";
import WalletConnectCard from "../WalletConnectCard";
import DialogCloseButton from "../../../../shared/components/DialogCloseButton";
import Button from "../../../../shared/components/Button";
import {wallets} from "../../constants/wallets";
import QRCode from "react-qr-code";

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

import Image from "next/image";
import IconButton from "../../../../shared/components/IconButton";
import useTranslation from "next-translate/useTranslation";
import {useEvent, useStore} from "effector-react";
import {disableWc2Blockchain, enableWc2Blockchain, setWalletChangeModalOpen} from "../../models";
import {$wc2blockchains} from "../../models/stores";
import PickButton from "../../../../shared/components/PickButton";


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
      {step === 2 && <IconButton className={styles.backButton} transparent onClick={() => {
        setStep(1);
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6186 2.99055C16.1286 2.50055 15.3386 2.50055 14.8486 2.99055L6.53859 11.3005C6.14859 11.6905 6.14859 12.3205 6.53859 12.7105L14.8486 21.0205C15.3386 21.5105 16.1286 21.5105 16.6186 21.0205C17.1086 20.5305 17.1086 19.7405 16.6186 19.2505L9.37859 12.0005L16.6286 4.75055C17.1086 4.27055 17.1086 3.47055 16.6186 2.99055Z" fill="#4B564B"/>
        </svg>
      </IconButton>}
    {step === 3 && <IconButton className={styles.backButton} transparent onClick={() => {
      setStep(2);
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.6186 2.99055C16.1286 2.50055 15.3386 2.50055 14.8486 2.99055L6.53859 11.3005C6.14859 11.6905 6.14859 12.3205 6.53859 12.7105L14.8486 21.0205C15.3386 21.5105 16.1286 21.5105 16.6186 21.0205C17.1086 20.5305 17.1086 19.7405 16.6186 19.2505L9.37859 12.0005L16.6286 4.75055C17.1086 4.27055 17.1086 3.47055 16.6186 2.99055Z" fill="#4B564B"/>
      </svg>
    </IconButton>}
      <DialogCloseButton handleClose={() => {
        handleClose();
        setTimeout(() => {
          setStep(1);
        }, 300);
      }} />
      {step === 1 && <>
        <h4 className={styles.heading}>{t("connect_wallet")}</h4>
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
              return window.open(`https://metamask.app.link/dapp/${window.location.hostname}/dashboard/bridge`);
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
  </>
}
