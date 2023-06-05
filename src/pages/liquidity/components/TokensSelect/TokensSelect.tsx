import React, {useState} from "react";
import styles from "./TokensSelect.module.scss";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import Svg from "../../../../components/atoms/Svg/Svg";
import Text from "../../../../components/atoms/Text";

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
          {pickedToken.symbol}
        </div> : <div className={styles.pickedTokenInfo}>
            <span className={styles.iconWrapper}>
              <Svg iconName="currency"/>
            </span>
          <Text variant={16}>Select token</Text>
        </div>}
      <Svg iconName="arrow-bottom"/>
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
