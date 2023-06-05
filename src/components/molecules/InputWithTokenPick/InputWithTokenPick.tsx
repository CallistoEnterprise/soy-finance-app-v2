import React from "react";
import styles from "./InputWithTokenPick.module.scss";
import Svg from "../../atoms/Svg/Svg";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import Text from "../../atoms/Text";
import {WrappedTokenInfo} from "../../../pages/swap/hooks/useTrade";

interface Props {
  value: string,
  handleChange: (value: string) => void,
  pickedToken: WrappedTokenInfo,
  openDialog: () => void,
  pair?: [WrappedTokenInfo, WrappedTokenInfo]
}

export default function InputWithTokenPick({value, handleChange, pickedToken, openDialog, pair}: Props) {
  const {showMessage} = useSnackbar();
  const {chainId} = useWeb3();

  return <div className={styles.inputWrapper}>
    <input placeholder="0.0" value={value} onChange={(e) => {
      handleChange(e.target.value);
    }} type="text" className={styles.amountInput}/>
    <div className={styles.picker}>
      <button onClick={() => {
        if(pair) {
          return;
        }

        if(!chainId) {
          return showMessage("Connect your wallet to proceed", "warning");
        } else {
          openDialog();
        }
      }} className={styles.tokenSelect}>
        {pair ? <>
          {pair[0] && pair[1] ? <>
            <div className={styles.pairLogos}>
              <span className={styles.iconWrapper}>
                <img width={24} height={24} src={pair[0].logoURI} alt={pair[0].name}/>
              </span>
              <span className={styles.iconWrapper}>
                <img width={24} height={24} src={pair[1].logoURI} alt={pair[1].name}/>
              </span>
            </div>
            <div>
              <span>{pair[0].symbol}</span>
              -
              <span>{pair[1].symbol}</span>
            </div>
            </>
            : <>
            <span className={styles.iconWrapper}>
              <Svg iconName="currency"/>
            </span>
              <Text variant={16}>Select token</Text>
              <span className={styles.expandArrow}>
              <Svg iconName="arrow-bottom"/>
            </span>
            </>}

        </> : <>
          {pickedToken
            ? <>
            <span className={styles.iconWrapper}>
              <img width={24} height={24} src={pickedToken.logoURI} alt={pickedToken.name}/>
            </span>

              {pickedToken.symbol}
              <Svg iconName="arrow-bottom"/>
            </>
            : <>
            <span className={styles.iconWrapper}>
              <Svg iconName="currency"/>
            </span>
              <Text variant={16}>Select token</Text>
              <span className={styles.expandArrow}>
              <Svg iconName="arrow-bottom"/>
            </span>
            </>
          }
        </>}



      </button>
    </div>
  </div>;
}
