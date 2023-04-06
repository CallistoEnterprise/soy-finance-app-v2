import { useEffect, useState } from "react";
import {useWeb3} from "../../hooks/useWeb3";
import styles from "./ChangeWalletContent.module.scss";
import MetamaskCard from "../MetamaskCard";
import WalletConnectCard from "../WalletConnectCard";
import AbsoluteWalletCard from "../AbsoluteWalletCard";
import DialogCloseButton from "../../../../shared/components/DialogCloseButton";
import Button from "../../../../shared/components/Button";
import {wallets} from "../../constants/wallets";
import QRCode from "react-qr-code";

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

import Image from "next/image";
import IconButton from "../../../../shared/components/IconButton";
import Tab from "../../../../shared/components/Tab";
import Tabs from "../../../../shared/components/Tabs";
import useTranslation from "next-translate/useTranslation";
import {useEvent} from "effector-react";
import {setWalletChangeModalOpen} from "../../models";
import WalletConnectV2Card from "../WalletConnectV2Card";

const wcImagesPath = "/images/wallets/wc";

const desktopWalletConnectLinks = [
  {
    image: "ledger.svg",
    name: "Ledger",
    getUrl: (uri: string) => `ledgerlive://wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "tokenary.svg",
    name: "Tokenary",
    getUrl: (uri: string) => `https://tokenary.io/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "infinity.svg",
    name: "Infinity wallet",
    getUrl: (uri: string) => `https://infinitywallet.io/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "secux.svg",
    name: "SecuX",
    getUrl: (uri: string) => `https://wsweb.secuxtech.com/wc?uri=${encodeURIComponent(uri)}`
  },
  {
    image: "ambire.svg",
    name: "Ambire",
    getUrl: (uri: string) => `https://wallet.ambire.com/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "rice.svg",
    name: "RICE Wallet",
    getUrl: (uri: string) => `https://ricewallet.io/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "vision.svg",
    name: "Vision",
    getUrl: (uri: string) => `https://app.vision-crypto.com/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "keyring.svg",
    name: "KEYRING PRO",
    getUrl: (uri: string) => `https://keyring.app/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "wallet3.svg",
    name: "Wallet3",
    getUrl: (uri: string) => `wallet3://wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "apollox.svg",
    name: "ApolloX",
    getUrl: (uri: string) => `https://app.apollox.finance/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "gamestop.svg",
    name: "GameStop Wallet",
    uri: "",
    getUrl: (uri: string) => `https://wallet.gamestop.com//wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "zerion.svg",
    name: "Zerion",
    getUrl: (uri: string) => `https://app.zerion.io/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "sequence.svg",
    name: "Sequence",
    getUrl: (uri: string) => `https://sequence.app/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "punk.png",
    name: "PunkWallet",
    getUrl: (uri: string) => `https://punkwallet.io/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "kryptoGO.svg",
    name: "KryptoGO",
    getUrl: (uri: string) => `https://kryptogo.com/wc?uri=${encodeURIComponent(uri)}`

  },
  {
    image: "nft.svg",
    name: "NFT",
    getUrl: (uri: string) => `https://nftrade.com/wc?uri=${encodeURIComponent(uri)}`
  },
  {
    image: "fireblocks.svg",
    name: "Fireblocks",
    getUrl: (uri: string) => `https://console.fireblocks.io/v2/wc?uri=${encodeURIComponent(uri)}`
  }
];

export default function ChangeWalletContent() {
  const { connect, walletName, connectionURI } = useWeb3();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(1);
  const [currentWallet, setCurrentWallet] = useState(walletName);

  const setWalletChangeModalOpenFn = useEvent(setWalletChangeModalOpen);

  const handleClose = () => setWalletChangeModalOpenFn(false);

  useEffect(
    () => {
      if (connectionURI) {
        setStep(2);
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
      <DialogCloseButton handleClose={() => {
        handleClose();
        setStep(1);
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

          <AbsoluteWalletCard active={currentWallet === "aw"} onClick={() => {
            setCurrentWallet("aw");
          }} />

          <WalletConnectV2Card active={currentWallet === "walletConnectV2"} onClick={() => {
            setCurrentWallet("walletConnectV2");
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

          console.log("Connection started");
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
        <Tabs view="separate">
          <Tab title="QR code">
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
          </Tab>
          <Tab title="Desktop">
            <div className={styles.wcDesktopWrapper}>
              {desktopWalletConnectLinks.map(link => {
                return <a key={link.name} target="_blank" className={styles.wcLink} href={link.getUrl(connectionURI || "")} rel="noreferrer">
                  <div className={styles.wcLinkContent}>
                    <div className={styles.wcLinkImage}>
                      <Image alt="Wallet Connect" src={`${wcImagesPath}/${link.image}`} width={32} height={32} />
                    </div>
                    {link.name}
                  </div>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.0072 11.2199L17.1805 16.3932L12.0072 21.5666C11.4872 22.0866 11.4872 22.9266 12.0072 23.4466C12.5272 23.9666 13.3672 23.9666 13.8872 23.4466L20.0072 17.3266C20.5272 16.8066 20.5272 15.9666 20.0072 15.4466L13.8872 9.32658C13.3672 8.80658 12.5272 8.80658 12.0072 9.32658C11.5005 9.84658 11.4872 10.6999 12.0072 11.2199Z" fill="#4B564B"/>
                  </svg>
                </a>;
              })}
            </div>
          </Tab>
        </Tabs>
      </>}
      {currentWallet === "walletConnectV2" && <>
        <div className={styles.title}>
          <Image alt={wallets[currentWallet].name} src={wallets[currentWallet].image} width={24} height={24} />
          <span>{wallets[currentWallet].name}</span>
        </div>
        <Tabs view="separate">
          <Tab title="QR code">
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
          </Tab>
          <Tab title="Desktop">
            <div className={styles.wcDesktopWrapper}>
              {desktopWalletConnectLinks.map(link => {
                return <a key={link.name} target="_blank" className={styles.wcLink} href={link.getUrl(connectionURI || "")} rel="noreferrer">
                  <div className={styles.wcLinkContent}>
                    <div className={styles.wcLinkImage}>
                      <Image alt="Wallet Connect" src={`${wcImagesPath}/${link.image}`} width={32} height={32} />
                    </div>
                    {link.name}
                  </div>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.0072 11.2199L17.1805 16.3932L12.0072 21.5666C11.4872 22.0866 11.4872 22.9266 12.0072 23.4466C12.5272 23.9666 13.3672 23.9666 13.8872 23.4466L20.0072 17.3266C20.5272 16.8066 20.5272 15.9666 20.0072 15.4466L13.8872 9.32658C13.3672 8.80658 12.5272 8.80658 12.0072 9.32658C11.5005 9.84658 11.4872 10.6999 12.0072 11.2199Z" fill="#4B564B"/>
                  </svg>
                </a>;
              })}
            </div>
          </Tab>
        </Tabs>
      </>}
      {currentWallet === "aw" && <>
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
