import {$trackedPools, addTrackedPair, setTrackedPairs} from "./stores";
import {useEvent, useStore} from "effector-react";
import {useCallback, useEffect} from "react";
import {useSnackbar} from "../../shared/providers/SnackbarProvider";

export function useTrackedPools() {
  const trackedPools = useStore($trackedPools);
  const setTrackedPoolsFn = useEvent(setTrackedPairs);
  const addTrackedPoolFn = useEvent(addTrackedPair);

  const {showMessage} = useSnackbar();

  const importPool = useCallback(({chainId, pair, withMessage = true}: {chainId: number | null, pair: [string, string], withMessage?: boolean}) => {
    if(!chainId) {
      return;
    }

    addTrackedPoolFn({chainId, pairToTrack: pair});
    if(withMessage) {
      showMessage("Successfully imported");
    }
  }, [addTrackedPoolFn, showMessage]);

  useEffect(() => {
    if(trackedPools) {
      return;
    }

    const savedTrackedPools = localStorage.getItem("trackedTokenPairs");

    if(!savedTrackedPools) {
      setTrackedPoolsFn({});
      return;
    }

    setTrackedPoolsFn(JSON.parse(savedTrackedPools));
  }, [setTrackedPoolsFn, trackedPools]);

  return {
    trackedPools,
    importPool
  }
}
