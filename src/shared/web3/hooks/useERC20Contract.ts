import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { useWeb3 } from "../../../processes/web3/hooks/useWeb3";
import { IIFE } from "../functions/iife";
import { ERC_20_ABI } from "../../abis";

export function useERC20Contract({address}) {
  const { web3Provider, account } = useWeb3();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if(!web3Provider || !account || !address) {
      return;
    }

    IIFE(async () => {
      const erc20Contract = new Contract(
        address,
        ERC_20_ABI,
        await web3Provider.getSigner(account)
      );

      setContract(erc20Contract);
    });
  }, [account, address, web3Provider])

  return contract;
}
