import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { useAllTokens } from "@/app/[locale]/liquidity/hooks/useAllTokens";
import { useTrackedPools } from "@/app/[locale]/liquidity/hooks/useTrackedPools";
import { tokenListMap } from "@/components/dialogs/PickTokenDialog";
import { WrappedToken } from "@/config/types/WrappedToken";
import { useUserTokensStore } from "@/components/dialogs/stores/useImportTokenDialogStore";

const BASES_TO_TRACK_LIQUIDITY_FOR = {
  820: [
    new WrappedToken(
      820,
      "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
      18,
      "CLO",
      "CLO",
      "/images/all-tokens/CLO.svg"
    ),
    new WrappedToken(
      820,
      '0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65',
      18,
      "SOY",
      "Soy-ERC223",
      "/images/all-tokens/SOY.svg"
    ),
    new WrappedToken(
      820,
      '0xbf6c50889d3a620eb42C0F188b65aDe90De958c4',
      18,
      "BUSDT",
      "Bulls USD",
      "/images/all-tokens/BUSDT.svg"
      )
  ]
}
function getPairOfWrappedTokensByAddress(addressPair: [string, string], chainId: number, userTokens: WrappedToken[]): [WrappedToken, WrappedToken] | [] {
  const [addressA, addressB] = addressPair;

  const tokenList = [...tokenListMap[chainId], ...userTokens];

  const tokenA = tokenList.find((t) => t.address.toLowerCase() === addressA.toLowerCase());
  const tokenB = tokenList.find((t) => t.address.toLowerCase() === addressB.toLowerCase());

  if(tokenA && tokenB) {
    return [tokenA, tokenB];
  }

  return [];
}

export function useTrackedTokenPairs(): [WrappedToken, WrappedToken][] {
  const { chainId } = useAccount();

  const wrappedTokens = useAllTokens();

  const {userTokens} = useUserTokensStore();

  const wrappedUserTokens = useMemo(() => {
    const tokensForChain = userTokens.filter(t => t.chainId === chainId || 820);
    return tokensForChain.map((t) => {
      return new WrappedToken(
        chainId || 820,
        t.address,
        t.decimals,
        t.symbol,
        t.name,
        t.logoURI
      )
    })
  }, [chainId, userTokens]);

  const tokensForChainId = useMemo(() => {
      return chainId === 820 ? BASES_TO_TRACK_LIQUIDITY_FOR[chainId] : [];
  }, [chainId]);

  const allTokens = useMemo(() => {
    return [...wrappedTokens, ...wrappedUserTokens];
  }, [wrappedTokens, wrappedUserTokens]);

  const generatedPairs: [WrappedToken, WrappedToken][] = useMemo(
    () =>
      chainId
        ? Object.keys(allTokens).flatMap((tokenAddress) => {
          const token = allTokens[+tokenAddress]
          // for each token on the current chain,
          return (
            // loop though all bases on the current chain
            tokensForChainId
              // to construct pairs of the given token with each base
              .map((base) => {
                if (base.address === token.address) {
                  return null
                }
                return [base, token]
              })
              .filter((p): p is [WrappedToken, WrappedToken] => p !== null)
          )
        })
        : [],
    [chainId, allTokens, tokensForChainId],
  )

  const { trackedPools } = useTrackedPools();


  const userPairs = useMemo(() => {
    if (!trackedPools || !chainId || !trackedPools[chainId]) {
      return [];
    }

    return trackedPools[chainId].map(pool => getPairOfWrappedTokensByAddress(pool, chainId, wrappedUserTokens)).filter((p) => p.length) as [WrappedToken, WrappedToken][];
  }, [chainId, trackedPools, wrappedUserTokens]);

  const combinedList = useMemo(
    () => [...userPairs, ...generatedPairs],
    [generatedPairs, userPairs],
  );

  return useMemo(() => {
    const keyed = combinedList.reduce<{ [key: string]: [WrappedToken, WrappedToken] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}
