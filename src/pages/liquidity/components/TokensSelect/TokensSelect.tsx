import React, {useState} from "react";
import styles from "./TokensSelect.module.scss";
import Svg from "../../../../components/atoms/Svg/Svg";
import Text from "../../../../components/atoms/Text";
import {WrappedTokenInfo} from "../../../swap/functions";

interface Props {
  pickedToken: WrappedTokenInfo,
  onPick: any,
  tokens: WrappedTokenInfo[]
}

export default function TokensSelect({pickedToken, onPick, tokens}: Props) {
  const [isOpened, setIsOpened] = useState(false);

  return <div className={styles.tokenSelect}>
    <button onClick={() => setIsOpened(!isOpened)} className={styles.selectToken}>
      {pickedToken ?
        <div className={styles.pickedTokenInfo}>
          <img src={pickedToken.logoURI} alt={pickedToken.name}/>
          <Text>{pickedToken.symbol}</Text>
        </div> : <div className={styles.pickedTokenInfo}>
            <span className={styles.iconWrapper}>
              <Svg iconName="currency"/>
            </span>
          <Text variant={16}>Select token</Text>
        </div>}
      <span className={styles.expandArrow}><Svg iconName="arrow-bottom"/></span>
    </button>
    {isOpened && <div className={styles.tokensList}>
      {tokens.map((token) => {
        return <button key={token.address} onClick={() => {
          onPick(token);
          setIsOpened(false);
        }} className={styles.listItem}>
          <Text>{token.symbol}</Text>
          <img src={token.logoURI} alt={token.name} />
        </button>
      })}
    </div>}
  </div>;
}
