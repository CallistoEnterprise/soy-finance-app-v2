import React, {useCallback, useState} from "react";
import styles from "./StakeLPTokensModal.module.scss";
import {useEvent, useStore} from "effector-react";
import {closeStakeLPTokensDialog} from "../../models";
import Dialog from "../../../../components/molecules/Dialog";
import {$isStakeLPTokensDialogOpened, $lpTokenToStake} from "../../models/stores";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import Button from "../../../../components/atoms/Button";
import {Farm} from "../../FarmsPage";
import {Contract, formatEther, formatUnits, parseUnits} from "ethers";
import {ERC_20_ABI, ERC_223_ABI, LP_TOKEN_ABI} from "../../../../shared/constants/abis";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";

export default function StakeLPTokensModal() {
  const {web3Provider, account} = useWeb3();
  const isOpened = useStore($isStakeLPTokensDialogOpened);
  const closeStakeLPTokensDialogFn = useEvent(closeStakeLPTokensDialog);

  const farmToStake: Farm = useStore($lpTokenToStake);

  const [value, setValue] = useState("0");

  const handleClose = useCallback(() => {
    closeStakeLPTokensDialogFn();
  }, [closeStakeLPTokensDialogFn])

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

    const gas = await contract["transfer"]["estimateGas"](...args);

    const tx = await contract["transfer"](...args, {gasLimit: gas});

    console.log(tx);
  }, [account, farmToStake, value, web3Provider]);

  return <Dialog isOpen={isOpened} onClose={handleClose}>
    <div className={styles.stakeLpTokensModal}>
      <DialogHeader handleClose={handleClose} title="Stake lp tokens" />
      <div className={styles.content}>
        <TokenSelector
          setDialogOpened={null}
          isDialogOpened={null}
          pickedToken={null}
          pair={[farmToStake?.token, farmToStake?.quoteToken]}
          inputValue={value}
          handleInputChange={setValue}
          handleTokenChange={null}
          label="Stake"
          balance={null} />
        <div className={styles.buttons}>
          <Button onClick={handleClose} fullWidth variant="outlined">Cancel</Button>
          <Button disabled={!value} onClick={handleStake} fullWidth>Stake</Button>
        </div>
      </div>
    </div>
  </Dialog>;
}
