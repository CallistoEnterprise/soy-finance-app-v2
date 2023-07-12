import {useMemo} from "react";
import {Contract, JsonRpcProvider} from "ethers";
import MULTICALL_ABI from "../../constants/abis/interfaces/multicall.json";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {MULTICALL_NETWORKS} from "../../../pages/swap/functions";

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

export function useMultiCallJSONRpcContract() {
  const provider = useMemo(() => {
    return new JsonRpcProvider("https://rpc.callisto.network/")
  }, []);

  return useMemo(() => {
    return new Contract(
      MULTICALL_NETWORKS["820"],
      MULTICALL_ABI,
      provider
    );
  }, [provider]);
}
