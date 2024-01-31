import farmsInCLO from "@/config/farms/farmsInCLO";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { IIFE } from "@/other/IIFE";

export function useSOYPrice() {
  const [price, setPrice] = useState<number | null>(null);

  const farm = useMemo(() => {
    return farmsInCLO.find((f) => {
      return f.pid === 44
    });
  }, []);

  const publicClient = usePublicClient({chainId: 820});

  useEffect(() => {
    if(!farm) {
      return;
    }

    IIFE(async () => {
      const result = await publicClient.readContract({
        abi: LP_TOKEN_ABI,
        functionName: "getReserves",
        address: farm.lpAddress
      });

      const _price = Number(result[1]) / Number(result[0]);
      setPrice(_price);
    });
  }, [farm, publicClient]);

  return price;
}
