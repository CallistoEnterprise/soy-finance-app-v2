import {TokenAmount} from "@callisto-enterprise/soy-sdk";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useCallback, useEffect, useMemo, useState} from "react";
import {isNativeToken} from "../../../../shared/utils";
import {Contract, MaxInt256, parseUnits} from "ethers";
import WETH_ABI from "../../../../shared/abis/interfaces/weth.json";
import {ROUTER_ADDRESS} from "../../../../shared/web3/contracts";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {ERC_20_ABI} from "../../../../shared/abis";

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

function useTokenAllowance(token: WrappedTokenInfo | null, pendingApproval: boolean): TokenAmount | null {
  const { web3Provider, isSupportedSwapNetwork, isChangingWallet, isChangingNetwork, chainId, account } = useWeb3();
  const [allowance, setAllowance] = useState<TokenAmount | null>(null);

  useEffect(
    () => {
      if (!token || isChangingWallet || isChangingNetwork || !account || pendingApproval) {
        return;
      }

      const inputs = [
        account,
        ROUTER_ADDRESS[chainId ?? 820]
      ];

      const contract = new Contract(
        token.address,
        ERC_20_ABI,
        web3Provider
      );


      (async () => {
        if (isSupportedSwapNetwork) {

          if (isNativeToken(token)) {
            return;
          }


          try {
            const _allowance = await contract["allowance"](...inputs);

            setAllowance(new TokenAmount(token, _allowance.toString()));
          } catch (e) {
            console.log(e);
          }

        }
      })();


    },
    [token, web3Provider, isSupportedSwapNetwork, isChangingWallet, isChangingNetwork, account, chainId, pendingApproval]
  );

  return allowance;
}


export function useApproveCallback(
  token: WrappedTokenInfo | null,
  amountToApprove: string,
): [ApprovalState, () => Promise<void>] {
  const { account, chainId, web3Provider } = useWeb3();
  const [pendingApproval, setPendingApproval] = useState(false);

  const currentAllowance = useTokenAllowance(token, pendingApproval);

  // const pendingApproval = useHasPendingApproval(token?.address, spender)
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !token) return ApprovalState.UNKNOWN
    if (isNativeToken(token?.address)) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    if(pendingApproval) {
      return ApprovalState.PENDING
    }

    const tokenAmount = new TokenAmount(token, parseUnits(amountToApprove, token.decimals));
    console.log("CURRENT ALLOWANCE");
    console.log(currentAllowance);

    if (!+amountToApprove || tokenAmount.greaterThan(currentAllowance)) {
      return ApprovalState.NOT_APPROVED
    } else {
      return ApprovalState.APPROVED
    }
  }, [amountToApprove, token, currentAllowance, pendingApproval])

  const handleApprove = useCallback(
    async () => {
      if(!web3Provider || !account || !token || !chainId) {
        return;
      }

      if (token.address !== "") {
        setPendingApproval(true);
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
          // addRecentTransactionFn({chainId, hash: tx.hash, summary: `Approve ${token.symbol}`})

          const receipt = await tx.wait();

          // editTransactionStatusFn({chainId, status: "succeed", hash: tx.hash});

          console.log(receipt);
          // setApproved(true);
          return receipt.status;
        } catch (e) {
          console.log(e);
        } finally {
          setPendingApproval(false);
        }

      }
    },
    [web3Provider, account, token, chainId]
  );


  return [approvalState, handleApprove]
}
