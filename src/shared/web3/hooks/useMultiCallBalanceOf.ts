import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEffect, useState} from "react";
import {CallState} from "../../types";
import {useMultiCallContract} from "./useMultiCallContract";
import {IIFE} from "../functions/iife";
import {ERC_20_INTERFACE} from "../../config/interfaces";
import {useErc20Fragment} from "../../config/fragments";

export function useMultiCallBalanceOf({addresses}) {
  const {account} = useWeb3();
  const [callState, setCallState] = useState<CallState>(CallState.INITIAL);
  const [result, setResult] = useState({
    resultsBlockNumber: null,
    returnData: []
  });

  const multiCallContract = useMultiCallContract();
  const fragment = useErc20Fragment("balanceOf");

  useEffect(() => {
    if(!multiCallContract || !fragment) {
      return;
    }

    const calls = addresses.map((address) => {
      return {
        address,
        callData: ERC_20_INTERFACE.encodeFunctionData(fragment, [account])
      }
    });
    setCallState(CallState.LOADING);

    try {
      IIFE(async () => {
        const [resultsBlockNumber, returnData] = await multiCallContract["aggregate"](calls.map((c) => {
          return [c.address, c.callData];
        }));

        setResult({
          resultsBlockNumber,
          returnData
        })
      });
    } catch (e) {
      console.log(e);
    } finally {
      setCallState(CallState.READY);
    }
  }, [account, addresses, fragment, multiCallContract]);

  return {
    loading: callState === CallState.LOADING,
    result
  }
}
