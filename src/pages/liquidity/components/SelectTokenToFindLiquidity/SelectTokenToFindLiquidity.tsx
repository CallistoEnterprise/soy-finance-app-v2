import React from "react";
import styles from "./SelectTokenToFindLiquidity.module.scss";
import EmptyStateIcon from "../../../../components/atoms/EmptyStateIcon";
import Text from "../../../../components/atoms/Text";
import {Property} from "csstype";
import Height = Property.Height;

interface Props {
  height?: Height
}

export default function SelectTokenToFindLiquidity({height}: Props) {
  return <div style={height && {height}} className={styles.noPool}>
    <EmptyStateIcon iconName="drop" />
    <div className={styles.spacer} />
    <div className={styles.textWrapper}>
      <Text align="center" weight={700} variant={24}>
        Select a token to find your liquidity</Text>
    </div>

    <Text color="secondary" >Select the liquidity pair you are looking for</Text>
  </div>;
}
