import {useMemo} from "react";
import {Contract} from "ethers";
import WETH_ABI from "../../abis/interfaces/weth.json";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";

const routerAddresses = {
  820: "0xeB5B468fAacC6bBdc14c4aacF0eec38ABCCC13e7",
  199: "0x8Cb2e43e5AEB329de592F7e49B6c454649b61929",
  61: "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D"
}

export function useRouterContract() {
  const {web3Provider, account, chainId} = useWeb3();

  return useMemo(async () => {
    const address = routerAddresses[chainId];

    if (!web3Provider || !account || !chainId || !address) {
      return null;
    }

    return new Contract(
      address,
      WETH_ABI,
      web3Provider
    );
  }, [account, chainId, web3Provider]);
}
