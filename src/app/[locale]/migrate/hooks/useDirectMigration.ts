import { useCallback } from "react";
import { Abi, Address, formatUnits } from "viem";
import { test1Token, useMigrateAmountsStore, useMigrateTokensStore } from "@/app/[locale]/migrate/stores";
import { ERC20_ABI } from "@/config/abis/erc20";
import { migrateContractAddress } from "@/config/addresses/migration";
import addToast from "@/other/toast";
import { MIGRATE_ABI } from "@/config/abis/migrate";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";

export default function useDirectMigration() {
  const { tokenTo, tokenFrom, setTokenTo, setTokenFrom, switchTokens } = useMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useMigrateAmountsStore();
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();
  const { addTransaction } = useRecentTransactionsStore();

  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data } = useReadContract({
    address: migrateContractAddress,
    abi: MIGRATE_ABI,
    functionName: "getRates"
  });

  const handleMigrateSOY = useCallback(async () => {
    if (walletClient && address && amountIn && tokenFrom && tokenTo && chainId) {
      setOpened(`Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} tokens`);
      try {

        const params: {
          account: Address,
          address: Address,
          abi: Abi,
          functionName: "transfer",
          args: [
            Address,
            bigint
          ]
        } = {
          account: address,
          address: test1Token.address,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [
            migrateContractAddress,
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
          args: [bigint]
        } = {
          account: address,
          address: migrateContractAddress,
          abi: MIGRATE_ABI,
          functionName: "migrateCLOE",
          args: [
            amountIn
          ]
        }

        console.log(params);

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


  return {handleMigrateCLOE, handleMigrateSOY}
}
