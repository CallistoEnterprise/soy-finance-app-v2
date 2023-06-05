import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEffect, useState} from "react";
import {useMultiCallContract} from "./useMultiCallContract";
import {IIFE} from "../functions/iife";
import {PAIR_INTERFACE} from "../../config/interfaces";
import {usePairFragment} from "../../config/fragments";

export function useMultiCallGetReserves({addresses}: {addresses: (string | undefined)[]}) {
  const {account} = useWeb3();
  const [result, setResult] = useState({
    resultsBlockNumber: null,
    returnData: []
  });

  const multiCallContract = useMultiCallContract();
  const fragment = usePairFragment("getReserves");

  useEffect(() => {
    if(!multiCallContract || !fragment) {
      return;
    }

    const calls = addresses.filter(address => Boolean(address)).map((address) => {

      return {
        address,
        callData: PAIR_INTERFACE.encodeFunctionData(fragment)
      }
    });

    try {
      IIFE(async () => {
        const [resultsBlockNumber, returnData] = await multiCallContract["aggregate"](calls.map((c) => {
          return [c.address, c.callData];
        }));

        setResult({
          resultsBlockNumber,
          returnData
        });
      });
    } catch (e) {
      console.log(e);
    }
  }, [account, addresses, fragment, multiCallContract]);

  return {
    loading: !result.resultsBlockNumber,
    result
  }
}
