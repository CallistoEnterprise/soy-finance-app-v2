import {useCallback, useMemo} from "react";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityAmountA,
  $liquidityAmountB,
  $liquidityInputTokens, $removeLiquidityAmountA, $removeLiquidityAmountB, $removeLiquidityAmountLP,
  $removeLiquidityInputTokens,
  setLiquidityAmountA,
  setLiquidityAmountB,
  setLiquidityTokenA,
  setLiquidityTokenB,
  setRemoveLiquidityAmountA,
  setRemoveLiquidityAmountB, setRemoveLiquidityAmountLP,
  setRemoveLiquidityTokenA,
  setRemoveLiquidityTokenB
} from "../../../../shared/web3/models/init";
import {TokenMetadata} from "../../../../shared/web3/models/types";
import {getPairs, toCurrency, WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHERS,
  JSBI,
  Percent,
  Token,
  TokenAmount,
  WETH
} from "@callisto-enterprise/soy-sdk";
import {useBlockNumber} from "../../../../shared/hooks/useBlockNumber";
import {Contract, parseUnits} from "ethers";
import useTransactionDeadline from "../../../swap/hooks/useTransactionDeadline";
import {BigNumber} from "@ethersproject/bignumber";
import routerABI from "../../../../shared/abis/interfaces/router.json";
import {usePairs} from "../../../../shared/hooks/usePairs";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import {useTotalSupply} from "../../../../shared/web3/hooks/useTotalSupply";
import {usePairFragment, useRouterFragment} from "../../../../shared/config/fragments";
import {PAIR_INTERFACE, ROUTER_INTERFACE} from "../../../../shared/config/interfaces";
import {ERC_223_ABI} from "../../../../shared/abis";

function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHERS[chainId]
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined;
}

