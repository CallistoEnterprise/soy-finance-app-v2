import React, {useCallback, useMemo, useState} from "react";
import styles from "./UnstakeLPTokensModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {closeUnStakeLPTokensDialog} from "../../models";
import {$isUnStakeLPTokensDialogOpened, $lpTokenToUnStake} from "../../models/stores";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import Button from "../../../../components/atoms/Button";
import {Farm} from "../../FarmsPage";
import {Contract, EthersError, isError, parseUnits} from "ethers";
import {LOCAL_FARM_ABI} from "../../../../shared/constants/abis";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import {ErrorCode} from "@ethersproject/logger";
import {useEthersError} from "../../../swap/hooks/useEthersError";
import {WrappedTokenInfo} from "../../../swap/functions";

export default function UnStakeLPTokensModal() {
  const isOpened = useStore($isUnStakeLPTokensDialogOpened);
  const closeUnStakeLPTokensDialogFn = useEvent(closeUnStakeLPTokensDialog);
  const { account, web3Provider } = useWeb3();

  const farmToUnStake: Farm = useStore($lpTokenToUnStake);

  const [value, setValue] = useState("0");

  const handleClose = useCallback(() => {
    closeUnStakeLPTokensDialogFn();
  }, [closeUnStakeLPTokensDialogFn])

  const tokenA = useMemo(() => {
    if(!farmToUnStake?.token || !farmToUnStake.token.address || !farmToUnStake.token.decimals || !farmToUnStake.token.address[820]) {
      return null;
    }

    const address: string = farmToUnStake.token.address[820]!;

    return new WrappedTokenInfo({
      symbol: farmToUnStake.token.symbol,
      address,
      chainId: 820,
      decimals: farmToUnStake.token.decimals,
      logoURI: "/images/tokens/callisto-46.png",
      name: farmToUnStake.token.symbol
    }, [])
  }, [farmToUnStake]);

  const tokenB = useMemo(() => {
    if(!farmToUnStake?.quoteToken || !farmToUnStake.quoteToken.address || !farmToUnStake.quoteToken.decimals || !farmToUnStake.quoteToken.address[820]) {
      return null;
    }

    const address: string = farmToUnStake.quoteToken.address[820]!;

    return new WrappedTokenInfo({
      symbol: farmToUnStake.quoteToken.symbol,
      address,
      chainId: 820,
      decimals: farmToUnStake.quoteToken.decimals,
      logoURI: "/images/tokens/callisto-46.png",
      name: farmToUnStake.quoteToken.symbol
    }, [])
  }, [farmToUnStake]);

  const {handleError} = useEthersError();

  const handleWithdraw = useCallback(async () => {
    if(!farmToUnStake || !account || !farmToUnStake.localFarmAddresses) {
      return;
    }


    const contract = new Contract(farmToUnStake.localFarmAddresses[820]!, LOCAL_FARM_ABI, await web3Provider?.getSigner(account));

    const valueToSend = parseUnits(value);

    const args = [
      valueToSend
    ];

    try {
      const gas = await contract["withdraw"]["estimateGas"](...args);

      const tx = await contract["withdraw"](...args, {gasLimit: gas});
      console.log(tx);
    } catch (e: EthersError) {
      handleError(e);
    }
  }, [account, farmToUnStake, handleError, value, web3Provider]);

  return <DrawerDialog isOpen={isOpened} onClose={handleClose}>
    <div className={styles.stakeLpTokensModal}>
      <DialogHeader handleClose={handleClose} title="Unstake lp tokens" />
      <div className={styles.content}>
        <TokenSelector
          setDialogOpened={null}
          isDialogOpened={null}
          pickedToken={null}
          pair={[tokenA, tokenB]}
          inputValue={value}
          handleInputChange={setValue}
          handleTokenChange={null}
          label="Unstake"
          balance={null} />
        <div className={styles.buttons}>
          <Button onClick={handleClose} fullWidth variant="outlined">Cancel</Button>
          <Button onClick={handleWithdraw} fullWidth>Unstake</Button>
        </div>
      </div>
    </div>
  </DrawerDialog>;
}
