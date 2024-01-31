import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { Address } from "viem";
import { useEffect, useMemo } from "react";
import { isNativeToken } from "@/other/isNativeToken";

export default function useEnoughBalance({tokenAddress, amountToCheck}: {tokenAddress: Address | undefined, amountToCheck: bigint | null}) {
  const {address} = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data, refetch } = useBalance({
    address: tokenAddress ? address : undefined,
    token: tokenAddress
      ? isNativeToken(tokenAddress)
        ? undefined
        : tokenAddress as `0x${string}`
      : undefined,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  return useMemo(() => {
    if(!data || !amountToCheck) {
      return false;
    }

    return data.value >= amountToCheck;
  }, [amountToCheck, data]);
}