function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined,
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function tryParseAmount(value?: string, currency?: WrappedTokenInfo | Token | null, chainId?: number): CurrencyAmount | undefined {
  console.log(value);
  console.log(currency)
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    console.log(typedValueParsed);
    if (typedValueParsed !== '0') {
      return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    console.log("Error");
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

const contracts = {
  bridge: {
    820: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    56: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    1: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    61: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    199: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    137: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56"
  },
  router: {
    820: "0xeB5B468fAacC6bBdc14c4aacF0eec38ABCCC13e7",
    199: "0x8Cb2e43e5AEB329de592F7e49B6c454649b61929",
    61: "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D"
  }
};

export function useRemoveLiquidity() {
  const {chainId, web3Provider, account} = useWeb3();
  const blockNumber = useBlockNumber();

  const deadline = useTransactionDeadline(20);
  const {tokenA, tokenB, lpToken} = useStore($removeLiquidityInputTokens);
  const setRemoveLiquidityTokenAFn = useEvent(setRemoveLiquidityTokenA);
  const setRemoveLiquidityTokenBFn = useEvent(setRemoveLiquidityTokenB);

  const setRemoveLiquidityAmountAFn = useEvent(setRemoveLiquidityAmountA);
  const setRemoveLiquidityAmountLPFn = useEvent(setRemoveLiquidityAmountLP);
  const setRemoveLiquidityAmountBFn = useEvent(setRemoveLiquidityAmountB);

  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);
  const amountLP = useStore($removeLiquidityAmountLP);

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );

  const pairArray = useMemo(() => {
    return [[tokenA, tokenB]]
  }, [tokenA, tokenB]);

  const pairs = usePairs(pairArray);


  console.log(pairs);

  const handleTokenAChange = useCallback((token: WrappedTokenInfo) => {
    setRemoveLiquidityTokenAFn(token);
  }, [setRemoveLiquidityTokenAFn]);

  const handleTokenBChange = useCallback((token: WrappedTokenInfo) => {
    setRemoveLiquidityTokenBFn(token);
  }, [setRemoveLiquidityTokenBFn]);

  const userPoolBalance = useBalanceOf(pairs?.[0]?.[1]?.liquidityToken || null);

  const totalPoolTokens = useTotalSupply(pairs?.[0]?.[1]?.liquidityToken);

  const fragment = useRouterFragment("removeLiquidity");

  const handleLiquidityAmountLPChange = useCallback(async (amount: string) => {
    setRemoveLiquidityAmountLPFn(amount);

    if(!amount) {
      setRemoveLiquidityAmountBFn("");
      setRemoveLiquidityAmountAFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens) {
      console.log("No total poools");
      return;
    }

    const [pairState, pair] = pairs[0];

    if(!pair) {
      console.log("NO piar");
      return;
    }

    const parsedAmount: CurrencyAmount | undefined = tryParseAmount(
      amount.toString(),
      lpToken,
      chainId,
    );

    const wrappedIndependentAmount = wrappedCurrencyAmount(parsedAmount, chainId);

    if (!lpToken || !wrappedIndependentAmount) {
      console.log("NO lp token");
      return;
    }

    const price1 = pair.getLiquidityValue(pair.token0, totalPoolTokens, wrappedIndependentAmount, false);
    const price2 = pair.getLiquidityValue(pair.token1, totalPoolTokens, wrappedIndependentAmount, false);


    console.log("PRICE IS WHAT YOU GET");
    console.log(price1);
    console.log(price2);
    // console.log(price3.toSignificant(6));

    setRemoveLiquidityAmountAFn(price1.toSignificant(6));
    setRemoveLiquidityAmountBFn(price2.toSignificant(6));

  }, [chainId, lpToken, pairs, setRemoveLiquidityAmountAFn, setRemoveLiquidityAmountBFn, setRemoveLiquidityAmountLPFn, totalPoolTokens])

  const handleAmountAChange = useCallback(async (amount: string) => {
    setRemoveLiquidityAmountAFn(amount);

    if(!amount) {
      setRemoveLiquidityAmountBFn("");
      setRemoveLiquidityAmountLPFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens || !userPoolBalance || !lpToken) {
      return;
    }

    const [pairState, pair] = pairs[0];

    if(!pair) {
      return;
    }

    const parsedAmount: CurrencyAmount | undefined = tryParseAmount(
      amount.toString(),
      tokenA,
      chainId,
    );

    const wrappedIndependentAmount = wrappedCurrencyAmount(parsedAmount, chainId);

    if (!tokenA || !wrappedIndependentAmount) {
      return;
    }

    const price = pair.priceOf(tokenA).quote(wrappedIndependentAmount);

    const totalSupply = pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false);

    const percentage = new Percent(wrappedIndependentAmount.raw, totalSupply.raw);

    const price1 = new TokenAmount(lpToken, percentage.multiply(userPoolBalance.raw).quotient)

    setRemoveLiquidityAmountBFn(price.toSignificant(6));
    setRemoveLiquidityAmountLPFn(price1.toSignificant(6));
  }, [chainId, lpToken, pairs, setRemoveLiquidityAmountAFn, setRemoveLiquidityAmountBFn, setRemoveLiquidityAmountLPFn, tokenA, totalPoolTokens, userPoolBalance]);

  const handleAmountBChange = useCallback(async (amount: string) => {
    setRemoveLiquidityAmountBFn(amount);

    if(!amount) {
      setRemoveLiquidityAmountAFn("");
      setRemoveLiquidityAmountLPFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens || !userPoolBalance || !lpToken) {
      return;
    }

    const [pairState, pair] = pairs[0];

    if(!pair) {
      return;
    }

    const parsedAmount: CurrencyAmount | undefined = tryParseAmount(
      amount.toString(),
      tokenB,
      chainId,
    );

    const wrappedIndependentAmount = wrappedCurrencyAmount(parsedAmount, chainId);

    if (!tokenB || !wrappedIndependentAmount) {
      return;
    }

    const totalSupply = pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false);

    const percentage = new Percent(wrappedIndependentAmount.raw, totalSupply.raw);

    const price1 = new TokenAmount(lpToken, percentage.multiply(userPoolBalance.raw).quotient)


    const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

    setRemoveLiquidityAmountAFn(price.toSignificant(6));
    setRemoveLiquidityAmountLPFn(price1.toSignificant(6));

  }, [chainId, lpToken, pairs, setRemoveLiquidityAmountAFn, setRemoveLiquidityAmountBFn, setRemoveLiquidityAmountLPFn, tokenB, totalPoolTokens, userPoolBalance]);

  const removeLiquidity = useCallback(async () => {
    if(!tokenA || !tokenB || !chainId || !web3Provider || !account || !fragment || !lpToken) {
      return;
    }

    const parsedAmountA = tryParseAmount(amountA.toString(), tokenA, chainId);
    const parsedAmountB = tryParseAmount(amountB.toString(), tokenB, chainId);
    const parsedAmountLP = tryParseAmount(amountLP.toString(), lpToken, chainId);

    if(!parsedAmountA || !parsedAmountB || !parsedAmountLP) {
      console.log("No parsed amounts");
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, 1)[0],
      b: calculateSlippageAmount(parsedAmountB, 1)[0],
    }

    const args: any[] = [
      tokenA.address,
      tokenB.address,
      parsedAmountLP.raw.toString(),
      amountsMin.a.toString(),
      amountsMin.b.toString(),
      account,
      deadline,
    ];

    const callData = ROUTER_INTERFACE.encodeFunctionData(fragment, args);

    const contract = new Contract(
      lpToken.address,
      ERC_223_ABI,
      await web3Provider.getSigner(account)
    );

    console.log(contract);

    try {
      const tx = await contract["transfer"](contracts.router[chainId], parsedAmountLP.raw.toString(), callData);
      console.log(tx);
    } catch (e) {
      console.log(e);
    }
  }, [tokenA, tokenB, fragment, chainId, web3Provider, account, lpToken, amountA, amountB, amountLP, deadline]);

  return {
    removeLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange
  };
}
