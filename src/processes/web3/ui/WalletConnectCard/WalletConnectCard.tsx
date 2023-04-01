import React from "react";
import Image from "next/image";
import {wallets} from "../../constants/wallets";
import clsx from "clsx";
import styles from "../MetamaskCard/MetamaskCard.module.scss";

interface Props {
  onClick: any,
  active: boolean
}

export default function WalletConnectCard({active, onClick}: Props) {
  return <button
    onClick={onClick}
    className={clsx(
      styles.cardWrapper,
      active && styles.active
    )}
  >
    <span className={styles.cardInfo}>
          <Image alt={wallets.walletConnect.name} src={wallets.walletConnect.image} width={30} height={30}/>
          {wallets.walletConnect.name}
      </span>
  </button>;
}