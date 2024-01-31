import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Percent,
  TokenAmount
} from "@callisto-enterprise/soy-sdk";
import { Address, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  usePublicClient,
  useWalletClient,
  useBlockNumber
} from "wagmi";
import {
  useRemoveLiquidityAmountsStore,
  useRemoveLiquidityTokensStore
} from "@/app/[locale]/liquidity/stores/useRemoveLiquidityStore";
import { useTransactionSettingsStore } from "@/app/[locale]/swap/stores";
import { WrappedToken } from "@/config/types/WrappedToken";
import { readContract } from "@wagmi/core";
import { ERC20_ABI } from "@/config/abis/erc20";
import { useSignatureStore } from "@/app/[locale]/liquidity/stores/useSignatureStore";
import { PAIR_ABI } from "@/config/abis/pair";
import { splitSignature } from "@ethersproject/bytes";
import { isNativeToken } from "@/other/isNativeToken";
import { ROUTER_ABI } from "@/config/abis/router";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import usePair from "@/hooks/usePair";
import calculateSlippageAmount from "@/other/calculateSlippageAmount";
import { ROUTER_ADDRESS } from "@/config/addresses/router";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { config } from "@/config/wagmi/config";
import addToast from "@/other/toast";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";

export function useRemoveLiquidity() {
  const { chainId } = useAccount();
  const { address: account } = useAccount();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { setOpened, setClose, setSubmitted } = useAwaitingDialogStore();

  const {
    tokenA,
    tokenB,
    tokenLP,
    setTokenA,
    setTokenB,
    setTokenLP
  } = useRemoveLiquidityTokensStore();

  const {
    amountA,
    amountB,
    amountLP,
    amountAString,
    amountBString,
    amountLPString,
    setAmountA,
    setAmountB,
    setAmountLP
  } = useRemoveLiquidityAmountsStore();

  const { addTransaction } = useRecentTransactionsStore();

  const [approving, setApproving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // const [approval, approveCallback] = useApproveCallback(
  //   tokenLP,
  //   amountLP,
  // );

  const { signatureData, setSignatureData, resetSignatures } = useSignatureStore()

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const pair = usePair({ tokenA: tokenA, tokenB: tokenB });

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

  const handleTokenAChange = useCallback((token: WrappedToken) => {
    resetSignatures();
    if(tokenB && tokenB.equals(token)) {
      setTokenB(tokenA);
    }

    setTokenA(token);
  }, [resetSignatures, setTokenA, setTokenB, tokenA, tokenB]);

  const handleTokenBChange = useCallback((token: WrappedToken) => {
    resetSignatures();
    if(tokenA && tokenA.equals(token)) {
      setTokenA(tokenB);
    }

    setTokenB(token);
  }, [resetSignatures, setTokenA, setTokenB, tokenA, tokenB]);

  useEffect(() => {
    if (pair && tokenA && tokenB) {
      setTokenLP(new WrappedToken(
        pair.liquidityToken.chainId,
        pair.liquidityToken.address as `0x${string}`,
        pair.liquidityToken.decimals,
        `${tokenA.symbol} - ${tokenB.symbol}`,
        `LP ${tokenA.symbol} - ${tokenB.symbol}`,
        tokenA.logoURI
      ));
    }
  }, [pair, setTokenLP, tokenA, tokenB]);
  const { data: blockNumber } = useBlockNumber({ watch: true })


  const { data: userPoolBalance, refetch} = useBalance({
    address: pair?.liquidityToken.address ? account : undefined,
    token: pair?.liquidityToken.address as `0x${string}` | undefined,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const { data: totalPoolTokens } = useReadContract({
    address: pair?.liquidityToken.address as Address | undefined,
    abi: ERC20_ABI,
    functionName: "totalSupply"
  });

  const {data: reserves} = useReadContract({
    address: pair?.liquidityToken.address as Address | undefined,
    abi: LP_TOKEN_ABI,
    functionName: "getReserves"
  });

  const token0Deposited = useMemo(() => {
    if(!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[0] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  const token1Deposited = useMemo(() => {
    if(!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[1] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  const handleLiquidityAmountLPChange = useCallback(async (amount: string) => {
    setAmountLP(amount, tokenLP?.decimals);
    resetSignatures();

    if (!amount) {
      setAmountB("");
      setAmountA("");
      return;
    }

    if (!pair || !tokenLP) {
      return;
    }

    const parsedAmount = parseUnits(amount, tokenLP.decimals);

    const wrappedIndependentAmount = new TokenAmount(tokenLP, parsedAmount);

    if (!tokenLP || !wrappedIndependentAmount || !totalPoolTokens || !reserves || !tokenA || !tokenB) {
      return;
    }

    // const totalPoolAmount = new TokenAmount(tokenLP, totalPoolTokens);

    const price1 = reserves[0] * parsedAmount / totalPoolTokens;
    const price2 = reserves[1] * parsedAmount / totalPoolTokens;

    // const price1 = pair.getLiquidityValue(pair.token0, totalPoolAmount, wrappedIndependentAmount, false);
    // const price2 = pair.getLiquidityValue(pair.token1, totalPoolAmount, wrappedIndependentAmount, false);

    setAmountA(formatUnits(price1, tokenA.decimals), tokenA?.decimals);
    setAmountB(formatUnits(price2, tokenB.decimals), tokenB?.decimals);

  }, [setAmountLP, tokenLP, resetSignatures, pair, totalPoolTokens, reserves, tokenA, tokenB, setAmountA, setAmountB])

  const handleAmountAChange = useCallback(async (amount: string) => {
    setAmountA(amount, tokenA?.decimals);
    resetSignatures();

    if (!amount) {
      setAmountB("");
      setAmountLP("");
      return;
    }

    if (!chainId || !pair || !totalPoolTokens || !tokenLP || !tokenA) {
      return;
    }

    const parsedAmount = parseUnits(amount, tokenA.decimals);

    const wrappedIndependentAmount = new TokenAmount(tokenA, parsedAmount);

    if (!tokenA || !wrappedIndependentAmount || !userPoolBalance?.value || !reserves || !tokenB) {
      return;
    }

    // const price = pair.priceOf(tokenA).quote(wrappedIndependentAmount);

    // const totalPoolAmount = new TokenAmount(tokenLP, totalPoolTokens);
    // const userPoolAmount = new TokenAmount(tokenLP, userPoolBalance.value);

    // const totalSupply = pair.getLiquidityValue(pair.token0, totalPoolAmount, userPoolAmount, false);

    // const percentage = new Percent(wrappedIndependentAmount.raw, totalSupply.raw);

    // const price1 = new TokenAmount(tokenLP, percentage.multiply(userPoolBalance.value).quotient)

    const _priceLP = parsedAmount * totalPoolTokens / reserves[0];
    const _priceB = reserves[1] * _priceLP / totalPoolTokens;

    setAmountB(formatUnits(_priceB, tokenB?.decimals), tokenB?.decimals);
    setAmountLP(formatUnits(_priceLP, tokenLP?.decimals), tokenLP?.decimals);
  }, [setAmountA, tokenA, resetSignatures, chainId, pair, totalPoolTokens, tokenLP, userPoolBalance?.value, reserves, tokenB, setAmountB, setAmountLP]);

  const handleAmountBChange = useCallback(async (amount: string) => {
    setAmountB(amount, tokenB?.decimals);
    resetSignatures();

    if (!amount) {
      setAmountA("");
      setAmountLP("");
      return;
    }

    if (!chainId || !pair || !totalPoolTokens || !userPoolBalance || !tokenLP || !tokenB) {
      return;
    }

    const parsedAmount = parseUnits(amount, tokenB.decimals);

    const wrappedIndependentAmount = new TokenAmount(tokenB, parsedAmount);


    if (!tokenB || !wrappedIndependentAmount) {
      return;
    }

    const totalPoolAmount = new TokenAmount(tokenLP, totalPoolTokens);
    const userPoolAmount = new TokenAmount(tokenLP, userPoolBalance.value);

    const totalSupply = pair.getLiquidityValue(pair.token1, totalPoolAmount, userPoolAmount, false);


    const percentage = new Percent(wrappedIndependentAmount.raw, totalSupply.raw);

    const price1 = new TokenAmount(tokenLP, percentage.multiply(userPoolBalance.value).quotient)

    const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

    setAmountA(price.toSignificant(6), tokenA?.decimals);
    setAmountLP(price1.toSignificant(6), tokenLP.decimals);

  }, [setAmountB, tokenB, resetSignatures, chainId, pair, totalPoolTokens, userPoolBalance, tokenLP, setAmountA, tokenA?.decimals, setAmountLP]);

  async function onAttemptToApprove() {

    if (!account || !deadline || !chainId || !tokenLP || !walletClient) throw new Error('missing dependencies')

    const parsedAmountLP = parseUnits(amountLPString, tokenLP.decimals);

    if (!parsedAmountLP) {
      return;
    }
    // try to gather a signature for permission
    const nonce = await readContract(config, {
      abi: PAIR_ABI,
      functionName: "nonces",
      account: account,
      address: tokenLP.address as `0x${string}`,
      args: [
        account
      ]
    })

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const domain = {
      name: 'SoyFinance LPs',
      version: '1',
      chainId: BigInt(chainId),
      verifyingContract: tokenLP.address as `0x${string}`,
    } as const;

    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[chainId || 820].toString(),
      value: parsedAmountLP,
      nonce: nonce.toString(),
      deadline: deadline,
    }

    setApproving(true);

    const signature = await walletClient.signTypedData({
      account: account,
      domain,
      types: {
        EIP712Domain,
        Permit,
      } as const,
      primaryType: "Permit",
      message,
    });

    const splitted = splitSignature(signature);
    setSignatureData({ ...splitted, deadline });
  }

  const removeLiquidity = useCallback(async () => {

    if (!tokenA || !tokenB || !chainId || !account || !tokenLP || !deadline || !walletClient || !amountA || !amountB || !amountLP) {
      console.error("Not enough data");
      return;
    }

    setOpened(`Removing ${(+formatUnits(amountA, tokenA.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${tokenA.symbol} and ${((+formatUnits(amountB, tokenB.decimals))).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${tokenB.symbol}`);


    const parsedAmountA = parseUnits(amountAString, tokenA.decimals);
    const parsedAmountB = parseUnits(amountBString, tokenB.decimals);
    const parsedAmountLP = parseUnits(amountLPString, tokenLP.decimals);

    if (!parsedAmountA || !parsedAmountB || !parsedAmountLP) {
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, slippage),
      b: calculateSlippageAmount(parsedAmountB, slippage),
    }
    //
    let functionName: "removeLiquidityCLOWithPermit" | "removeLiquidityWithPermit" = "removeLiquidityWithPermit";
    let args: Array<string | string[] | number | boolean>
    //
    const currencyBIsETH = isNativeToken(tokenB.address);
    const oneCurrencyIsETH = isNativeToken(tokenA.address) || currencyBIsETH
    //
    // if (approval === ApprovalState.APPROVED) {
    //   // removeLiquidityCLO
    //   if (oneCurrencyIsETH) {
    //     methodNames = ['removeLiquidityCLO', 'removeLiquidityCLOSupportingFeeOnTransferTokens']
    //     args = [
    //       currencyBIsETH ? tokenA.address : tokenB.address,
    //       parsedAmountLP.raw.toString(),
    //       amountsMin.a.toString(),
    //       amountsMin.b.toString(),
    //       account,
    //       deadline,
    //     ]
    //   }
    //   // removeLiquidity
    //   else {
    //     methodNames = ['removeLiquidity']
    //     args = [
    //       tokenA.address,
    //       tokenB.address,
    //       parsedAmountLP.raw.toString(),
    //       amountsMin.a.toString(),
    //       amountsMin.b.toString(),
    //       account,
    //       deadline,
    //     ]
    //   }
    // }
    // // we have a signataure, use permit versions of remove liquidity
    if (signatureData !== null) {
      // removeLiquidityCLOWithPermit
      if (oneCurrencyIsETH) {
        functionName = 'removeLiquidityCLOWithPermit'
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          parsedAmountLP.toString(),
          amountsMin.a.toString(),
          amountsMin.b.toString(),
          account,
          signatureData.deadline.toString(),
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityWithPermit
      else {
        functionName = 'removeLiquidityWithPermit',
          args = [
            tokenA.address,
            tokenB.address,
            parsedAmountLP.toString(),
            amountsMin.a.toString(),
            amountsMin.b.toString(),
            account,
            signatureData.deadline.toString(),
            false,
            signatureData.v,
            signatureData.r,
            signatureData.s,
          ]
      }

      const params: any = {
        abi: ROUTER_ABI,
        address: ROUTER_ADDRESS[chainId],
        account,
        functionName,
        args
      }


      try {
        const estimatedGas = await publicClient.estimateContractGas(params);

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(30000),
        })
        const hash = await walletClient.writeContract(request);

        if (hash) {
          addTransaction({
            account,
            hash,
            chainId,
            title: `Removed ${(+formatUnits(amountA, tokenA.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${tokenA.symbol} and ${((+formatUnits(amountB, tokenB.decimals))).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${tokenB.symbol}`,
          }, account);
          setSubmitted(hash, chainId as any);
        }
      } catch (e) {
        console.log(e);
        addToast("Something went wrong, try again later", "error");
        setClose();
      }
    } else {
      console.error('Attempting to confirm without approval or a signature. Please contact support.', "error");
    }

    setRemoving(true);
  }, [tokenA, tokenB, chainId, account, tokenLP, deadline, walletClient, amountA, amountB, amountLP, setOpened, amountAString, amountBString, amountLPString, slippage, signatureData, publicClient, addTransaction, setSubmitted, setClose]);

  return {
    removeLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange,
    approving,
    removing,
    readyToRemove: signatureData !== null,
    onAttemptToApprove,
    token0Deposited,
    token1Deposited,
    pair,
    priceA,
    priceB
  };
}
