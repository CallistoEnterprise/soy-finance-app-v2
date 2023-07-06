import React from "react";
import styles from "./ConnectWalletToSeeLiquidity.module.scss";
import EmptyStateIcon from "../../../../components/atoms/EmptyStateIcon";
import Text from "../../../../components/atoms/Text";
import {Property} from "csstype";
import Height = Property.Height;
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";

interface Props {
  height?: Height
}

export default function ConnectWalletToSeeLiquidity({height = 578}: Props) {
  return <div style={height && {height}} className={styles.noPool}>
    <EmptyStateIcon iconName="wallet" />
    <div className={styles.textWrapper}>
      <Text align="center" weight={700} variant={24}>
        Connect to a wallet to view your liquidity</Text>
    </div>

    <ConnectWalletButton />
  </div>;
}
