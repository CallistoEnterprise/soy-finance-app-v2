import { useTransactionSettingsStore } from "@/app/[locale]/swap/stores";
import { useLiquidityAmountsStore, useLiquidityTokensStore } from "@/app/[locale]/liquidity/stores";
import { useTrackedPools } from "@/app/[locale]/liquidity/hooks/useTrackedPools";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { TokenAmount } from "@callisto-enterprise/soy-sdk";
import { isNativeToken } from "@/other/isNativeToken";
import { Abi, formatUnits, parseUnits } from "viem";
import { WrappedToken } from "@/config/types/WrappedToken";
import { ROUTER_ABI } from "@/config/abis/router";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import usePair from "@/hooks/usePair";
import calculateSlippageAmount from "@/other/calculateSlippageAmount";
import { ROUTER_ADDRESS } from "@/config/addresses/router";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import useRouterAddress from "@/hooks/useRouterAddress";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import addToast from "@/other/toast";

export function useLiquidity() {

  const {address} = useAccount();
  const { chainId } = useAccount();
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();

  const deadline = useTransactionDeadline(_deadline);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const {addTransaction} = useRecentTransactionsStore();
  const {setOpened, setClose, setSubmitted} = useAwaitingDialogStore();

  const {
    tokenA,
    tokenB,
    setTokenA,
    setTokenB
  } = useLiquidityTokensStore();

  const {
    amountA,
    amountB,
    amountAString,
    amountBString,
    setAmountA,
    setAmountB
  } = useLiquidityAmountsStore();


  const { importPool } = useTrackedPools();

  const [tokenChanged, setTokenChanged] = useState(false);

  const pair = usePair({ tokenA, tokenB });

  console.log("Liquidity smth");
  console.log(pair);
  console.log(tokenA);
  console.log(tokenB);

  // const noLiquidity: boolean =
  //   pairState === PairState.NOT_EXISTS || Boolean(totalSupply && JSBI.equal(totalSupply.raw, ZERO))

  const priceA = useMemo(() => {
    if (!pair || !tokenB || !tokenA) {
      return null;
    }

    if(tokenA.sortsBefore(tokenB) && !pair.token0.equals(tokenA)) {
      return null;
    }

    if(!tokenA.sortsBefore(tokenB) && !pair.token0.equals(tokenB)) {
      return null;
    }

    return pair.priceOf(tokenB);
  }, [pair, tokenA, tokenB]);


  const priceB = useMemo(() => {
    if (!pair || !tokenB || !tokenA) {
      return null;
    }

    if(tokenA.sortsBefore(tokenB) && !pair.token0.equals(tokenA)) {
      return null;
    }

    if(!tokenA.sortsBefore(tokenB) && !pair.token0.equals(tokenB)) {
      return null;
    }

    return pair.priceOf(tokenA);
  }, [pair, tokenA, tokenB]);

  useEffect(() => {
    if (!tokenChanged || !pair || !tokenA || !tokenB) {
      return;
    }

    if(!pair.token0.equals(tokenA) || !pair.token1.equals(tokenB)) {
      return;
    }

    if (!amountA && !amountB) {
      setAmountB("");
      setAmountA("");
    }

    if (amountA && !amountB) {
      if (!chainId || !pair || !tokenB || !tokenA) {
        return;
      }

      const parsedAmount = parseUnits(amountAString, tokenA.decimals);

      const wrappedIndependentAmount = new TokenAmount(tokenA, parsedAmount);

      if (!tokenA || !parsedAmount) {
        return;
      }

      const price = pair.priceOf(tokenA).quote(wrappedIndependentAmount);

      setAmountB(price.toSignificant(6));
    }

    if (!amountA && amountB) {
      if (!chainId || !pair || !tokenA || !tokenB) {
        return;
      }

      const parsedAmount = parseUnits(amountBString, tokenB.decimals);

      const wrappedIndependentAmount = new TokenAmount(tokenB, parsedAmount);
      if (!tokenB || !wrappedIndependentAmount) {
        return;
      }

      const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

      setAmountA(price.toSignificant(6));
    }
  }, [amountA, amountAString, amountB, amountBString, chainId, pair, setAmountA, setAmountB, tokenA, tokenB, tokenChanged]);

  const handleTokenBChange = useCallback((token: WrappedToken) => {
    if (tokenA && token.equals(tokenA)) {
      setTokenA(tokenB);
      setAmountA(amountBString, tokenB?.decimals)
    }

    setTokenB(token);
    setTokenChanged(true);
  }, [amountBString, setAmountA, setTokenA, setTokenB, tokenA, tokenB]);

  const handleTokenAChange = useCallback((token: WrappedToken) => {
    if (tokenB && token.equals(tokenB)) {
      setTokenB(tokenA);
      setAmountB(amountAString, tokenA?.decimals);
    }

    setTokenA(token);
    setTokenChanged(true);
  }, [amountAString, setAmountB, setTokenA, setTokenB, tokenA, tokenB]);

  const handleAmountAChange = useCallback(async (amount: string) => {
    setAmountA(amount, tokenA?.decimals);

    if (!chainId || !pair || !Boolean(amount) || !tokenB || !tokenA) {
      setAmountB("");
      return;
    }

    const parsedAmount = parseUnits(amount, tokenB.decimals);
    const wrappedIndependentAmount = new TokenAmount(tokenA, parsedAmount);

    if (!tokenA || !wrappedIndependentAmount) {
      return;
    }

    const price = pair.priceOf(tokenA).quote(wrappedIndependentAmount);

    setAmountB(price.toSignificant(6), tokenB?.decimals);
  }, [chainId, pair, setAmountA, setAmountB, tokenA, tokenB]);

  const handleAmountBChange = useCallback(async (amount: string) => {
    setAmountB(amount, tokenB?.decimals);
    if (!chainId || !pair || !Boolean(amount) || !tokenA || !tokenB) {
      setAmountA("");
      return;
    }

    const parsedAmount = parseUnits(amount, tokenB.decimals);

    const wrappedIndependentAmount = new TokenAmount(tokenB, parsedAmount);

    if (!tokenB || !wrappedIndependentAmount) {
      return;
    }

    const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

    setAmountA(price.toSignificant(6), tokenA?.decimals);
  }, [chainId, pair, setAmountA, setAmountB, tokenA, tokenB]);

  const routerAddress = useRouterAddress();

  const addLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !chainId || !address || !amountA || !amountB || !walletClient) {
      addToast("Something is wrong, try again later", "error");
      return;
    }
    setOpened(`Add ${(+formatUnits(amountA, tokenA.decimals)).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenA.symbol} and ${((+formatUnits(amountB, tokenB.decimals))).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenB.symbol}`);

    const parsedAmountA = parseUnits(amountAString, tokenA.decimals);
    const parsedAmountB = parseUnits(amountBString, tokenB.decimals);

    if (!parsedAmountA || !parsedAmountB || !routerAddress) {
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, slippage * 100),
      b: calculateSlippageAmount(parsedAmountB, 1),
    }


    const tokenArgs: [
      `0x${string}`,
      `0x${string}`,
      bigint,
      bigint,
      bigint,
      bigint,
      `0x${string}`,
      bigint
    ] = [
        tokenA.address, //"0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3"
        tokenB.address, //"0xCC10A4050917f771210407DF7A4C048e8934332c"
        parsedAmountA, //"2000000000000000000"
        parsedAmountB, //"110574669940283"
        amountsMin.a, //"1990000000000000000"
        amountsMin.b,//"110021796590581"
        address, //"0xF1602175601606E8ffEe38CE433A4DB4C6cf5d60"
        deadline, //"0x645cc5f5"
    ];

    const coinArgs: [
      `0x${string}`,
      bigint,
      bigint,
      bigint,
      `0x${string}`,
      bigint,
    ] = [
        isNativeToken(tokenA.address) ? tokenB.address : tokenA.address, // token
        isNativeToken(tokenA.address) ? parsedAmountB : parsedAmountA, // token desired
        isNativeToken(tokenA.address) ? amountsMin.b : amountsMin.a, // token min
        isNativeToken(tokenA.address) ? amountsMin.a : amountsMin.b, // eth min
        address,
        deadline,
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

    let params: {
        account: `0x${string}`,
        address: `0x${string}`,
        abi: Abi,
        value: bigint | undefined,
        functionName: "addLiquidity" | "addLiquidityCLO",
        args: [
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          `0x${string}`,
          bigint,
        ] | [
          `0x${string}`,
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          bigint,
          `0x${string}`,
          bigint
        ]
      }  = {
      ...commonParams,
      functionName: "addLiquidity",
      args: tokenArgs
    };

    if(isNativeToken(tokenA.address) || isNativeToken(tokenB.address)) {
      params = {
        ...commonParams,
        functionName: "addLiquidityCLO",
        value: isNativeToken(tokenA.address) ? parsedAmountA : parsedAmountB,
        args: coinArgs
      }
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
          title: `Add ${(+formatUnits(amountA, tokenA.decimals)).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenA.symbol} and ${((+formatUnits(amountB, tokenB.decimals))).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenB.symbol}`,
        }, address);

        setSubmitted(hash, chainId as any);
      }
    } catch (e) {
      console.log(e);
      addToast("Something went wrong, try again later", "error");
      setClose();
    }

    try {
      importPool({ chainId, pair: [tokenA?.address || "", tokenB?.address || ""], withMessage: false });
    } catch (error) {

    }

  }, [tokenA, tokenB, chainId, address, amountA, amountB, walletClient, setOpened, amountAString, amountBString, slippage, deadline, routerAddress, publicClient, addTransaction, setSubmitted, setClose, importPool]);

  return {
    addLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    priceA,
    priceB
  };
}
