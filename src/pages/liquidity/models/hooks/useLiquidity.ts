import {useCallback, useEffect, useMemo, useState} from "react";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityAmountA, $liquidityAmountB,
  $liquidityInputTokens,
  setLiquidityAmountA, setLiquidityAmountB,
  setLiquidityTokenA,
  setLiquidityTokenB
} from "../../../../shared/web3/models/init";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {CurrencyAmount, JSBI, TokenAmount } from "@callisto-enterprise/soy-sdk";
import {Contract, parseUnits} from "ethers";
import useTransactionDeadline from "../../../swap/hooks/useTransactionDeadline";
import {BigNumber} from "@ethersproject/bignumber";
import routerABI from "../../../../shared/constants/abis/interfaces/router.json";
import {usePairs} from "../../../../shared/hooks/usePairs";
import {wrappedCurrencyAmount} from "../../../../shared/web3/functions/wrappedCurrency";
import {WrappedTokenInfo} from "../../../swap/functions";
import {setConfirmAddLiquidityDialogOpened} from "../index";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import {useAwaitingApproveDialog} from "../../../../stores/awaiting-approve-dialog/useAwaitingApproveDialog";
import {isNativeToken} from "../../../../shared/utils";
import {$swapSlippage} from "../../../swap/models/stores";
import {useReceipt} from "../../../../shared/hooks/useReceipt";
import {useTrackedPools} from "../../../../stores/tracked-pools/useTrackedPools";

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
  const {chainId, web3Provider, account, walletName} = useWeb3();

  const deadline = useTransactionDeadline(20);
  const slippage = useStore($swapSlippage);

  const {tokenA, tokenB} = useStore($liquidityInputTokens);
  const setLiquidityTokenAFn = useEvent(setLiquidityTokenA);
  const setLiquidityTokenBFn = useEvent(setLiquidityTokenB);

  const setLiquidityAmountAFn = useEvent(setLiquidityAmountA);
  const setLiquidityAmountBFn = useEvent(setLiquidityAmountB);

  const setConfirmAddLiquidityDialogOpenedFn = useEvent(setConfirmAddLiquidityDialogOpened);

  const {showMessage} = useSnackbar();

  const amountA = useStore($liquidityAmountA);
  const amountB = useStore($liquidityAmountB);

  const {importPool} = useTrackedPools();

  const [tokenChanged, setTokenChanged] = useState(false);

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );

  const pairArray = useMemo(() => {
    return [[tokenA, tokenB]]
  }, [tokenA, tokenB]);

  const pairs = usePairs(pairArray);

  const priceA = useMemo(() => {
    if(!pairs || !tokenB) {
      return null;
    }

    const [pairState, pair] = pairs[0];

    if(pair) {
      return pair.priceOf(tokenB);
    }

    return null;
  }, [pairs, tokenB]);


  const priceB = useMemo(() => {
    if(!pairs || !tokenA) {
      return null;
    }

    const [pairState, pair] = pairs[0];

    if(pair) {
      return pair.priceOf(tokenA);
    }

    return null;

  }, [pairs, tokenA]);

  useEffect(() => {
    if(!tokenChanged) {
      return;
    }

    if(!amountA && !amountB) {
      setLiquidityAmountBFn("");
      setLiquidityAmountAFn("");
    }

    if(amountA && !amountB) {
      if (!chainId || !pairs) {
        return;
      }

      const [pairState, pair] = pairs[0];

      if(!pair) {
        return;
      }

      const parsedAmount: CurrencyAmount | undefined = tryParseAmount(
        amountA.toString(),
        tokenA,
        chainId,
      );

      const wrappedIndependentAmount = wrappedCurrencyAmount(parsedAmount, chainId);

      if (!tokenA || !wrappedIndependentAmount) {
        return;
      }

      const price = pair.priceOf(tokenA).quote(wrappedIndependentAmount);

      setLiquidityAmountBFn(price.toSignificant(6));
    }

    if(!amountA && amountB) {
      if (!chainId || !pairs) {
        return;
      }

      const [pairState, pair] = pairs[0];

      if(!pair) {
        return;
      }

      const parsedAmount: CurrencyAmount | undefined = tryParseAmount(
        amountB.toString(),
        tokenB,
        chainId,
      );

      const wrappedIndependentAmount = wrappedCurrencyAmount(parsedAmount, chainId);

      if (!tokenB || !wrappedIndependentAmount) {
        return;
      }

      const price = pair.priceOf(tokenB).quote(wrappedIndependentAmount);

      setLiquidityAmountAFn(price.toSignificant(6));
    }

    setTokenChanged(false);
  }, [amountA, amountB, chainId, pairs, setLiquidityAmountAFn, setLiquidityAmountBFn, tokenA, tokenB, tokenChanged]);

  const handleTokenBChange = useCallback((token: WrappedTokenInfo) => {
    if(tokenA && token.equals(tokenA)) {
      setLiquidityTokenAFn(tokenB);
    }

    setLiquidityTokenBFn(token);
    setTokenChanged(true);
  }, [setLiquidityTokenAFn, setLiquidityTokenBFn, tokenA, tokenB]);

  const handleTokenAChange = useCallback((token: WrappedTokenInfo) => {
    if(tokenB && token.equals(tokenB)) {
      setLiquidityTokenBFn(tokenA);
    }

    setLiquidityTokenAFn(token);
    setTokenChanged(true);
  }, [setLiquidityTokenAFn, setLiquidityTokenBFn, tokenA, tokenB]);

  const handleAmountAChange = useCallback(async (amount: string) => {
    setLiquidityAmountAFn(amount);

    if (!chainId || !pairs || !Boolean(amount)) {
      setLiquidityAmountBFn("");
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
    if (!chainId || !pairs || !Boolean(amount)) {
      setLiquidityAmountAFn("");
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

  const {handleOpen, setAwaitingApproveDialogInfo, setSubmitted, handleClose, setSubmittedInfo} = useAwaitingApproveDialog();
  const {wait} = useReceipt();

  const addLiquidity = useCallback(async () => {
    setConfirmAddLiquidityDialogOpenedFn(false);


    if(!tokenA || !tokenB || !chainId || !web3Provider || !account || !walletName) {
      showMessage("Wrong data. Please contact support", "error");
      return;
    }

    setSubmitted(false);
    handleOpen();
    setAwaitingApproveDialogInfo({
      subheading: `Supply ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol}`,
      wallet: walletName
    });

    const parsedAmountA = tryParseAmount(amountA, tokenA, chainId);
    const parsedAmountB = tryParseAmount(amountB, tokenB, chainId);

    if(!parsedAmountA || !parsedAmountB) {
      return;
    }

    const amountsMin = {
      a: calculateSlippageAmount(parsedAmountA, slippage * 100)[0],
      b: calculateSlippageAmount(parsedAmountB, 1)[0],
    }

    let method;
    let value;
    let args: any[];

    if(isNativeToken(tokenA.address) || isNativeToken(tokenB.address)) {
      method = "addLiquidityCLO";
      value = isNativeToken(tokenA.address) ? parsedAmountA.raw.toString() : parsedAmountB.raw.toString();
      args = [
        isNativeToken(tokenA.address) ? tokenB.address : tokenA.address, // token
        isNativeToken(tokenA.address) ? parsedAmountB.raw.toString() : parsedAmountA.raw.toString(), // token desired
        isNativeToken(tokenA.address) ? amountsMin.b.toString() : amountsMin.a.toString(), // token min
        isNativeToken(tokenA.address) ? amountsMin.a.toString() : amountsMin.b.toString(), // eth min
        account,
        deadline,
      ]
    } else {
      method = "addLiquidity"
      value = null;
      args = [
        tokenA.address, //"0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3"
        tokenB.address, //"0xCC10A4050917f771210407DF7A4C048e8934332c"
        parsedAmountA.raw.toString(), //"2000000000000000000"
        parsedAmountB.raw.toString(), //"110574669940283"
        amountsMin.a.toString(), //"1990000000000000000"
        amountsMin.b.toString(),//"110021796590581"
        account, //"0xF1602175601606E8ffEe38CE433A4DB4C6cf5d60"
        deadline, //"0x645cc5f5"
      ];
    }

    const router = new Contract(
      bridgeAddress,
      routerABI,
      await web3Provider.getSigner(account)
    );

    const _estimatedGas = await router[method]["estimateGas"](...args, value ? { value } : {});

    console.log("ADD LIQU");
    console.log(_estimatedGas);

    try {
      const tx = await router[method](...args, {
        ...(value ? { value } : {}),
        gasLimit: _estimatedGas + 30000n
      });

      setSubmitted(true);
      setSubmittedInfo({
        operation: "transaction",
        hash: tx.hash,
        chainId
      });

      wait({tx, chainId, summary: `Add ${(+amountA).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenA.symbol} and ${(+amountB).toLocaleString("en-US", {maximumFractionDigits: 6})} ${tokenB.symbol}`});
      importPool({chainId, pair: [tokenA?.address || "", tokenB?.address || ""], withMessage: false});
    } catch (error) {
      handleClose();
      if(error.code === "ACTION_REJECTED") {
        showMessage(
          "Action was rejected",
          "error"
        );
      } else {
        showMessage(
          "Something went wrong, please try again later",
          "error"
        );
      }
    }

  }, [setConfirmAddLiquidityDialogOpenedFn, tokenA, tokenB, chainId, web3Provider, account, walletName, setSubmitted, handleOpen, setAwaitingApproveDialogInfo, amountA, amountB, slippage, bridgeAddress, showMessage, deadline, setSubmittedInfo, wait, importPool, handleClose]);

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
