import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { useEvent, useStore } from "effector-react";
import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import {$blockNumber} from "../../processes/web3/models/stores";
import {setBlockNumber} from "../../processes/web3/models";
import {BrowserProvider} from "ethers";
import {IIFE} from "../web3/functions/iife";
import * as throttle from 'lodash.throttle';


export function useBlockNumber() {
  const blockNumber = useStore($blockNumber);
  const setBlockNumberFn = useEvent(setBlockNumber);
  const chainIdRef = useRef<number | null>(null);
  const { web3Provider, chainId } = useWeb3();

  const throttled = useMemo(() => {
    return throttle(setBlockNumberFn, 2000);
  }, [setBlockNumberFn]);

  useEffect(
    () => {
      const onBlockNumber = (val) => {
        throttled(val);
      }

      const updateBlockNumber = async () => {
        const blockNumber = await web3Provider?.getBlockNumber();
        throttled(blockNumber);
      }

      IIFE(async () => {
        if(chainIdRef.current !== chainId && web3Provider instanceof BrowserProvider) {
          chainIdRef.current = chainId;
          await web3Provider.off(
            "block",
            onBlockNumber
          );

          await updateBlockNumber();

          await web3Provider.on(
            "block",
            onBlockNumber
          );
        }
      });



      return () => {
        if (web3Provider instanceof BrowserProvider) {
          web3Provider.off(
            "block",
            onBlockNumber
          );
        }
      };
    },
    [chainId, setBlockNumberFn, throttled, web3Provider]
  );

  return blockNumber;
}
