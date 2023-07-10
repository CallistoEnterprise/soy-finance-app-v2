import {useCallback, useEffect, useMemo, useState} from "react";
import {useEvent, useStore} from "effector-react";
import {
  $removeLiquidityAmountA,
  $removeLiquidityAmountB,
  $removeLiquidityAmountLP,
  $removeLiquidityInputTokens,
  setRemoveLiquidityAmountA,
  setRemoveLiquidityAmountB,
  setRemoveLiquidityAmountLP, setRemoveLiquidityLPToken,
  setRemoveLiquidityTokenA,
  setRemoveLiquidityTokenB
} from "../../../../shared/web3/models/init";
import IUniswapV2PairABI from "../../../../shared/constants/abis/interfaces/IUniswapV2Pair.json";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
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
import {Contract, parseUnits} from "ethers";
import useTransactionDeadline from "../../../swap/hooks/useTransactionDeadline";
import {BigNumber} from "@ethersproject/bignumber";
import {usePairs} from "../../../../shared/hooks/usePairs";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import {useTotalSupply} from "../../../../shared/web3/hooks/useTotalSupply";
import {useRouterFragment} from "../../../../shared/config/fragments";
import {ROUTER_ABI} from "../../../../shared/constants/abis";
import {ROUTER_ADDRESS} from "../../../../shared/web3/contracts";
import {ApprovalState, useApproveCallback} from "./useApprove";
import {splitSignature} from "@ethersproject/bytes";

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
  // console.log(value);
  // console.log(currency)
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    // console.log(typedValueParsed);
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
  const {chainId, web3Provider, account, provider} = useWeb3();

  const deadline = useTransactionDeadline(20);
  const {tokenA, tokenB, lpToken} = useStore($removeLiquidityInputTokens);
  const setRemoveLiquidityTokenAFn = useEvent(setRemoveLiquidityTokenA);
  const setRemoveLiquidityTokenBFn = useEvent(setRemoveLiquidityTokenB);
  const setRemoveLiquidityTokenLPFn = useEvent(setRemoveLiquidityLPToken);

  const setRemoveLiquidityAmountAFn = useEvent(setRemoveLiquidityAmountA);
  const setRemoveLiquidityAmountLPFn = useEvent(setRemoveLiquidityAmountLP);
  const setRemoveLiquidityAmountBFn = useEvent(setRemoveLiquidityAmountB);

  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);
  const amountLP = useStore($removeLiquidityAmountLP);

  const [approving, setApproving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [approval, approveCallback] = useApproveCallback(
    lpToken,
    amountLP,
  );

  const pairArray = useMemo(() => {
    return [[tokenA, tokenB]]
  }, [tokenA, tokenB]);

  console.log("LP TOKEN");
  console.log(lpToken);

  const pairs = usePairs(pairArray);

  const handleTokenAChange = useCallback((token: WrappedTokenInfo) => {
    setRemoveLiquidityTokenAFn(token);
  }, [setRemoveLiquidityTokenAFn]);

  const handleTokenBChange = useCallback((token: WrappedTokenInfo) => {
    setRemoveLiquidityTokenBFn(token);
  }, [setRemoveLiquidityTokenBFn]);

  useEffect(() => {
    if(pairs) {
      const [, pair] = pairs[0];

      if(pair) {
        console.log("Setting lp");
        setRemoveLiquidityTokenLPFn(pair.liquidityToken);
      }
    }
  }, [pairs, setRemoveLiquidityTokenLPFn]);

  const userPoolBalance = useBalanceOf(pairs?.[0]?.[1]?.liquidityToken || null);

  const totalPoolTokens = useTotalSupply(pairs?.[0]?.[1]?.liquidityToken);

  const pair = useMemo(() => {
    if(pairs && pairs[0] && pairs[0][1]) {
      return pairs[0][1];
    }

    return null;
  }, [pairs]);

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
        pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
        pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
      ]
      : [undefined, undefined]

  const fragment = useRouterFragment("removeLiquidity");

  const handleLiquidityAmountLPChange = useCallback(async (amount: string) => {
    setRemoveLiquidityAmountLPFn(amount);

    if (!amount) {
      setRemoveLiquidityAmountBFn("");
      setRemoveLiquidityAmountAFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens) {
      console.log("No total poools");
      return;
    }

    const [pairState, pair] = pairs[0];

    if (!pair) {
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

    //
    // console.log("PRICE IS WHAT YOU GET");
    // console.log(price1);
    // console.log(price2);
    // console.log(price3.toSignificant(6));

    setRemoveLiquidityAmountAFn(price1.toSignificant(6));
    setRemoveLiquidityAmountBFn(price2.toSignificant(6));

  }, [chainId, lpToken, pairs, setRemoveLiquidityAmountAFn, setRemoveLiquidityAmountBFn, setRemoveLiquidityAmountLPFn, totalPoolTokens])

  const handleAmountAChange = useCallback(async (amount: string) => {
    setRemoveLiquidityAmountAFn(amount);

    if (!amount) {
      setRemoveLiquidityAmountBFn("");
      setRemoveLiquidityAmountLPFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens || !userPoolBalance || !lpToken) {
      return;
    }

    const [pairState, pair] = pairs[0];

    if (!pair) {
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

    if (!amount) {
      setRemoveLiquidityAmountAFn("");
      setRemoveLiquidityAmountLPFn("");
      return;
    }

    if (!chainId || !pairs || !totalPoolTokens || !userPoolBalance || !lpToken) {
      return;
    }

    const [pairState, pair] = pairs[0];

    if (!pair) {
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

  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)

  async function onAttemptToApprove() {

    if (!account || !web3Provider || !deadline || !chainId || !lpToken) throw new Error('missing dependencies')

    const parsedAmountLP = tryParseAmount(amountLP.toString(), lpToken, chainId);

    if (!parsedAmountLP) {
      return;
    }

    const pairContract = new Contract(lpToken.address, IUniswapV2PairABI, await web3Provider.getSigner(account))

    if (!pairContract) {
      console.log("No contract");
      return;
    }


    // try to gather a signature for permission
    const nonce = await pairContract["nonces"](account)

    console.log(nonce);

    const EIP712Domain = [
      {name: 'name', type: 'string'},
      {name: 'version', type: 'string'},
      {name: 'chainId', type: 'uint256'},
      {name: 'verifyingContract', type: 'address'},
    ]
    const domain = {
      name: 'SoyFinance LPs',
      version: '1',
      chainId,
      verifyingContract: lpToken?.address,
    }
    const Permit = [
      {name: 'owner', type: 'address'},
      {name: 'spender', type: 'address'},
      {name: 'value', type: 'uint256'},
      {name: 'nonce', type: 'uint256'},
      {name: 'deadline', type: 'uint256'},
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[chainId ?? 820].toString(),
      value: parsedAmountLP.raw.toString(),
      nonce: "0x" + nonce.toString() + "0",
      deadline: +deadline,
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    setApproving(true);
    provider
      .send('eth_signTypedData_v4', [account, data])
      .then((data) => {
        console.log("ETH SIGN");
        console.log(data);
        return splitSignature(data.result);
      })
      .then((signature) => {
        console.log(signature);

        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: +deadline,
        });
      })
      .catch(async (err) => {
        console.log(err);
        console.log(err.code);
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (err?.code !== 4001 && err?.code !== -32603) {
          await approveCallback();
        }
      }).finally(() => {
      setApproving(false);
    });
  }

  const removeLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !chainId || !web3Provider || !account || !fragment || !lpToken || !deadline) {
      console.log("Not enough data");
      return;
    }

    const parsedAmountA = tryParseAmount(amountA.toString(), tokenA, chainId);
    const parsedAmountB = tryParseAmount(amountB.toString(), tokenB, chainId);
    const parsedAmountLP = tryParseAmount(amountLP.toString(), lpToken, chainId);

    if (!parsedAmountA || !parsedAmountB || !parsedAmountLP) {
      console.log("No parsed amounts");
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, 1)[0],
      b: calculateSlippageAmount(parsedAmountB, 1)[0],
    }

    let methodNames: string[]
    let args: Array<string | string[] | number | boolean>

    const currencyBIsETH = tokenA === ETHERS[chainId]
    const oneCurrencyIsETH = tokenB === ETHERS[chainId] || currencyBIsETH

    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityCLO
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityCLO', 'removeLiquidityCLOSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          parsedAmountLP.raw.toString(),
          amountsMin.a.toString(),
          amountsMin.b.toString(),
          account,
          deadline,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          parsedAmountLP.raw.toString(),
          amountsMin.a.toString(),
          amountsMin.b.toString(),
          account,
          deadline,
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityCLOWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityCLOWithPermit', 'removeLiquidityCLOWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          parsedAmountLP.raw.toString(),
          amountsMin.a.toString(),
          amountsMin.b.toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          parsedAmountLP.raw.toString(),
          amountsMin.a.toString(),
          amountsMin.b.toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const contract = new Contract(
      ROUTER_ADDRESS[chainId],
      ROUTER_ABI,
      await web3Provider.getSigner(account)
    );

    console.log(contract);

    setRemoving(true);
    try {
      const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
        methodNames.map((methodName) => {
          console.log(methodName);
            return contract[methodName]["estimateGas"](...args)
              .then(data => BigNumber.from(data)._hex)
              .catch((err) => {
                console.error(`estimateGas failed`, methodName, args, err)
                return undefined
              })
          }
        ),
      )

      console.log(safeGasEstimates);

      const indexOfSuccessfulEstimation = 0;

      if (indexOfSuccessfulEstimation === -1) {
        console.error('This transaction would fail. Please contact support.')
      } else {
        const methodName = methodNames[indexOfSuccessfulEstimation]
        const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

        const tx = await contract[methodName](...args, {
          gasLimit: safeGasEstimate,
        });
        console.log(tx);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setRemoving(false);
    }
  }, [tokenA, tokenB, chainId, web3Provider, account, fragment, lpToken, deadline, amountA, amountB, amountLP, approval, signatureData]);

  return {
    removeLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange,
    onAttemptToApprove,
    approving,
    removing,
    pair: pairs?.[0][1],
    readyToRemove: approval === ApprovalState.APPROVED || signatureData !== null,
    token1Deposited,
    token0Deposited
  };
}
