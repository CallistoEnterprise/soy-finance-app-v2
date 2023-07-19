import React, {useCallback, useMemo, useState} from "react";
import styles from "./StakeLPTokensModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {closeStakeLPTokensDialog} from "../../models";
import {$farmsUserData, $isStakeLPTokensDialogOpened, $lpTokenToStake} from "../../models/stores";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import Button from "../../../../components/atoms/Button";
import {Farm} from "../../FarmsPage";
import {Contract, EthersError, formatUnits, parseUnits} from "ethers";
import {LP_TOKEN_ABI} from "../../../../shared/constants/abis";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {useEthersError} from "../../../swap/hooks/useEthersError";
import {WrappedTokenInfo} from "../../../swap/functions";
import {getLogo} from "../../../../shared/utils";

export default function StakeLPTokensModal() {
  const {web3Provider, account, chainId} = useWeb3();
  const isOpened = useStore($isStakeLPTokensDialogOpened);
  const closeStakeLPTokensDialogFn = useEvent(closeStakeLPTokensDialog);

  const [staking, setStaking] = useState(false);

  const farmToStake: Farm = useStore($lpTokenToStake);

  const [value, setValue] = useState("0");

  const handleClose = useCallback(() => {
    closeStakeLPTokensDialogFn();
  }, [closeStakeLPTokensDialogFn]);

  const farmsUserData = useStore($farmsUserData);

  const {handleError} = useEthersError();

  const handleStake = useCallback(async () => {
    if(!farmToStake || !account) {
      return;
    }

    const contract = new Contract(farmToStake.lpAddresses[820]!, LP_TOKEN_ABI, await web3Provider?.getSigner(account));

    const valueToSend = parseUnits(value);

    const args = [
      farmToStake.localFarmAddresses?.["820"],
      valueToSend
    ];

    console.log(contract);
    console.log(args);



    try {
      const gas = await contract["transfer"]["estimateGas"](...args);

      const tx = await contract["transfer"](...args, {gasLimit: gas});
      console.log(tx);
    } catch (e: EthersError) {
      handleError(e);
    }

  }, [account, farmToStake, handleError, value, web3Provider]);

  const pair = useMemo(() => {
    if(chainId && farmToStake?.token && farmToStake?.quoteToken) {
      return [
        new WrappedTokenInfo({
          address: farmToStake.token.address![chainId],
          symbol: farmToStake.token.symbol,
          name: farmToStake.token.symbol,
          decimals: farmToStake.token.decimals!,
          logoURI: getLogo({address: farmToStake.token.address?.[chainId].toLowerCase()}),
          chainId: chainId
        }, []),
        new WrappedTokenInfo({
          address: farmToStake.quoteToken.address![chainId],
          symbol: farmToStake.quoteToken.symbol,
          name: farmToStake.quoteToken.symbol,
          decimals: farmToStake.quoteToken.decimals!,
          logoURI: getLogo({address: farmToStake.quoteToken.address?.[chainId].toLowerCase()}),
          chainId: chainId
        }, [])
      ]
    }

    return [undefined, undefined];
  }, [chainId, farmToStake?.quoteToken, farmToStake?.token]);

  return <DrawerDialog isOpen={isOpened} onClose={handleClose}>
    <div className={styles.stakeLpTokensModal}>
      <DialogHeader handleClose={handleClose} title="Stake lp tokens" />
      <div className={styles.content}>
        <TokenSelector
          setDialogOpened={null}
          isDialogOpened={null}
          pickedToken={null}
          pair={pair}
          inputValue={value}
          handleInputChange={setValue}
          handleTokenChange={null}
          label="Stake"
          balance={farmsUserData[farmToStake?.pid]?.lpBalance ? formatUnits(farmsUserData[farmToStake?.pid]?.lpBalance[0]) : 0} />
        <div className={styles.buttons}>
          <Button onClick={handleClose} fullWidth variant="outlined">Cancel</Button>
          <Button loading={staking} disabled={!value} onClick={async () => {
            setStaking(true);
            try {
              await handleStake();
              setStaking(false);
            } catch (e) {
              setStaking(false);
            }
          }} fullWidth>Stake</Button>
        </div>
      </div>
    </div>
  </DrawerDialog>;
}
