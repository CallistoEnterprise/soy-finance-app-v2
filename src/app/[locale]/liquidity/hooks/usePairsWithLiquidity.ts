import { usePairsWithLiquidityStore } from "@/app/[locale]/liquidity/stores/usePairsWithLiquidityStore";
import { useAccount, useChainId } from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pair, Token, TokenAmount } from "@callisto-enterprise/soy-sdk";
import { isAddress } from "viem";
import { useTrackedTokenPairs } from "@/app/[locale]/liquidity/hooks/useTrackedTokenPairs";
import { IIFE } from "@/other/IIFE";
import { multicall } from "@wagmi/core";
import { ERC20_ABI } from "@/config/abis/erc20";
import { getPairs } from "@/app/[locale]/swap/hooks/useAllowedPairs";
import { config } from "@/config/wagmi/config";

export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, 'SOY-LP', 'soyfinance LPs')
}

export function usePairBalances({addresses, pairs, validatedTokens}: {addresses: string[], pairs: any, validatedTokens: any}) {
  const [pairBalances, setPairBalances] = useState<any>([]);
  const {address: account} = useAccount();

  useEffect(() => {
    IIFE(async () => {
      const contracts = addresses.map((address) => {
        return {
          abi: ERC20_ABI,
          address: address as `0x${string}`,
          functionName: "balanceOf",
          args: [account]
        }
      });

      const data = await multicall(config,{
        contracts,
      });

      const ldd = validatedTokens.reduce((memo: {[key: string]: TokenAmount}, token: Token, i: number) => {
          const value = data[i].result as bigint;
          if (value) {
            memo[token.address] = new TokenAmount(token, value)
          }
          return memo
      }, {});

      setPairBalances(ldd);
    });

  }, [account, addresses, validatedTokens]);

  return pairBalances;
}
export function usePairsWithLiquidity(): {pairsWithLiquidity: Pair[], loading: boolean} {
  const {
    pairsWithLiquidity,
    pairsWithLiquidityLoading,
    setPairsWithLiquidity,
    setPairsWithLiquidityLoading
  } = usePairsWithLiquidityStore();
  const trackedTokenPairs = useTrackedTokenPairs();

  const { chainId } = useAccount();

  const tokenPairsWithLiquidityTokens = useMemo(
    () => {
      return trackedTokenPairs.map((tokens) => ({liquidityToken: toV2LiquidityToken(tokens), tokens}));
    }, [trackedTokenPairs]
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const validatedTokens: Token[] = useMemo(
    () => liquidityTokens.filter((t: Token): t is Token => isAddress(t.address) !== false) ?? [],
    [liquidityTokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const pairBalances = usePairBalances({ addresses: validatedTokenAddresses, pairs: pairsWithLiquidity, validatedTokens });

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({liquidityToken}) =>
        // @ts-ignore
        pairBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, pairBalances],
  );


  const mapped = useMemo(() => {
    return liquidityTokensWithBalances.map(({tokens}) => tokens)
  }, [liquidityTokensWithBalances]);


  const ps = useMemo(async () => {
    if(!chainId) {
      return [];
    }

    const v2Pairs = await getPairs(mapped, chainId);

    if(!v2Pairs) {
      return [];
    }

    return v2Pairs.filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));
  }, [chainId, mapped]);

  const pairsRef = useRef(pairsWithLiquidity);

  useEffect(() => {
    pairsRef.current = pairsWithLiquidity;
  }, [pairsWithLiquidity]);

  useEffect(() => {
    if(!chainId) {
      return;
    }
    IIFE(async () => {
      const ps1 = await ps;

      if (ps1.length) {
        setPairsWithLiquidity(ps1);
      }

      if (!ps1.length && !pairsRef.current.length) {
        setPairsWithLiquidity([]);
      }
    })



    const t = setTimeout(() => {
      setPairsWithLiquidityLoading(false);
    }, 1000);

    return () => {
      clearTimeout(t);
    }
  }, [chainId, ps, setPairsWithLiquidity, setPairsWithLiquidityLoading, trackedTokenPairs])

  return {
    pairsWithLiquidity,
    loading: pairsWithLiquidityLoading
  }
}
