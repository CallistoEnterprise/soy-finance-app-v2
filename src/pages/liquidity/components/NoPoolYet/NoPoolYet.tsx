import React from "react";
import styles from "./NoPoolYet.module.scss";
import BigIconWrapper from "../../../../components/atoms/BigIconWrapper";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import {Property} from "csstype";
import Height = Property.Height;

interface Props {
  height?: Height,
  onClick: any
}

export default function NoPoolYet({height = 578, onClick}: Props) {
  return <div style={height && {height}} className={styles.noPool}>
    <BigIconWrapper iconName="liquidity" />
    <div className={styles.textWrapper}>
      <Text align="center" weight={700} variant={24}>
        No liquidity yet
      </Text>
    </div>
    <Text color="secondary" align="center">Don&apos;t see a pool you joined?</Text>

    <div className={styles.buttonWrapper}>
      <Button onClick={onClick}>Find other LP tokens</Button>
    </div>
  </div>;
}
