import {Token, TokenAmount} from "@callisto-enterprise/soy-sdk";
import {useERC20Contract} from "./useERC20Contract";
import {useEffect, useState} from "react";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {CallState} from "../../types";
import {IIFE} from "../functions/iife";

export function useTotalSupply(token?: Token): TokenAmount | null {
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
        const supply = await erc20Contract["totalSupply"]();

        setResult(new TokenAmount(token, supply.toString()));
      });
    } catch (e) {
      console.log(e);
    } finally {
      setCallState(CallState.READY);
    }
  }, [account, erc20Contract, token]);

  return result;
}
