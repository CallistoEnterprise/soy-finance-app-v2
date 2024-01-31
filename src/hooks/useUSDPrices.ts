import { useEffect, useState } from "react";
import { tokenListInCLO, tokensInClo } from "@/config/token-lists/tokenListInCLO";
import farmsInCLO from "@/config/farms/farmsInCLO";
import { FarmConfig } from "@/config/farms/types";
import { IIFE } from "@/other/IIFE";
import { multicall } from "@wagmi/core";
import { config } from "@/config/wagmi/config";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { useSOYPrice } from "@/hooks/useCLOPrice";
import { formatUnits } from "viem";
import { nativeTokens } from "@/config/token-lists/nativeTokens";

export default function useUSDPrices() {
  const [usdPrices, setUsdPrices] = useState<{[key: string]: number}>();
  const [pricesWithoutSoy, setPricesWithoutSoy] = useState<{[key: string]: number}>();

  const soyPrice = useSOYPrice();

  useEffect(() => {
    const pools = [...tokenListInCLO, nativeTokens[820]].map((token) => {
      return farmsInCLO.find((pool) => {
        return pool.token.address === token.address && pool.quoteToken.address === tokensInClo.soy.address || pool.quoteToken.address === token.address && pool.token.address === tokensInClo.soy.address
      });
    }).filter((p) => Boolean(p));

    console.log("POOLS");
    console.log(pools);

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
  }, []);

  useEffect(() => {
    if(pricesWithoutSoy && soyPrice) {
      for(const key in pricesWithoutSoy) {
        pricesWithoutSoy[key] = pricesWithoutSoy[key] * soyPrice;
      }
      pricesWithoutSoy[tokensInClo.soy.address] = soyPrice;
    }

    setUsdPrices(pricesWithoutSoy);
  }, [pricesWithoutSoy, soyPrice]);

  return usdPrices;
}
