import React, {useMemo} from "react";
import styles from "./TokenSelector.module.scss";
import {formatBalance, isNativeToken} from "../../../shared/utils";
import PickTokenDialog from "../PickTokenDialog";
import useNetworkSectionBalance from "../../../shared/hooks/useNetworkSectionBalance";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useFiatPrice} from "../../../pages/swap/hooks/useFiatPrice";
import {SwapToken} from "../../../pages/swap/models/types";
import InputWithTokenPick from "../../molecules/InputWithTokenPick";
import PercentageButtons from "../../molecules/PercentageButtons";
import Text from "../../atoms/Text";

interface Props {
  setDialogOpened: any,
  isDialogOpened: boolean,
  pickedToken: SwapToken,
  inputValue: string,
  handleInputChange: any,
  handleTokenChange: any,
  label: string
}

export default function TokenSelector({setDialogOpened, isDialogOpened, pickedToken, inputValue, handleInputChange, handleTokenChange, label}: Props) {
  const {chainId} = useWeb3();
  const {network, contracts} = useNetworkSectionBalance({chainId})
  const {loading, price} = useFiatPrice(pickedToken?.token_address, chainId);

  const balance = useMemo(() => {
    return isNativeToken(pickedToken?.token_address) ? network?.balance : contracts?.find(c => c.symbol === pickedToken?.original_name)?.balance;
  }, [pickedToken, network, contracts]);

  console.log(balance);

  return <div className={styles.swapCard}>
    <div className={styles.swapCardHeader}>
      <Text variant={14} weight={700} tag="h3">{label}</Text>
      {chainId && pickedToken && !!Number(balance) && <PercentageButtons
        handleClick={handleInputChange}
        balance={balance}
        inputValue={inputValue}
      />}
    </div>
    <div>
      <InputWithTokenPick
        handleChange={handleInputChange}
        value={inputValue}
        pickedToken={pickedToken}
        openDialog={() => setDialogOpened(true)}
      />
      <div className={styles.balanceBox}>
          <span>
            {!loading && pickedToken && price && `~ ${formatBalance(Number(inputValue) * price)} USD`}
            {loading && pickedToken && "loading..."}
            {!pickedToken && "~ 0.0 USD"}
          </span>
        <span>Balance:
          {" "}
          {balance ? formatBalance(balance) : "0.0"}
        </span>
      </div>

      <PickTokenDialog pickToken={(token) => {
        handleTokenChange(token, inputValue);
      }} isOpened={isDialogOpened} handleClose={() => setDialogOpened(false)} />
    </div>
  </div>;
}
