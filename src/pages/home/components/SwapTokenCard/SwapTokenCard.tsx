import React from "react";
import styles from "./SwapTokenCard.module.scss";
import Button from "../../../../shared/components/Button";
import Svg from "../../../../shared/components/Svg/Svg";
import {formatBalance, isNativeToken} from "../../../../shared/utils";
import PickTokenDialog from "../PickTokenDialog";
import useNetworkSectionBalance from "../../../../shared/hooks/useNetworkSectionBalance";

export default function SwapTokenCard({setDialogOpened, isDialogOpened, pickedToken, inputValue, setToken, handleInputChange, recalculateTrade}) {
  const {network, contracts} = useNetworkSectionBalance({chainId: 820})

  return <div className={styles.swapCard}>
    <div className={styles.swapCardHeader}>
      <h3 className="font-14 bold">From</h3>
      <div className={styles.partButtons}>
        <Button variant="outlined" size="small">25%</Button>
        <Button variant="outlined" size="small">50%</Button>
        <Button variant="outlined" size="small">75%</Button>
        <Button variant="outlined" size="small">Max</Button>
      </div>
    </div>
    <div>
      <div className={styles.inputWrapper}>
        <input placeholder="0.0" value={inputValue} onChange={(e) => {
          handleInputChange(e.target.value);
          recalculateTrade(e.target.value, pickedToken);
        }} type="text" className={styles.amountInput}/>
        <div className={styles.picker}>
          {pickedToken && <>
            <button onClick={() => setDialogOpened(true)} className={styles.tokenSelect}>
              <img width={24} height={24} src={pickedToken.imgUri} alt={pickedToken.original_name} />
              {pickedToken.original_name}
              <Svg iconName="expand-arrow" />
            </button>
          </>}
          {!pickedToken && <>
            <button onClick={() => setDialogOpened(true)} className={styles.tokenSelect}>
              Select token
            </button>
          </>}
        </div>
      </div>
      <div className={styles.balanceBox}>
          <span>
            ~0.08 USD
          </span>
        <span>Balance:
          {isNativeToken(pickedToken?.token_address) ?
            formatBalance(network?.balance) :
            formatBalance(contracts?.find(c => c.symbol === pickedToken?.original_name)?.balance) || "0.0"
          }
        </span>
      </div>

      <PickTokenDialog pickToken={(token) => {
        setToken(token);
        recalculateTrade(inputValue, token);
      }} isOpened={isDialogOpened} handleClose={() => setDialogOpened(false)} />
    </div>
  </div>
    ;
}
