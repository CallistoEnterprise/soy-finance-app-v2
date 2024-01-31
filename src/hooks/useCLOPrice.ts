import farmsInCLO from "@/config/farms/farmsInCLO";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { IIFE } from "@/other/IIFE";

export default function useCLOPrice() {
  const [price, setPrice] = useState<number | null>(null);

  const farm = useMemo(() => {
    return farmsInCLO.find((f) => {
      return f.pid === 43
    });
  }, []);

  const publicClient = usePublicClient();

  useEffect(() => {
    // console.log("HERES EFFECT");
    if(!farm) {
      return;
    }

    IIFE(async () => {
      const result = await publicClient.readContract({
        abi: LP_TOKEN_ABI,
        functionName: "getReserves",
        address: farm.lpAddress
      });

      // console.log("RESULT RESERVES");
      // console.log(result);
      const _price = Number(result[0]) / Number(result[1]);
      // console.log(_price);
      setPrice(_price);

    });
  }, [farm, publicClient]);

  return price;
}

export function useSOYPrice() {
  const [price, setPrice] = useState<number | null>(null);

  const farm = useMemo(() => {
    return farmsInCLO.find((f) => {
      return f.pid === 44
    });
  }, []);

  const publicClient = usePublicClient();

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

export function useRACAPrice() {
  const [price, setPrice] = useState<number | null>(null);

  const farm = useMemo(() => {
    return farmsInCLO.find((f) => {
      return f.pid === 25
    });
  }, []);

  const soyPrice = useSOYPrice();

  const publicClient = usePublicClient();

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

      // console.log("RESULT RESERVES");
      // console.log(result);
      const _price = Number(result[0]) / Number(result[1]);
      // console.log(Number(result[0]));
      // console.log(Number(result[1]));
      // console.log(_price)
      setPrice(_price);
    });
  }, [farm, publicClient]);

  return price && soyPrice ? price * soyPrice : "Loading...";
}
