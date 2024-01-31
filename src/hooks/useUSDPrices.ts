import { useEffect, useMemo, useState } from "react";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";
import farmsInCLO from "@/config/farms/farmsInCLO";
import { FarmConfig } from "@/config/farms/types";
import { IIFE } from "@/other/IIFE";
import { multicall } from "@wagmi/core";
import { config } from "@/config/wagmi/config";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { useSOYPrice } from "@/hooks/useCLOPrice";
import { formatUnits } from "viem";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import { useAccount } from "wagmi";
import { tokenListMap } from "@/components/dialogs/PickTokenDialog";
import { availableChainIds } from "@/config/networks";
import { tokensInEtc } from "@/config/token-lists/tokenlistInETC";
import { tokensInBtt } from "@/config/token-lists/tokenlistInBTT";
import farmsInETC from "@/config/farms/farmsInETC";
import farmsInBTT from "@/config/farms/farmsInBTT";

export default function useUSDPrices() {
  const [usdPrices, setUsdPrices] = useState<{[key: string]: number}>();
  const [pricesWithoutSoy, setPricesWithoutSoy] = useState<{[key: string]: number}>();

  const soyPrice = useSOYPrice();
  const {chainId} = useAccount();

  const tokenList = useMemo(() => {
    if(!chainId || !tokenListMap[chainId]) {
      return tokenListMap[820];
    }

    return tokenListMap[chainId];
  }, [chainId]);

  const coin = useMemo(() => {
    if(!chainId || !nativeTokens[chainId]) {
      return nativeTokens[820]
    }

    return nativeTokens[chainId]
  }, [chainId]);

  const tokens = useMemo(() => {
    if(!chainId || !availableChainIds.includes(chainId)) {
      return tokensInClo;
    }

    if(chainId === 61) {
      return tokensInEtc;
    }

    if(chainId === 199) {
      return tokensInBtt;
    }

    return tokensInClo;

  }, [chainId]);

  const farmsForChain = useMemo(() => {
    if(!chainId || !availableChainIds.includes(chainId)) {
      return farmsInCLO;
    }

    if(chainId === 61) {
      return farmsInETC;
    }

    if(chainId === 199) {
      return farmsInBTT;
    }

    return farmsInCLO;
  }, [chainId])

  useEffect(() => {
    const pools = [...tokenList, coin].map((token) => {
      return farmsForChain.find((pool) => {
        return pool.token.address === token.address && pool.quoteToken.address === tokens.soy.address || pool.quoteToken.address === token.address && pool.token.address === tokens.soy.address
      });
    }).filter((p) => Boolean(p));

    const poolsMap: {[key: string]: FarmConfig} = {};

    for(const pool of pools) {
      if(pool?.token.symbol === "SOY") {
        poolsMap[pool.quoteToken.address] = pool;
      }

      if(pool?.quoteToken.symbol === "SOY") {
        poolsMap[pool.token.address] = pool;
      }
    }

    IIFE(async () => {

      const data = await multicall(config, {
        contracts: Object.values(poolsMap).map((pool) => {
          return {
            abi: LP_TOKEN_ABI,
            address: pool.lpAddress,
            functionName: "getReserves"
          }
        })
      });

      const pricesMap: {[key: string]: number} = {};

      for(let i = 0; i < data.length; i++) {
        const reserves = data[i];
        const pool = Object.values(poolsMap)[i];

        if(reserves.result && Array.isArray(reserves.result)) {
          if(pool.token.symbol === "SOY") {
            pricesMap[pool.quoteToken.address] = Number(formatUnits(reserves.result[0], 18)) / Number(formatUnits(reserves.result[1], pool.quoteToken.decimals));
          }

          if(pool.quoteToken.symbol === "SOY") {
            pricesMap[pool.token.address] = Number(formatUnits(reserves.result[1], 18)) / Number(formatUnits(reserves.result[0], pool.token.decimals));
          }

        }

        setPricesWithoutSoy(pricesMap);
      }
    })
  }, [coin, tokenList, tokens.soy.address]);

  useEffect(() => {
    if(pricesWithoutSoy && soyPrice) {
      for(const key in pricesWithoutSoy) {
        pricesWithoutSoy[key] = pricesWithoutSoy[key] * soyPrice;
      }
      pricesWithoutSoy[tokens.soy.address] = soyPrice;
    }

    setUsdPrices(pricesWithoutSoy);
  }, [pricesWithoutSoy, soyPrice, tokens.soy.address]);

  return usdPrices;
}
