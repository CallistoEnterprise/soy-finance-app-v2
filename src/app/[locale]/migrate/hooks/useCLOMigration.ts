import { useCallback } from "react";
import { Abi, Address, formatUnits } from "viem";
import { ceToken, useIDOMigrateAmountsStore, useCLOMigrateTokensStore } from "@/app/[locale]/migrate/stores";
import { migrationCEAddress } from "@/config/addresses/migration";
import addToast from "@/other/toast";
import { MIGRATE_CE_ABI } from "@/config/abis/migrate";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { sendTransaction } from '@wagmi/core'
import { config } from "@/config/wagmi/config";

export default function useCLOMigration() {
  const { tokenTo, tokenFrom} = useCLOMigrateTokensStore();
  const { amountIn } = useIDOMigrateAmountsStore();
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();
  const { addTransaction } = useRecentTransactionsStore();

  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
/*
  const { data } = useReadContract({
    address: migrationCEAddress,
    abi: MIGRATE_CE_ABI,
    functionName: "getRates"
  });
*/

  const handleMigrateCLO = useCallback(async () => {
    if (address && amountIn && tokenFrom && tokenTo && chainId) {
      setOpened(`Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} tokens`);
      try {

        const hash = await sendTransaction(config,{
          account: address,
          to: ceToken.address,
          value: amountIn,
        });
        if (hash) {
          addTransaction({
            account: address,
            hash,
            chainId,
            title: `Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} tokens`,
          }, address);
          setSubmitted(hash, chainId as any);
        }
      } catch (e) {
        console.log(e);
        addToast("Something went wrong, try again later", "error");
        setClose();
      }
    }
  }, [walletClient, address, amountIn, tokenFrom, tokenTo, setOpened, publicClient, addTransaction, chainId, setSubmitted, setClose]);

  const handleMigrateCLOE = useCallback(async () => {
    if (walletClient && address && amountIn && tokenFrom && tokenTo && chainId) {
      setOpened(`Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} tokens`);
      // setSwapConfirmDialogOpened(false);
      try {
        const params: {
          account: Address,
          address: Address,
          abi: Abi,
          functionName: "migrateCLOE",
          args: [Address, bigint]
        } = {
          account: address,
          address: migrationCEAddress,
          abi: MIGRATE_CE_ABI,
          functionName: "migrateCLOE",
          args: [
            address,
            amountIn
          ]
        }

        const estimatedGas = await publicClient.estimateContractGas(params)

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(30000),
        })
        const hash = await walletClient.writeContract(request);
        if (hash) {
          addTransaction({
            account: address,
            hash,
            chainId,
            title: `Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} tokens`,
          }, address);
          setSubmitted(hash, chainId as any);
        }
      } catch (e) {
        console.log(e);
        addToast("Something went wrong, try again later", "error");
        setClose();
      }
    }
  }, [walletClient, address, amountIn, tokenFrom, tokenTo, setOpened, publicClient, addTransaction, chainId, setSubmitted, setClose]);


  return {handleMigrateCLOE, handleMigrateCLO}
}
