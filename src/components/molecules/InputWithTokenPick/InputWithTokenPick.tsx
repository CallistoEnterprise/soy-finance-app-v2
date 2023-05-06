import React, {ChangeEvent} from "react";
import styles from "./InputWithTokenPick.module.scss";
import Svg from "../../atoms/Svg/Svg";
import {SwapToken} from "../../../pages/swap/models/types";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import Text from "../../atoms/Text";

interface Props {
  value: string,
  handleChange: (value: string) => void,
  pickedToken: SwapToken,
  openDialog: () => void
}

export default function InputWithTokenPick({value, handleChange, pickedToken, openDialog}: Props) {
  const {showMessage} = useSnackbar();
  const {chainId} = useWeb3();

  return <div className={styles.inputWrapper}>
    <input placeholder="0.0" value={value} onChange={(e) => {
      handleChange(e.target.value);
    }} type="text" className={styles.amountInput}/>
    <div className={styles.picker}>
      <button onClick={() => {
        if(!chainId) {
          return showMessage("Connect your wallet to proceed", "warning");
        } else {
          openDialog();
        }
      }} className={styles.tokenSelect}>
        {pickedToken
          ? <>
            <span className={styles.iconWrapper}>
              <img width={24} height={24} src={pickedToken.imgUri} alt={pickedToken.original_name}/>
            </span>

            {pickedToken.original_name}
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
      </button>
    </div>
  </div>;
}
