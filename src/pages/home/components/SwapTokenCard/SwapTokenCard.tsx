import React from "react";
import styles from "./SwapTokenCard.module.scss";
import Button from "../../../../shared/components/Button";
import Svg from "../../../../shared/components/Svg/Svg";
import {formatBalance, isNativeToken} from "../../../../shared/utils";
import PickTokenDialog from "../PickTokenDialog";
import useNetworkSectionBalance from "../../../../shared/hooks/useNetworkSectionBalance";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import {useFiatPrice} from "../Swap/hooks/useFiatPrice";
import {SwapToken} from "../Swap/models/types";

interface Props {
  setDialogOpened: any,
  isDialogOpened: boolean,
  pickedToken: SwapToken,
  inputValue: string,
  setToken: any,
  handleInputChange: any,
  recalculateTrade: any
}

export default function SwapTokenCard({setDialogOpened, isDialogOpened, pickedToken, inputValue, setToken, handleInputChange, recalculateTrade}: Props) {
  const {chainId} = useWeb3();
  const {network, contracts} = useNetworkSectionBalance({chainId})
  const { showMessage } = useSnackbar();
  const {loading, price} = useFiatPrice(pickedToken?.token_address, chainId);


  console.log("PRICE IS GOOOING ON");
  console.log(loading);
  console.log(price);
  function showComingSoon() {
    showMessage("Coming soon", "info");
  }

  return <div className={styles.swapCard}>
    <div className={styles.swapCardHeader}>
      <h3 className="font-14 bold">From</h3>
      <div className={styles.partButtons}>
        <Button onClick={showComingSoon} variant="outlined" size="small">25%</Button>
        <Button onClick={showComingSoon} variant="outlined" size="small">50%</Button>
        <Button onClick={showComingSoon} variant="outlined" size="small">75%</Button>
        <Button onClick={showComingSoon} variant="outlined" size="small">Max</Button>
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
            {!loading && pickedToken && price && `~ ${formatBalance(Number(inputValue) * price)} USD`}
            {loading && pickedToken && "loading..."}
            {!pickedToken && "~ 0.0 USD"}
          </span>
        <span>Balance:
          {" "}
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
