import { useEffect, useState } from "react";
import {useWeb3} from "../../processes/web3/hooks/useWeb3";

export function useBlockNumber() {
  const [blockNumber, setBlockNumber] = useState<number>();

  const { web3Provider } = useWeb3();

  useEffect(
    () => {
      const updateBlockNumber = (val) => setBlockNumber(val);
      if (web3Provider) {

      (async () => {
          setBlockNumber(await web3Provider.getBlockNumber());
          web3Provider?.on(
            "block",
            updateBlockNumber
          );
      })();
      }

      return () => {
        web3Provider?.removeListener(
          "block",
          updateBlockNumber
        );
      };
    },
    [setBlockNumber, web3Provider]
  );

  return blockNumber;
}
