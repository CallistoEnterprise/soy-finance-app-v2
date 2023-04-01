import React from "react";
import Image from "next/image";
import styles from "./MetamaskCard.module.scss";
import {wallets} from "../../constants/wallets";
import clsx from "clsx";

interface Props {
  onClick: any,
  active: boolean
}

export default function MetamaskCard({ onClick, active }: Props) {

  return <button
    onClick={onClick}
    className={clsx(
      styles.cardWrapper,
      active && styles.active
    )}
  >
      <span className={styles.cardInfo}>
        <span className={styles.metamaskImageWrapper}>
          <Image alt={wallets.metamask.name} src={wallets.metamask.image} width={32} height={32} />
        </span>
        {wallets.metamask.name}
      </span>
  </button>;
}
