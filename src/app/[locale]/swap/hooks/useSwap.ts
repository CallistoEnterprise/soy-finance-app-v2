import {
  useSwapAmountsStore,
  useSwapTokensStore,
  useTradeStore,
  useTransactionSettingsStore
} from "@/app/[locale]/swap/stores";
import { useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ROUTER_ABI } from "@/config/abis/router";
import { Abi, formatUnits } from "viem";
import { isNativeToken } from "@/other/isNativeToken";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import calculateSlippageAmount from "@/other/calculateSlippageAmount";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/confirm";
import useRouterAddress from "@/hooks/useRouterAddress";
import addToast from "@/other/toast";
import { useTranslations } from "use-intl";

export default function useSwap() {
  const t = useTranslations("Toast");

  const { tokenTo, tokenFrom } = useSwapTokensStore();
  const { amountIn, amountOut } = useSwapAmountsStore();
  const { trade } = useTradeStore();
  const { deadline: _deadline, slippage } = useTransactionSettingsStore();
  const { chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const deadline = useTransactionDeadline(_deadline);
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();

  const { addTransaction, isViewed } = useRecentTransactionsStore();
  const { setSwapConfirmDialogOpened } = useConfirmSwapDialogStore();
  const routerAddress = useRouterAddress();

  const handleSwap = useCallback(async () => {
    if (walletClient && routerAddress && trade && address && amountIn && tokenFrom && tokenTo && amountOut && chainId) {
      setOpened(`Swap ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} to ${(+formatUnits(amountOut, tokenTo.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenTo.symbol}`)
      setSwapConfirmDialogOpened(false);

      const _path = trade.route.path.map((token) => {
        return token.address as `0x${string}`;
      });

      const _amountOut = await publicClient.readContract({
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: "getAmountsOut",
        args: [
          amountIn,
          _path
        ]
      });

      const _amountOutWithSlippage = calculateSlippageAmount(
        _amountOut[_amountOut.length - 1],
        slippage
      );

      const tokenArgs: [
        bigint,
        bigint,
        `0x${string}`[],
        `0x${string}`,
        bigint
      ] = [
        amountIn,
        _amountOutWithSlippage,
        _path,
        address,
        deadline
      ];

      const coinArgs: any = [
        _amountOutWithSlippage,
        _path,
        address,
        deadline
      ];

      const commonParams: {
        account: `0x${string}`,
        address: `0x${string}`,
        abi: Abi,
        value: bigint | undefined
      } = {
        account: address,
        address: routerAddress,
        abi: ROUTER_ABI,
        value: undefined
      }

      let params = {
        ...commonParams,
        functionName: "swapExactTokensForTokens",
        args: tokenArgs
      };

      if (tokenFrom && isNativeToken(tokenFrom?.address)) {
        params = {
          ...commonParams,
          functionName: "swapExactCLOForTokens",
          value: amountIn,
          args: coinArgs
        }
      }

      if (tokenTo && isNativeToken(tokenTo?.address)) {
        params = {
          ...commonParams,
          functionName: "swapExactTokensForCLO",
          args: tokenArgs
        }
      }

      try {
        const estimatedGas = await publicClient.estimateContractGas(params);

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(300000),
        })
        const hash = await walletClient.writeContract(request);
        if (hash) {
          addTransaction({
            account: address,
            hash,
            chainId,
            title: `Swap ${(+formatUnits(amountIn, tokenFrom.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenFrom.symbol} to ${(+formatUnits(amountOut, tokenTo.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${tokenTo.symbol}`,
          }, address);
          setSubmitted(hash, chainId as any);
        }
      } catch (e) {
        console.log(e);
        addToast(t("something_went_wrong"), "error");
        setClose();
      }
    }
  }, [walletClient, routerAddress, trade, address, amountIn, tokenFrom, tokenTo, amountOut, chainId, setOpened, setSwapConfirmDialogOpened, publicClient, slippage, deadline, addTransaction, setSubmitted, t, setClose]);

  return { handleSwap };
}

