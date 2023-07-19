import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import {useEvent, useStore} from "effector-react";
import {$farms, setFarmsForChain} from "./stores";
import {useEffect} from "react";


export function useFarms() {
  const { chainId } = useWeb3();
  const farms = useStore($farms);
  const setFarmsForChainFn = useEvent(setFarmsForChain);

  useEffect(() => {

  }, []);

  return {
    farms: farms[chainId] || [],
    loading: false
  }
}
