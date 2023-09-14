import React, {useEffect} from "react";
import styles from "./TokenSelector.module.scss";
import {formatBalance} from "../../../shared/utils";
import PickTokenDialog from "../PickTokenDialog";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useFiatPrice} from "../../../pages/swap/hooks/useFiatPrice";
import InputWithTokenPick from "../../molecules/InputWithTokenPick";
import PercentageButtons from "../../molecules/PercentageButtons";
import Text from "../../atoms/Text";
import {TokenAmount} from "@callisto-enterprise/soy-sdk";
import {WrappedTokenInfo} from "../../../pages/swap/functions";
import {fetchCloPrices} from "../../../shared/fetcher";
import {IIFE} from "../../../shared/web3/functions/iife";
import {getDeltaTimestamps, useBlocksFromTimestamps} from "../../../pages/farms/FarmsPage";

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
  const {loading, price} = useFiatPrice(pickedToken?.address, chainId);

  const [t24, t48, tWeek] = getDeltaTimestamps();

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])

  useEffect(() => {
    IIFE(async () => {
      if(blocks) {
        const [block24, block48, blockWeek] = blocks;

        const fetchPrices = await fetchCloPrices(block24.number, block48.number, blockWeek.number)
        console.log(fetchPrices);
      }
    });
  }, [blocks]);

  return <div className={styles.swapCard}>
    <div className={styles.swapCardHeader}>
      <Text variant={14} weight={700} tag="h3">{label}</Text>
      {chainId && (pickedToken || pair) && !!Number(balance) && <PercentageButtons
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
          {balance ? (+balance).toFixed(6) : "0.0"}
        </span>
      </div>

      <PickTokenDialog pickToken={(token) => {
        handleTokenChange(token, inputValue);
      }} isOpened={isDialogOpened} handleClose={() => setDialogOpened(false)} />
    </div>
  </div>;
}
