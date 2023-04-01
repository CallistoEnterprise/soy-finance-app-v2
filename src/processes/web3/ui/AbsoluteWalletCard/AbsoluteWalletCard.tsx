import React from "react";
import Image from "next/image";
import {wallets} from "../../constants/wallets";
import clsx from "clsx";
import styles from "../MetamaskCard/MetamaskCard.module.scss";

interface Props {
  onClick: any,
  active: boolean
}

export default function AbsoluteWalletCard({onClick, active}: Props) {

  return <button
    onClick={onClick}
    className={clsx(
      styles.cardWrapper,
      active && styles.active
    )}
  >
    <span className={styles.cardInfo}>
      <Image alt={wallets.aw.name} src={wallets.aw.image} width={30} height={30}/>
      {wallets.aw.name}
    </span>
  </button>;
}
