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
import {useBalanceOf} from "../../../shared/web3/hooks/useBalanceOf";
import {formatEther} from "ethers";
import {WrappedTokenInfo} from "../../../pages/swap/hooks/useTrade";
import {TokenAmount} from "@callisto-enterprise/soy-sdk";

interface Props {
  setDialogOpened: any,
  isDialogOpened: boolean,
  pickedToken: WrappedTokenInfo,
  inputValue: string,
  handleInputChange: any,
  handleTokenChange: any,
  label: string,
  pair?: [WrappedTokenInfo, WrappedTokenInfo],
  balance: TokenAmount | null
}

export default function TokenSelector({setDialogOpened, isDialogOpened, pickedToken, inputValue, handleInputChange, handleTokenChange, label, pair, balance}: Props) {
  const {chainId} = useWeb3();
  // const {network, contracts} = useNetworkSectionBalance({chainId});
  const {loading, price} = useFiatPrice(pickedToken?.address, chainId);

  // const balance = useMemo(() => {
  //   return isNativeToken(pickedToken?.address) ? network?.balance : contracts?.find(c => c.symbol === pickedToken?.address)?.balance;
  // }, [pickedToken, network, contracts]);

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
        pair={pair}
      />
      <div className={styles.balanceBox}>
          <span>
            {!loading && pickedToken && price && `~ ${formatBalance(Number(inputValue) * price)} USD`}
            {loading && pickedToken && "loading..."}
            {!pickedToken && "~ 0.0 USD"}
          </span>
        <span>Balance:
          {" "}
          {balance ? balance.toSignificant(2) : "0.0"}
        </span>
      </div>

      <PickTokenDialog pickToken={(token) => {
        handleTokenChange(token, inputValue);
      }} isOpened={isDialogOpened} handleClose={() => setDialogOpened(false)} />
    </div>
  </div>;
}
