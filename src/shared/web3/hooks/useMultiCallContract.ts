import {useMemo} from "react";
import {Contract} from "ethers";
import MULTICALL_ABI from "../../abis/interfaces/multicall.json";
import {MULTICALL_NETWORKS} from "../../../pages/swap/hooks/useTrade";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";

export function useMultiCallContract() {
  const {chainId, web3Provider} = useWeb3();

  return useMemo(() => {
    return chainId && web3Provider ? new Contract(
      MULTICALL_NETWORKS[chainId],
      MULTICALL_ABI,
      web3Provider
    ) : null;
  }, [chainId, web3Provider]);
}
