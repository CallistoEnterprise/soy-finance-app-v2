import {useBlockNumber} from "../../../shared/hooks/useBlockNumber";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEvent, useStore} from "effector-react";
import {$swapInputData, $trade} from "../models/stores";
import {setAmountIn, setAmountOut, setRoute, setTrade} from "../models";
import {useCallback, useEffect, useRef} from "react";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {parseUnits} from "ethers";
import {getAllowedPairs, toTokenAmount} from "../functions";
import {Trade, TradeType} from "@callisto-enterprise/soy-sdk";

export function useTrade() {
  console.log("RENDEEER");
  const { web3Provider, chainId } = useWeb3();
  const blockNumber = useBlockNumber();
  const swapInputData = useStore($swapInputData);

  const setAmountInFn = useEvent(setAmountIn);
  const setAmountOutFn = useEvent(setAmountOut);

  const trade = useStore($trade);

  const setTradeFn = useEvent(setTrade);
  const setRouteFn = useEvent(setRoute);

  const tradeRef = useRef(trade);
  const swapInputDataRef = useRef(swapInputData);

  const {showMessage} = useSnackbar();

  useEffect(() => {
    tradeRef.current = trade;
  }, [trade]);

  useEffect(() => {
    swapInputDataRef.current = swapInputData;
  }, [swapInputData]);

  const recalculateTradeIn = useCallback(async (amount, token, tokenB = null) => {
    const tokenTo = tokenB || swapInputData.tokenTo;

    if(!amount) {
      setTradeFn(null);
      setAmountOutFn("");
      return;
    }

    if(!token || !tokenTo || !web3Provider || !blockNumber) {
      return null;
    }

      const currencyOut = tokenTo;


      const typedValueParsed = parseUnits(
        amount,
        token.decimal_token
      ).toString();

      const currencyAmountIn = toTokenAmount(token, typedValueParsed);

      const allowedPairs = await getAllowedPairs(token, currencyOut, web3Provider, blockNumber, chainId);

      const trade1 = Trade.bestTradeExactIn(
        allowedPairs,
        currencyAmountIn,
        tokenTo,
        {
          maxHops: 3, maxNumResults: 1
        }
      );

      if(trade1[0]) {
        setAmountOutFn(trade1[0].outputAmount.toSignificant());
        setTradeFn(trade1[0]);
        setRouteFn(trade1[0].route);
        return;
      }

    setTradeFn(null);
    setRouteFn(null);

  }, [swapInputData.tokenTo, web3Provider, blockNumber, chainId, setTradeFn, setRouteFn, setAmountOutFn]);

  const recalculateTradeOut = useCallback(async (amount, token, tokenB = null) => {
    const tokenFrom = tokenB || swapInputData.tokenFrom;

    if(!amount) {
      setTradeFn(null);
      setAmountInFn("");
      return;
    }

    if(!tokenFrom || !token || !web3Provider || !blockNumber) {
      return null;
    }

    const currencyIn = tokenFrom;
    const currencyOut = token;

    const typedValueParsed = parseUnits(
      amount,
      token.decimal_token
    ).toString();

    const currencyAmountOut = toTokenAmount(currencyOut, typedValueParsed);

    const allowedPairs = await getAllowedPairs(currencyIn, currencyOut, web3Provider, blockNumber, chainId);

    const trade1 = Trade.bestTradeExactOut(
      allowedPairs,
      currencyIn,
      currencyAmountOut,
      {
        maxHops: 3, maxNumResults: 1
      }
    );

    if(trade1[0]) {
      setAmountInFn(trade1[0].inputAmount.toSignificant());
      setTradeFn(trade1[0]);
      setRouteFn(trade1[0].route);
      return;
    }

    setTradeFn(null);
    setRouteFn(null);

  }, [swapInputData.tokenFrom, web3Provider, blockNumber, chainId, setTradeFn, setRouteFn, setAmountInFn]);

  useEffect(() => {
    if(tradeRef.current) {

      (async () => {
        if(tradeRef.current?.tradeType === TradeType.EXACT_INPUT) {
          await recalculateTradeIn(swapInputDataRef.current.amountIn, swapInputDataRef.current.tokenFrom);
        }

        if(tradeRef.current?.tradeType === TradeType.EXACT_OUTPUT) {
          await recalculateTradeOut(swapInputDataRef.current.amountOut, swapInputDataRef.current.tokenTo);
        }
      })();
    }
  }, [blockNumber, recalculateTradeIn, recalculateTradeOut]);

  return {recalculateTradeIn, recalculateTradeOut};
}
