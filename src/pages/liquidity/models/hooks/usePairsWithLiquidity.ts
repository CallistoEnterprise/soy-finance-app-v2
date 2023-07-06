import {useEvent, useStore} from "effector-react";
import {$pairsWithLiquidity} from "../stores";
import {useEffect, useMemo, useRef} from "react";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {Pair, Token} from "@callisto-enterprise/soy-sdk";
import {isAddress} from "ethers";
import {usePairs} from "../../../../shared/hooks/usePairs";
import {toV2LiquidityToken, usePairBalances, useTrackedTokenPairs} from "../../components/YourLiquidity/YourLiquidity";
import {setPairsWithLiquidity, setPairsWithLiquidityLoading} from "../index";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";

export function usePairsWithLiquidity(): {pairsWithLiquidity: Pair[], loading: boolean} {
  const {pairs, loading} = useStore($pairsWithLiquidity);
  const trackedTokenPairs = useTrackedTokenPairs();

  const {chainId} = useWeb3();

  console.log("TRACKED PAIRS");
  console.log(trackedTokenPairs);

  const setPairsWithLiquidityFn = useEvent(setPairsWithLiquidity);
  const setPairsWithLiquidityLoadingFn = useEvent(setPairsWithLiquidityLoading);

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({liquidityToken: toV2LiquidityToken(tokens), tokens})),
    [trackedTokenPairs],
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const validatedTokens: WrappedTokenInfo[] = useMemo(
    () => liquidityTokens.filter((t?: Token): t is WrappedTokenInfo => isAddress(t?.address) !== false) ?? [],
    [liquidityTokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const pairBalances = usePairBalances(trackedTokenPairs, validatedTokenAddresses, validatedTokens);

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({liquidityToken}) =>
        pairBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, pairBalances],
  );

  const mapped = useMemo(() => {
    return liquidityTokensWithBalances.map(({tokens}) => tokens)
  }, [liquidityTokensWithBalances]);

  const v2Pairs = usePairs(mapped);

  const ps = useMemo(() => {
    if(!v2Pairs) {
      return [];
    }

    return v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));
  }, [v2Pairs]);

  const pairsRef = useRef(pairs);

  useEffect(() => {
    pairsRef.current = pairs;
  }, [pairs]);

  useEffect(() => {
    if(!chainId) {
      return;
    }

    if (ps.length && !pairsRef.current.length) {
      setPairsWithLiquidityFn(ps);
    }

    if (!ps.length && !pairsRef.current.length) {
      setPairsWithLiquidityFn([]);
    }

    const t = setTimeout(() => {
      setPairsWithLiquidityLoadingFn(false);
    }, 1000);

    return () => {
      clearTimeout(t);
    }
  }, [chainId, ps, setPairsWithLiquidityFn, setPairsWithLiquidityLoadingFn, trackedTokenPairs, v2Pairs])

  return {
    pairsWithLiquidity: pairs,
    loading
  }
}
