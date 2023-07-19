import {useMemo} from 'react'
import { Pair, TokenAmount} from "@callisto-enterprise/soy-sdk";

import {toCallState} from "../toCallState";
import {PAIR_INTERFACE} from "../config/interfaces";
import {usePairFragment} from "../config/fragments";
import {useMultiCallGetReserves} from "../web3/hooks/useMultiCallGetReserves";
import {WrappedTokenInfo} from "../../pages/swap/functions";

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(currencies: [WrappedTokenInfo | null, WrappedTokenInfo | null][]): [PairState, Pair | null][] | null {
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        currencyA,
        currencyB
      ]),
    [currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  );

  const fragment = usePairFragment("getReserves");
  const {loading, result} = useMultiCallGetReserves({addresses: pairAddresses})

  const results = useMemo(() => {
    if (loading || !fragment) {
      return;
    }

    const {resultsBlockNumber, returnData} = result;
    const serializedReturnData = returnData.map((item) => {
      return {
        valid: true,
        data: item,
        blockNumber: resultsBlockNumber
      }
    });

    return serializedReturnData.map((result) => toCallState(result, PAIR_INTERFACE, fragment, resultsBlockNumber))
  }, [fragment, loading, result])


  return useMemo(() => {
    if(!results) {
      return null;
    }

    return results.map((result, i) => {
      const {result: reserves, loading} = result
      const tokenA = tokens?.[i]?.[0];
      const tokenB = tokens?.[i]?.[1];

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const {reserve0, reserve1} = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]


      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
      ]
    })
  }, [results, tokens])
}
