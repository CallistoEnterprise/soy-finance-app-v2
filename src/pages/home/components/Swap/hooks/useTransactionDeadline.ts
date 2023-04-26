import {useEffect, useMemo, useState} from "react";
import {useWeb3} from "../../../../../processes/web3/hooks/useWeb3";
import {useBlockNumber} from "../../../../../shared/hooks/useBlockNumber";
import {BigNumber} from "@ethersproject/bignumber";

export default function useTransactionDeadline(userDeadline): BigNumber | undefined {
  const ttl = userDeadline * 60;
  const { chainId, web3Provider } = useWeb3();
  const [blockTs, setBlockTs] = useState<BigNumber>(null);

  const currentBlock = useBlockNumber();

  useEffect(
    () => {
      if(!web3Provider) {
        return;
      }

      (async () => {
          const block = await web3Provider?.getBlock(+currentBlock);

          if (block) {
            setBlockTs(BigNumber.from(block.timestamp));
          }
        }
      )();
    },
    [chainId, currentBlock]
  );


  return useMemo(
    () => {
      return blockTs + ttl;
    },
    [blockTs, ttl]
  );
}
