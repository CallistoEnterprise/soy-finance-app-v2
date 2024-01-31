import React, { useCallback, useMemo, useState } from "react";
import DialogHeader from "@/components/DialogHeader";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { useStakeLPTokensStore } from "@/app/[locale]/farms/stores/stake";
import { useFarmsUserDataStore } from "@/app/[locale]/farms/stores";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Abi, Address, formatUnits, parseUnits } from "viem";
import TokenSelector from "@/components/TokenSelector";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import addToast from "@/other/toast";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function StakeLPTokensModal() {
  const { chainId } = useAccount();
  const {address: account} = useAccount();

  const {
    isStakeLPTokensDialogOpened: isOpened,
    setIsStakeLPTokensDialogOpened: setIsOpened,
    lpTokenToStake: farmToStake
  } = useStakeLPTokensStore();

  const [staking, setStaking] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [value, setValue] = useState("");

  const { farmsUserData } = useFarmsUserDataStore();

  const {addTransaction} = useRecentTransactionsStore();

  const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const handleStake = useCallback(async () => {
    if(!farmToStake || !account || !walletClient || !chainId) {
      return;
    }
    setOpened(`Stake ${value} LP Tokens`);
    setIsOpened(false);

    const params: {
      address: Address,
      account: Address,
      abi: Abi,
      functionName: "transfer",
      args: [
        Address,
        bigint
      ]
    } = {
      address: farmToStake.lpAddress,
      account,
      abi: LP_TOKEN_ABI,
      functionName: "transfer",
      args: [
        farmToStake.localFarmAddress,
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
          title: `Stake ${value} LP Tokens`,
        }, account);
        setSubmitted(hash, chainId as any);
      }
    } catch (e) {
      setClose();
      addToast("Unexpected error, please contact support", "error");
    }
  }, [account, addTransaction, chainId, farmToStake, publicClient, setClose, setIsOpened, setOpened, setSubmitted, value, walletClient]);

  const pair: [WrappedToken, WrappedToken] | [undefined, undefined] = useMemo(() => {
    if(chainId && farmToStake?.token && farmToStake?.quoteToken) {
      return [
        new WrappedToken(
          chainId,
          farmToStake.token.address!,
          farmToStake.token.decimals!,
          farmToStake.token.symbol,
          farmToStake.token.name,
          farmToStake.token.logoURI,
        ),
        new WrappedToken(
          chainId,
          farmToStake.quoteToken.address!,
          farmToStake.quoteToken.decimals!,
          farmToStake.quoteToken.symbol,
          farmToStake.quoteToken.name,
          farmToStake.quoteToken.logoURI,
        )
      ]
    }

    return [undefined, undefined];
  }, [chainId, farmToStake?.quoteToken, farmToStake?.token]);

  const lpToken = useMemo(() => {
    if(chainId && farmToStake) {
      return new WrappedToken(
        chainId,
        farmToStake.lpAddress,
        18,
        farmToStake.lpSymbol,
        farmToStake.lpSymbol,
        "/images/all-tokens/placeholder.svg",
      )
    }

    return null;
  }, [chainId, farmToStake]);

  return <DrawerDialog isOpen={isOpened} setIsOpen={setIsOpened}>
    <div className="w-full xl:w-[480px]">
      <DialogHeader handleClose={() => setIsOpened(false)} title="Stake lp tokens" />
      <div className="p-10">
        <TokenSelector
          token={lpToken}
          amount={value}
          setAmount={(value) => {
            setValue(value);
          }}
          onPick={() => undefined}
          label="Stake"
          balance={farmsUserData[farmToStake?.pid]?.lpBalance}
          pair={pair}
        />
        <div className="flex gap-2.5 mt-5">
          <PrimaryButton onClick={() => setIsOpened(false)} fullWidth variant="outlined">Cancel</PrimaryButton>
          <PrimaryButton disabled={!Boolean(value) || !Boolean(farmsUserData[farmToStake?.pid]?.lpBalance)} onClick={async () => {
            setStaking(true);
            try {
              await handleStake();
              setStaking(false);
            } catch (e) {
              setStaking(false);
            }
          }} fullWidth>Stake</PrimaryButton>
        </div>
      </div>
    </div>
  </DrawerDialog>;
}
