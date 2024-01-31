import { useCallback } from "react";
import { Abi, Address, formatUnits } from "viem";
import { test1Token, useIDOMigrateAmountsStore, useIDOMigrateTokensStore } from "@/app/[locale]/migrate/stores";
import { ERC20_ABI } from "@/config/abis/erc20";
import addToast from "@/other/toast";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { IDOMigrateContractAddress } from "@/config/addresses/migration";

export default function useIDOMigration() {
  const { tokenTo, tokenFrom} = useIDOMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useIDOMigrateAmountsStore();
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();
  const { addTransaction } = useRecentTransactionsStore();

  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

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
            IDOMigrateContractAddress,
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
            title: `Migrate ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} IDO tokens`,
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

  return { handleMigrateSOY }
}
