import React, { useCallback, useMemo, useState } from "react";
import DialogHeader from "@/components/DialogHeader";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useUnstakeLPTokensStore } from "@/app/[locale]/farms/stores/stake";
import { useFarmsUserDataStore } from "@/app/[locale]/farms/stores";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Abi, Address, parseUnits } from "viem";
import TokenSelector from "@/components/TokenSelector";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { LOCAL_FARM_ABI } from "@/config/abis/localFarm";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import addToast from "@/other/toast";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function UnstakeLPTokensModal() {
  const { chainId } = useAccount();
  const {address: account} = useAccount();

  const {
    isUnstakeLPTokensDialogOpened: isOpened,
    setIsUnstakeLPTokensDialogOpened: setIsOpened,
    lpTokenToUnstake: farmToUnstake
  } = useUnstakeLPTokensStore();

  const [staking, setStaking] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [value, setValue] = useState("");

  const { farmsUserData } = useFarmsUserDataStore();

  const {addTransaction} = useRecentTransactionsStore();

  const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const handleUnstake = useCallback(async () => {
    if(!farmToUnstake || !account || !walletClient || !chainId) {
      return;
    }

    //TODO: rename methods
    setOpened(`Withdraw ${value} LP tokens`);
    setIsOpened(false);

    const params: {
      address: Address,
      account: Address,
      abi: Abi,
      functionName: "withdraw",
      args: [
        bigint
      ]
    } = {
      address: farmToUnstake.localFarmAddress,
      account,
      abi: LOCAL_FARM_ABI,
      functionName: "withdraw",
      args: [
        parseUnits(value, 18)
      ]
    }

    try {
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      })
      const hash = await walletClient.writeContract(request);

      if(hash) {
        addTransaction({
          account,
          hash,
          chainId,
          title: `Unstake ${value} ${farmToUnstake.token.symbol}-${farmToUnstake.quoteToken.symbol} LP Tokens`,
        }, account);
        setSubmitted(hash, chainId as any);
      }
    } catch (e) {
      console.log(e);
      addToast("Something went wrong, please contact support", "error");
      setClose();
    }
  }, [account, addTransaction, chainId, farmToUnstake, publicClient, setClose, setIsOpened, setOpened, setSubmitted, value, walletClient]);

  const pair: [WrappedToken, WrappedToken] | [undefined, undefined] = useMemo(() => {
    if(chainId && farmToUnstake?.token && farmToUnstake?.quoteToken) {
      return [
        new WrappedToken(
          chainId,
          farmToUnstake.token.address!,
          farmToUnstake.token.decimals!,
          farmToUnstake.token.symbol,
          farmToUnstake.token.name,
          farmToUnstake.token.logoURI,
        ),
        new WrappedToken(
          chainId,
          farmToUnstake.quoteToken.address!,
          farmToUnstake.quoteToken.decimals!,
          farmToUnstake.quoteToken.symbol,
          farmToUnstake.quoteToken.name,
          farmToUnstake.quoteToken.logoURI,
        )
      ]
    }

    return [undefined, undefined];
  }, [chainId, farmToUnstake?.quoteToken, farmToUnstake?.token]);

  const lpToken = useMemo(() => {
    if(chainId && farmToUnstake) {
      return new WrappedToken(
        chainId,
        farmToUnstake.lpAddress,
        18,
        farmToUnstake.lpSymbol,
        farmToUnstake.lpSymbol,
        "/images/all-tokens/placeholder.svg",
      )
    }

    return null;
  }, [chainId, farmToUnstake]);

  console.log(farmToUnstake);

  return <DrawerDialog isOpen={isOpened} setIsOpen={setIsOpened}>
    <div className="w-full xl:w-[480px]">
      <DialogHeader handleClose={() => setIsOpened(false)} title="Unstake lp tokens" />
      <div className="p-10">
        <TokenSelector
          token={lpToken}
          amount={value}
          setAmount={(value) => {
            setValue(value);
          }}
          onPick={() => undefined}
          label="Unstake"
          balance={farmsUserData[farmToUnstake?.pid]?.staked[0]}
          pair={pair}
        />
        <div className="flex gap-2.5 mt-5">
          <PrimaryButton onClick={() => setIsOpened(false)} fullWidth variant="outlined">Cancel</PrimaryButton>
          <PrimaryButton onClick={async () => {
            setStaking(true);
            try {
              await handleUnstake();
              setStaking(false);
            } catch (e) {
              setStaking(false);
            }
          }} fullWidth>Unstake</PrimaryButton>
        </div>
      </div>
    </div>
  </DrawerDialog>;
}
