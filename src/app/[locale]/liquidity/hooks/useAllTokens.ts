import { useAccount, useChainId } from "wagmi";
import { useMemo } from "react";
import { tokenListMap } from "@/components/dialogs/PickTokenDialog";
import { nativeTokens } from "@/config/token-lists/nativeTokens";
import { WrappedToken } from "@/config/types/WrappedToken";

export function useAllTokens(): WrappedToken[] {
  const { chainId } = useAccount();

  return useMemo(() => {
    if (!chainId || !tokenListMap[chainId] || !nativeTokens[chainId]) {
      return [];
    }

    return [nativeTokens[chainId], ...tokenListMap[chainId]];
  }, [chainId]);
}
