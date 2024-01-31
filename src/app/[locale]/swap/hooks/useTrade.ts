import { useSwapAmountsStore, useSwapTokensStore, useTradeStore } from "@/app/[locale]/swap/stores";
import { useCallback } from "react";
import { TokenAmount, Trade, TradeType } from "@callisto-enterprise/soy-sdk";
import { WrappedToken } from "@/config/types/WrappedToken";
import { parseUnits } from "viem";
import getAllowedPairs from "@/app/[locale]/swap/hooks/useAllowedPairs";
import { useAccount } from "wagmi";
export default function useTrade() {
  const { trade, setTrade, tradeType, setTradeType } = useTradeStore();
  const { tokenFrom, tokenTo, setTokenTo, setTokenFrom, switchTokens } = useSwapTokensStore();
  const { amountIn, amountOut, setAmountIn, setAmountOut, amountInString, amountOutString } = useSwapAmountsStore();
  const { chainId } = useAccount();

  const recalculateTradeIn = useCallback(async (amountIn: bigint, tokenFrom: WrappedToken, tokenTo: WrappedToken) => {
    const amount = new TokenAmount(
      tokenFrom,
      amountIn
    );

    const pairs = await getAllowedPairs(tokenFrom, tokenTo, chainId || 820);

    if(!pairs) {
      return undefined;
    }

    const trade1 = Trade.bestTradeExactIn(
      pairs,
      amount,
      tokenTo,
      {
        maxHops: 3, maxNumResults: 1
      }
    );

    return trade1[0];
  }, [chainId]);

  const recalculateTradeOut = useCallback(async (amountOut: bigint, tokenFrom: WrappedToken, tokenTo: WrappedToken) => {
    const amount = new TokenAmount(
      tokenTo,
      amountOut
    );

    const pairs = await getAllowedPairs(tokenFrom, tokenTo, chainId || 820);

    if(!pairs) {
      return undefined;
    }

    const trade1 = Trade.bestTradeExactOut(
      pairs,
      tokenFrom,
      amount,
      {
        maxHops: 3, maxNumResults: 1
      }
    );

    return trade1[0];
  }, [chainId]);

  const handleAmountInChange = useCallback(async (amountInParam: string) => {
    setAmountIn(amountInParam, tokenFrom?.decimals);
    setTradeType(TradeType.EXACT_INPUT);

    if(!amountInParam) {
      setAmountOut("");
      return;
    }

    if (tokenFrom && tokenTo) {
      const parsedAmountIn = parseUnits(amountInParam, tokenFrom.decimals);
      const _trade = await recalculateTradeIn(parsedAmountIn, tokenFrom, tokenTo);

      if (_trade) {
        setTrade(_trade);
        setAmountOut(_trade.outputAmount.toSignificant(), tokenTo.decimals);
      }
    }
  }, [recalculateTradeIn, setAmountIn, setAmountOut, setTrade, setTradeType, tokenFrom, tokenTo]);

  const handleAmountOutChange = useCallback(async (amountOutParam: string) => {
    setAmountOut(amountOutParam, tokenTo?.decimals);
    setTradeType(TradeType.EXACT_OUTPUT);

    if(!amountOutParam) {
      setAmountIn("");
      return;
    }

    if (tokenFrom && tokenTo) {
      const parsedAmountOut = parseUnits(amountOutParam, tokenTo.decimals);
      const _trade = await recalculateTradeOut(parsedAmountOut, tokenFrom, tokenTo);
      if (_trade) {
        setTrade(_trade);
        setAmountIn(_trade.inputAmount.toSignificant(), tokenTo.decimals);
      }
    }
  }, [recalculateTradeOut, setAmountIn, setAmountOut, setTrade, setTradeType, tokenFrom, tokenTo]);

  const handleTokenFromChange = useCallback(async (tokenFromParam: WrappedToken) => {
    let currentTokenTo = tokenTo;

    if(tokenTo && tokenFromParam.address === tokenTo.address) {
      currentTokenTo = tokenFrom;
      setTokenTo(tokenFrom);
    }

    setTokenFrom(tokenFromParam);

    if(amountInString) {
      setAmountIn(amountInString, tokenFromParam.decimals);
    }

    if(currentTokenTo) {
      if(tradeType === TradeType.EXACT_INPUT && amountIn) {
        const _trade = await recalculateTradeIn(amountIn, tokenFromParam, currentTokenTo);

        if (_trade) {
          setTrade(_trade);
          setAmountOut(_trade.outputAmount.toSignificant(), tokenFromParam.decimals);
        }
      }

      if(tradeType === TradeType.EXACT_OUTPUT && amountOut) {
        const _trade = await recalculateTradeOut(amountOut, tokenFromParam, currentTokenTo);

        if (_trade) {
          setTrade(_trade);
          setAmountIn(_trade.inputAmount.toSignificant(), currentTokenTo.decimals);
        }
      }
    }
  }, [amountIn, amountInString, amountOut, recalculateTradeIn, recalculateTradeOut, setAmountIn, setAmountOut, setTokenFrom, setTokenTo, setTrade, tokenFrom, tokenTo, tradeType]);

  const handleTokenToChange = useCallback(async (tokenToParam: WrappedToken) => {
    let currentTokenFrom = tokenFrom;

    if(tokenFrom && tokenToParam.address === tokenFrom.address) {
      currentTokenFrom = tokenTo;
      setTokenFrom(tokenTo);
    }

    setTokenTo(tokenToParam);

    if(amountOutString) {
      setAmountOut(amountOutString, tokenToParam.decimals);
    }

    if(currentTokenFrom) {
      if(tradeType === TradeType.EXACT_INPUT && amountIn) {
        const _trade = await recalculateTradeIn(amountIn, currentTokenFrom, tokenToParam);

        if (_trade) {
          setTrade(_trade);
          setAmountOut(_trade.outputAmount.toSignificant(), tokenToParam.decimals);
        }
      }

      if(tradeType === TradeType.EXACT_OUTPUT && amountOut) {
        const _trade = await recalculateTradeOut(amountOut, currentTokenFrom, tokenToParam);

        if (_trade) {
          setTrade(_trade);
          setAmountIn(_trade.inputAmount.toSignificant(), currentTokenFrom.decimals);
        }
      }
    }
  }, [amountIn, amountOut, amountOutString, recalculateTradeIn, recalculateTradeOut, setAmountIn, setAmountOut, setTokenFrom, setTokenTo, setTrade, tokenFrom, tokenTo, tradeType]);

  const handleSwitch = useCallback( async () => {
    switchTokens();
    setAmountIn(amountOutString, tokenTo?.decimals);

    if(tokenTo && tokenFrom && amountOut) {
      const _trade = await recalculateTradeIn(amountOut, tokenTo, tokenFrom);

      if(_trade) {
        setTrade(_trade);
        setAmountOut(_trade.outputAmount.toSignificant(), tokenTo.decimals);
      }
    }

  }, [amountOut, amountOutString, recalculateTradeIn, setAmountIn, setAmountOut, setTrade, switchTokens, tokenFrom, tokenTo]);

  return {
    trade,
    handleAmountInChange,
    handleAmountOutChange,
    handleTokenFromChange,
    handleTokenToChange,
    handleSwitch
  }
}
