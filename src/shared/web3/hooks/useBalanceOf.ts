import {useEffect, useState} from "react";
import {CallState} from "../../types";
import {useERC20Contract} from "./useERC20Contract";
import {IIFE} from "../functions/iife";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {Token, TokenAmount} from "@callisto-enterprise/soy-sdk";

export function useBalanceOf(token: Token | null): TokenAmount | null {
  const {account} = useWeb3();
  const [callState, setCallState] = useState<CallState>(CallState.INITIAL);
  const [result, setResult] = useState<TokenAmount | null>(null);

  const erc20Contract = useERC20Contract({address: token?.address});

  useEffect(() => {
    if(!erc20Contract || !account || !token) {
      return;
    }

    setCallState(CallState.LOADING);

    try {
      IIFE(async () => {
        const balance = await erc20Contract["balanceOf"](account);

        setResult(new TokenAmount(token, balance.toString()));
      });
    } catch (e) {
      console.log(e);
    } finally {
      setCallState(CallState.READY);
    }
  }, [account, erc20Contract, token]);

  return result;
}
