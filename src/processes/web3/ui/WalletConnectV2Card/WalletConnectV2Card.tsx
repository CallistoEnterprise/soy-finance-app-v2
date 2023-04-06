import React from "react";
import Image from "next/image";
import {wallets} from "../../constants/wallets";
import clsx from "clsx";
import styles from "../MetamaskCard/MetamaskCard.module.scss";

interface Props {
  onClick: any,
  active: boolean
}

export default function WalletConnectV2Card({active, onClick}: Props) {
  return <button
    onClick={onClick}
    className={clsx(
      styles.cardWrapper,
      active && styles.active
    )}
  >
    <span className={styles.cardInfo}>
          <Image alt={wallets.walletConnectV2.name} src={wallets.walletConnectV2.image} width={30} height={30}/>
          {wallets.walletConnectV2.name}
      </span>
  </button>;
}
