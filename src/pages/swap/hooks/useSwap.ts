import {useCallback} from "react";
import {useStore} from "effector-react";
import {$swapInputTokens} from "../../../shared/web3/models/init";

export function useSwap() {
  const {tokenA, tokenB} = useStore($swapInputTokens);

  const handleSwap = useCallback(() => {
    // handle swap here
  }, []);

  return {
    handleSwap
  };
}
