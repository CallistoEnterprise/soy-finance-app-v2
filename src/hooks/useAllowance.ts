import {
  useAccount, useBlockNumber, useChainId, usePublicClient,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt, useWalletClient,
  useWriteContract
} from "wagmi";
import { ERC20_ABI } from "@/config/abis/erc20";
import { isNativeToken } from "@/other/isNativeToken";
import { Abi, Address, formatUnits } from "viem";
import { useCallback, useEffect, useMemo, useState } from "react";
import addToast from "@/other/toast";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function useAllowance({ token, contractAddress, amountToCheck}: {
  token: WrappedToken | null,
  contractAddress: Address | undefined,
  amountToCheck: bigint | null
}) {
  const { address } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const {addTransaction} = useRecentTransactionsStore();
  const { chainId } = useAccount();
  const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const currentAllowance = useReadContract({
    abi: ERC20_ABI,
    address: token?.address,
    functionName: "allowance",
    args: [
      //set ! to avoid ts errors, make sure it is not undefined with "enable" option
      address!,
      contractAddress!
    ],
    query: {
      //make sure hook don't run when there is no addresses
      enabled: Boolean(token?.address) && !isNativeToken(token?.address || "") && Boolean(address) && Boolean(contractAddress)
    }
    // cacheTime: 0,
    // watch: true,

  });

  const { data: blockNumber } = useBlockNumber({ watch: true })


  useEffect(() => {
    currentAllowance.refetch();
  }, [currentAllowance, blockNumber]);

  const isAllowed = useMemo(() => {
    if (!token) {
      return false;
    }

    if (isNativeToken(token.address)) {
      return true;
    }

    if (currentAllowance?.data && amountToCheck) {
      return currentAllowance.data >= amountToCheck
    }

    return false;
  }, [amountToCheck, currentAllowance?.data, token]);

  // const { data: simulateData } = useSimulateContract({
  //   address: tokenAddress,
  //   abi: ERC20_ABI,
  //   functionName: "approve",
  //   args: [
  //     contractAddress!,
  //     amountToCheck!
  //   ],
  //   query: {
  //     enabled: Boolean(amountToCheck) && Boolean(contractAddress)
  //   }
  //   // cacheTime: 0,
  // });

  // const {
  //   data: approvingData,
  //   writeContract: writeTokenApprove
  // } = useWriteContract();

  const [isApproving, setIsApproving] = useState(false);

  const writeTokenApprove = useCallback(async () => {
    if(!amountToCheck || !contractAddress || !token || !walletClient || !address || !chainId) {
      return;
    }

    setIsApproving(true);
    setOpened(`Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`)

    const params: {
      address: Address,
      account: Address,
      abi: Abi,
      functionName: "approve",
      args: [
        Address,
        bigint
      ]
    } = {
      address: token.address,
      account: address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [
        contractAddress!,
        amountToCheck!
      ],
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
          account: address,
          hash,
          chainId,
          title: `Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`,
        }, address);
        setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({hash});
        setIsApproving(false)
      }
    } catch (e) {
      console.log(e);
      setClose();
      setIsApproving(false);
      addToast("Unexpected error, please contact support", "error");
    }

  }, [addTransaction, address, amountToCheck, chainId, contractAddress, token, publicClient, setClose, setOpened, setSubmitted, walletClient]);


  return {
    isAllowed,
    isApproving,
    writeTokenApprove
  }
}
