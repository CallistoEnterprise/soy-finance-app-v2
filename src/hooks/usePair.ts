import { WrappedToken } from "@/config/types/WrappedToken";
import { useEffect, useState } from "react";
import { Pair } from "@callisto-enterprise/soy-sdk";
import { useAccount } from "wagmi";
import { IIFE } from "@/other/IIFE";
import { getPairs } from "@/app/[locale]/swap/hooks/useAllowedPairs";

export default function usePair({tokenA, tokenB}: {tokenA: WrappedToken | null, tokenB: WrappedToken | null}) {
  const [pair, setPair] = useState<Pair | null>(null);
  const { chainId } = useAccount();


  useEffect(() => {
    if(tokenA && tokenB && chainId) {
      IIFE(async () => {
        const pairs = await getPairs([[tokenA, tokenB]], chainId)

        if(pairs) {
          setPair(pairs[0]);
        }
      })
    }
  }, [chainId, tokenA, tokenB]);

  return pair;
}
