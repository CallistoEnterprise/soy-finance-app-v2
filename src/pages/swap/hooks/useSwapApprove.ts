import { useCallback, useEffect, useState } from "react";
import { ChainId } from "@callisto-enterprise/soy-sdk";
import {Contract, MaxInt256, parseEther} from "ethers";
import { useEvent, useStore } from "effector-react";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {isNativeToken} from "../../../shared/utils";
import {SwapToken} from "../models/types";
import {$swapInputData, $tokenSpendApproved, $tokenSpendEnabling, $tokenSpendRequesting} from "../models/stores";
import {setTokenSpendApproved, setTokenSpendEnabling, setTokenSpendRequesting} from "../models";
import WETH_ABI from "../../../shared/abis/interfaces/weth.json";
import {addRecentTransaction, editTransactionStatus} from "../../../shared/models";
import {WrappedTokenInfo} from "./useTrade";


const ROUTER_ADDRESS = {
  [ChainId.MAINNET]: "0xeB5B468fAacC6bBdc14c4aacF0eec38ABCCC13e7",
  [ChainId.CLOTESTNET]: "0xdbe46b17FFd35D6865b69F9398AC5454389BF38c",
  [ChainId.BTTMAINNET]: "0x8Cb2e43e5AEB329de592F7e49B6c454649b61929",
  [ChainId.BSC]: "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D",
  [ChainId.ETCCLASSICMAINNET]: "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D",
  [ChainId.ETHEREUM]: ""
};

function useTokenAllowance(approved: boolean, token?: string): any | undefined {
  const { web3Provider, isSupportedSwapNetwork, isChangingWallet, isChangingNetwork, chainId, account } = useWeb3();
  const [allowance, setAllowance] = useState(0);

  useEffect(
    () => {
      if (!token || isChangingWallet || isChangingNetwork) {
        return;
      }

      const inputs = [
        account,
        ROUTER_ADDRESS[chainId ?? 820]
      ];

      const contract = new Contract(
        token,
        WETH_ABI,
        web3Provider
      );


      (async () => {
        if (isSupportedSwapNetwork) {

          if (isNativeToken(token)) {
            return;
          }


          try {
            const _allowance = await contract["allowance"](...inputs);

            setAllowance(_allowance);
          } catch (e) {
            console.log(e);
          }

        }
      })();


    },
    [token, web3Provider, approved, isSupportedSwapNetwork, isChangingWallet, isChangingNetwork, account, chainId]
  );

  return { allowance };
}

export function useSwapApprove({ token, amount }: {token: WrappedTokenInfo | null, amount: string}) {
  const { account, chainId, web3Provider, isSupportedSwapNetwork, isChangingWallet, isChangingNetwork } = useWeb3();

  const approved = useStore($tokenSpendApproved);
  const enabling = useStore($tokenSpendEnabling);
  const requesting = useStore($tokenSpendRequesting);

  const setApproved = useEvent(setTokenSpendApproved);
  const setEnabling = useEvent(setTokenSpendEnabling);
  const setRequesting = useEvent(setTokenSpendRequesting);

  const currentAllowance = useTokenAllowance(
    approved,
    token?.address
  );

  const addRecentTransactionFn = useEvent(addRecentTransaction);
  const editTransactionStatusFn = useEvent(editTransactionStatus);

  useEffect(
    () => {
      if (!isSupportedSwapNetwork || isChangingWallet || isChangingNetwork || !token) {
        return;
      }

      if (isNativeToken(token.address)) {
        setApproved(true);
        return;
      }

      if (+amount && currentAllowance?.allowance >= BigInt(parseEther((+amount).toString()))) {
        setApproved(true);
      } else {
        setApproved(false);
      }
    },
    [currentAllowance, currentAllowance?.allowance, isChangingNetwork, isChangingWallet, isSupportedSwapNetwork, setApproved, token, amount]
  );


  const handleApprove = useCallback(
    async () => {
      if(!web3Provider || !account || !token || !chainId) {
        return;
      }

      if (token.address !== "") {
        setRequesting(true);
        const routerAddr = ROUTER_ADDRESS[chainId];
        const tkContract = new Contract(
          token.address,
          WETH_ABI,
          await web3Provider.getSigner(account)
        );
        try {
          const tx = await tkContract["approve"](
            routerAddr,
            MaxInt256,
            { value: 0 }
          );
          setRequesting(false);
          setEnabling(true);
          addRecentTransactionFn({chainId, hash: tx.hash, summary: `Approve ${token.symbol}`})

          const receipt = await tx.wait();

          editTransactionStatusFn({chainId, status: "succeed", hash: tx.hash});

          setApproved(true);
          return receipt.status;
        } catch (e) {
          console.log(e);
        } finally {
          setRequesting(false);
          setEnabling(false);
        }

      }
    },
    [web3Provider, account, token, chainId, setRequesting, setEnabling, addRecentTransactionFn, editTransactionStatusFn, setApproved]
  );

  return {
    approved,
    handleApprove,
    enabling,
    requesting
  };
}
