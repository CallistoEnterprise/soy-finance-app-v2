import {useCallback, useMemo} from "react";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityAmountA, $liquidityAmountB,
  $liquidityInputTokens,
  setLiquidityAmountA, setLiquidityAmountB,
  setLiquidityTokenA,
  setLiquidityTokenB
} from "../../../../shared/web3/models/init";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {ChainId, Currency, CurrencyAmount, ETHERS, JSBI, Token, TokenAmount, WETH} from "@callisto-enterprise/soy-sdk";
import {useBlockNumber} from "../../../../shared/hooks/useBlockNumber";
import {Contract, parseUnits} from "ethers";
import useTransactionDeadline from "../../../swap/hooks/useTransactionDeadline";
import {BigNumber} from "@ethersproject/bignumber";
import routerABI from "../../../../shared/abis/interfaces/router.json";
import {usePairs} from "../../../../shared/hooks/usePairs";

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

export function tryParseAmount(value?: string, currency?: WrappedTokenInfo | null, chainId?: number): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
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

export function useLiquidity() {
  const {chainId, web3Provider, account} = useWeb3();

  const deadline = useTransactionDeadline(20);
  const {tokenA, tokenB} = useStore($liquidityInputTokens);
  const setLiquidityTokenAFn = useEvent(setLiquidityTokenA);
  const setLiquidityTokenBFn = useEvent(setLiquidityTokenB);

  const setLiquidityAmountAFn = useEvent(setLiquidityAmountA);
  const setLiquidityAmountBFn = useEvent(setLiquidityAmountB);

  const amountA = useStore($liquidityAmountA);
  const amountB = useStore($liquidityAmountB);

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );

  const pairArray = useMemo(() => {
    return [[tokenA, tokenB]]
  }, [tokenA, tokenB]);

  const pairs = usePairs(pairArray);

  const handleTokenAChange = useCallback((token: WrappedTokenInfo) => {
    setLiquidityTokenAFn(token);
  }, [setLiquidityTokenAFn]);

  const handleTokenBChange = useCallback((token: WrappedTokenInfo) => {
    setLiquidityTokenBFn(token);
  }, [setLiquidityTokenBFn]);

  const handleAmountAChange = useCallback(async (amount: string) => {
    setLiquidityAmountAFn(amount);
    if (!chainId || !pairs) {
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

    setLiquidityAmountBFn(price.toSignificant(6));
  }, [chainId, pairs, setLiquidityAmountAFn, setLiquidityAmountBFn, tokenA]);

  const handleAmountBChange = useCallback(async (amount: string) => {
    setLiquidityAmountBFn(amount);
    if (!chainId || !pairs) {
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

    const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

    setLiquidityAmountAFn(price.toSignificant(6));
  }, [chainId, pairs, setLiquidityAmountAFn, setLiquidityAmountBFn, tokenB]);

  const addLiquidity = useCallback(async () => {
    if(!tokenA || !tokenB || !chainId || !web3Provider || !account) {
      return;
    }

    const parsedAmountA = tryParseAmount(amountA, tokenA, chainId);
    const parsedAmountB = tryParseAmount(amountB, tokenB, chainId);

    if(!parsedAmountA || !parsedAmountB) {
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, 1)[0],
      b: calculateSlippageAmount(parsedAmountB, 1)[0],
    }

    const args: any[] = [
      tokenA.address, //"0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3"
      tokenB.address, //"0xCC10A4050917f771210407DF7A4C048e8934332c"
      parsedAmountA.raw.toString(), //"2000000000000000000"
      parsedAmountB.raw.toString(), //"110574669940283"
      amountsMin.a.toString(), //"1990000000000000000"
      amountsMin.b.toString(),//"110021796590581"
      account, //"0xF1602175601606E8ffEe38CE433A4DB4C6cf5d60"
      deadline, //"0x645cc5f5"
      {}
    ];


    const router = new Contract(
      bridgeAddress,
      routerABI,
      await web3Provider.getSigner(account)
    );


    const _estimatedGas = await router["addLiquidity"]["estimateGas"](...args);

    args[args.length - 1]["gasLimit"] = BigNumber.from(_estimatedGas)._hex;

    try {
      const tx = await router["addLiquidity"](...args);
      console.log(tx);
    } catch (e) {
      console.log(e);
    }

  }, [tokenA, tokenB, chainId, web3Provider, account, amountA, amountB, deadline, bridgeAddress]);

  const removeLiquidity = useCallback(() => {

  }, []);

  return {
    addLiquidity,
    removeLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange
  };
}
