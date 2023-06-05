import React from "react";
import styles from "./NoPool.module.scss";
import BigIconWrapper from "../../../../components/atoms/BigIconWrapper";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import {Property} from "csstype";
import Height = Property.Height;

interface Props {
  height?: Height,
  onClick: any
}

export default function NoPool({height, onClick}: Props) {
  return <div style={height && {height}} className={styles.noPool}>
    <BigIconWrapper iconName="search" />
    <div className={styles.spacer} />
    <div className={styles.textWrapper}>
      <Text align="center" weight={700} variant={24}>
        You don’t have liquidity in this pool yet</Text>
    </div>

    <Button variant="text" onClick={onClick}>Add liquidity</Button>
  </div>;
}
