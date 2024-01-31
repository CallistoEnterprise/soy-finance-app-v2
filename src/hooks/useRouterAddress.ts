import { useAccount } from "wagmi";
import { useMemo } from "react";
import { ROUTER_ADDRESS } from "@/config/addresses/router";

export default function useRouterAddress() {
  const { chainId } = useAccount();

  return useMemo(
    () => chainId ? ROUTER_ADDRESS[chainId] : undefined,
    [chainId]
  );
}
