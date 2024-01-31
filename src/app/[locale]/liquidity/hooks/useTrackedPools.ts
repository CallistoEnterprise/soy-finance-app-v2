import { useCallback } from "react";
import { useTrackedPoolsStore } from "@/app/[locale]/liquidity/stores/useTrackedPoolsStore";
import addToast from "@/other/toast";

export function useTrackedPools() {
  const {
    trackedPools,
    addTrackedPool
  } = useTrackedPoolsStore();

  const importPool = useCallback(({ chainId, pair, withMessage = true }: { chainId: number | null, pair: [string, string], withMessage?: boolean }) => {
    if (!chainId) {
      return;
    }

    addTrackedPool({ chainId, pairToTrack: pair });
    if (withMessage) {
      addToast("Successfully imported");
    }
  }, [addTrackedPool]);

  return {
    trackedPools,
    importPool
  }
}
