import {useEffect, useMemo, useState} from "react";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useBlockNumber} from "../../../shared/hooks/useBlockNumber";

export default function useTransactionDeadline(userDeadline): number | undefined {
  const ttl = userDeadline * 60;
  const { chainId, web3Provider } = useWeb3();
  const [blockTs, setBlockTs] = useState<number>(null);

  const currentBlock = useBlockNumber();

  useEffect(
    () => {
      if(!web3Provider || !currentBlock) {
        return;
      }

      (async () => {
          const block = await web3Provider.getBlock("latest");

          if (block) {
            setBlockTs(block.timestamp);
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
