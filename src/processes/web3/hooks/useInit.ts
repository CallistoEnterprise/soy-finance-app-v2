import { useEffect } from "react";
import { useEvent } from "effector-react";
import { setWc2Blockchains } from "../models";
import {SUPPORTED_SWAP_NETWORKS} from "../constants/supportedNetworks";

export function useInit() {
  const setWc2BlockchainsFn = useEvent(setWc2Blockchains);

  useEffect(() => {
    const chainList = localStorage.getItem("wcChainList");

    if(!chainList) {
      localStorage.setItem("wcChainList", JSON.stringify(SUPPORTED_SWAP_NETWORKS));
      setWc2BlockchainsFn(SUPPORTED_SWAP_NETWORKS);
    } else {
      setWc2BlockchainsFn(JSON.parse(chainList));
    }
  }, []);
}
