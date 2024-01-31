import { useCallback, useState } from "react";
import { Abi, Address, ContractFunctionExecutionError } from "viem";
import { MIGRATE_ABI } from "@/config/abis/migrate";
import { migrateContractAddress } from "@/config/addresses/migration";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useStakingMigrateAmountsStore, useStakingMigrateTokensStore } from "@/app/[locale]/migrate/stores";
import { ERC223_ABI } from "@/config/abis/erc223";
import { useStakingMigrationDateStore } from "@/app/[locale]/migrate/stores/staking-migration-timer";
import addToast from "@/other/toast";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";

export default function useStakingMigration() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const {amountIn} = useStakingMigrateAmountsStore();
  const {tokenFrom} = useStakingMigrateTokensStore();
  const publicClient = usePublicClient();
  const {setDate} = useStakingMigrationDateStore();
  const [loadingNoRate, setLoadingNoRate] = useState(false);

  const {addTransaction} = useRecentTransactionsStore();
  const {setOpened, setClose, setSubmitted} = useAwaitingDialogStore()

  const handleMigrateStaking = useCallback(async () => {
    if (!walletClient || !address || !chainId) {
      return;
    }

    setOpened("Staking migration");

    setLoadingNoRate(true);

    const params: {
      account: Address,
      abi: Abi,
      address: Address,
      functionName: "stakingMigrate"
    } = {
      account: address,
      abi: MIGRATE_ABI,
      address: migrateContractAddress,
      functionName: "stakingMigrate"
    }

    try {
      setDate(new Date(Date.now()));
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      })
      const hash = await walletClient.writeContract(request);

      if(hash) {
        addTransaction({
          hash,
          chainId,
          title: "Staking migration",
          account: address
        }, address);
        setSubmitted(hash, chainId as any);
      }

      const transaction = await publicClient.waitForTransactionReceipt({ hash });
    } catch (e) {
      const error = e as ContractFunctionExecutionError;
      if(error.shortMessage) {
        const errReason = error.shortMessage.split(":")[1];
        if(errReason) {
          addToast(`Error: ${error.shortMessage.split(":")[1]}`, "error");
        } else {
          addToast(error.shortMessage, "error");
        }
      } else {
        addToast("Something went wrong, try again later")
      }
      setClose();
    } finally {
      setLoadingNoRate(false);
    }
  }, [addTransaction, address, chainId, publicClient, setDate, setOpened, setSubmitted, walletClient]);

  const handleMigrateRateStaking = useCallback(async () => {
    if (!walletClient || !address || !amountIn) {
      return;
    }

    const params: {
      account: Address,
      abi: Abi,
      address: Address,
      functionName: "transfer",
      args: [
        Address,
        bigint,
        string
      ]
    } = {
      account: address,
      abi: ERC223_ABI,
      address: tokenFrom.address,
      functionName: "transfer",
      args: [
        migrateContractAddress,
        amountIn,
        "0x7374616B696E67466978526174654D6967726174696F6E"
      ]
    }

    try {
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      })
      const hash = await walletClient.writeContract(request);
    } catch (e) {
      console.log(e);
    }


    // const transaction = await publicClient.waitForTransactionReceipt({ hash });
    // const result = await publicClient.getTransactionReceipt({ hash });

  }, [address, amountIn, publicClient, tokenFrom.address, walletClient]);

  return {handleMigrateStaking, handleMigrateRateStaking, loadingNoRate}
}
