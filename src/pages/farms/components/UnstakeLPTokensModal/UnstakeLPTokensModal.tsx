import React, {useCallback, useMemo, useState} from "react";
import styles from "./UnstakeLPTokensModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {closeUnStakeLPTokensDialog} from "../../models";
import {$farmsUserData, $isUnStakeLPTokensDialogOpened, $lpTokenToUnStake} from "../../models/stores";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import Button from "../../../../components/atoms/Button";
import {Farm} from "../../FarmsPage";
import {Contract, EthersError, formatUnits, parseUnits} from "ethers";
import {LOCAL_FARM_ABI} from "../../../../shared/constants/abis";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {useEthersError} from "../../../swap/hooks/useEthersError";
import {WrappedTokenInfo} from "../../../swap/functions";
import {getLogo} from "../../../../shared/utils";

export default function UnStakeLPTokensModal() {
  const isOpened = useStore($isUnStakeLPTokensDialogOpened);
  const closeUnStakeLPTokensDialogFn = useEvent(closeUnStakeLPTokensDialog);
  const { account, web3Provider, chainId } = useWeb3();
  const farmToUnStake: Farm = useStore($lpTokenToUnStake);
  const farmsUserData = useStore($farmsUserData);

  const [unstaking, setUnstaking] = useState(false);

  const stakedBalance = useMemo(() => {
    if(!farmToUnStake || !farmsUserData[farmToUnStake?.pid]) {
      return 0;
    }

    return formatUnits(farmsUserData[farmToUnStake?.pid]?.staked[0])

  }, [farmToUnStake, farmsUserData]);

  const [value, setValue] = useState("0");

  const handleClose = useCallback(() => {
    closeUnStakeLPTokensDialogFn();
  }, [closeUnStakeLPTokensDialogFn])

  const tokenA = useMemo(() => {
    if(!chainId || !farmToUnStake?.token || !farmToUnStake.token.address || !farmToUnStake.token.decimals || !farmToUnStake.token.address[820]) {
      return null;
    }

    const address: string = farmToUnStake.token.address[chainId]!;

    return new WrappedTokenInfo({
      symbol: farmToUnStake.token.symbol,
      address,
      chainId,
      decimals: farmToUnStake.token.decimals,
      logoURI: getLogo({address: address.toLowerCase() }),
      name: farmToUnStake.token.symbol
    }, [])
  }, [chainId, farmToUnStake?.token]);

  const tokenB = useMemo(() => {
    if(!farmToUnStake?.quoteToken || !farmToUnStake.quoteToken.address || !farmToUnStake.quoteToken.decimals || !farmToUnStake.quoteToken.address[chainId] || !chainId) {
      return null;
    }

    const address: string = farmToUnStake.quoteToken.address[chainId]!;

    return new WrappedTokenInfo({
      symbol: farmToUnStake.quoteToken.symbol,
      address,
      chainId: chainId,
      decimals: farmToUnStake.quoteToken.decimals,
      logoURI: getLogo({address: address.toLowerCase() }),
      name: farmToUnStake.quoteToken.symbol
    }, [])
  }, [farmToUnStake, chainId]);

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

      const tx = await contract["withdraw"](...args, {gasLimit: gas + 30000n});
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
          balance={stakedBalance} />
        <div className={styles.buttons}>
          <Button onClick={handleClose} fullWidth variant="outlined">Cancel</Button>
          <Button loading={unstaking} onClick={async () => {
            setUnstaking(true);
            try {
              await handleWithdraw();
              setUnstaking(false);
            } catch (e) {
              setUnstaking(false);
              console.log(e);
            }

          }} fullWidth>Unstake</Button>
        </div>
      </div>
    </div>
  </DrawerDialog>;
}
