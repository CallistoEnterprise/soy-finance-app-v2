import {useCallback, useEffect, useMemo} from "react";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {BrowserProvider, Contract, ErrorCode, EthersError, parseUnits} from "ethers";
import routerABI from "../../../shared/constants/abis/interfaces/router.json";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEvent, useStore} from "effector-react";
import {$swapDeadline, $swapInputData, $swapSlippage, $trade} from "../models/stores";
import {BigNumber} from "@ethersproject/bignumber";
import useTransactionDeadline from "./useTransactionDeadline";
import {isNativeToken} from "../../../shared/utils";
import {addRecentTransaction} from "../../../shared/models";
import {useAwaitingApproveDialog} from "../../../stores/awaiting-approve-dialog/useAwaitingApproveDialog";
import {resetSwap, setSwapConfirmDialogOpened} from "../models";
import {useReceipt} from "../../../shared/hooks/useReceipt";

export function calculateSlippageAmount(value: BigInt, slippage: number): BigNumber {
  return BigNumber.from(value).mul(995).div(1000);
}

const contracts = {
  bridge: {
    820: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    56: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    1: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    61: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    199: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56",
    137: "0x9a1fc8C0369D49f3040bF49c1490E7006657ea56"
  },
  router: {
    820: "0xeB5B468fAacC6bBdc14c4aacF0eec38ABCCC13e7",
    199: "0x8Cb2e43e5AEB329de592F7e49B6c454649b61929",
    61: "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D"
  }
};

export function useSwapAction() {
  const {chainId, web3Provider, account, walletName} = useWeb3();
  const {showMessage} = useSnackbar();
  const {handleOpen, setAwaitingApproveDialogInfo, setSubmitted, handleClose, setSubmittedInfo} = useAwaitingApproveDialog();
  const setSwapConfirmDialogOpenedFn = useEvent(setSwapConfirmDialogOpened);

  const resetSwapFn = useEvent(resetSwap);

  useEffect(() => {
    resetSwapFn();
  }, [chainId, resetSwapFn]);

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );
  const swapDeadline = useStore($swapDeadline);
  const deadline = useTransactionDeadline(swapDeadline);

  const swapInputData = useStore($swapInputData)

  const trade = useStore($trade);

  const functionName = useMemo(() => {
    if(swapInputData.tokenFrom && isNativeToken(swapInputData.tokenFrom?.address)) {
      return "swapExactCLOForTokens";
    }

    if(swapInputData.tokenTo && isNativeToken(swapInputData.tokenTo?.address)) {
      return "swapExactTokensForCLO";
    }

    return "swapExactTokensForTokens";
  }, [swapInputData.tokenTo, swapInputData.tokenFrom]);

  const slippage = useStore($swapSlippage);

  const {wait} = useReceipt();

  const handleSwap = useCallback(
    async () => {
      setSwapConfirmDialogOpenedFn(false);

      if(!account || !web3Provider || !trade || !swapInputData.tokenFrom || !swapInputData.tokenTo || !chainId || !walletName) {
        showMessage("Not enough data", "error");
        return;
      }

      setSubmitted(false);
      handleOpen();
      setAwaitingApproveDialogInfo({
        subheading: `Swap ${swapInputData.amountIn} ${swapInputData.tokenFrom.symbol} to ${swapInputData.amountOut} ${swapInputData.tokenTo.symbol}`,
        wallet: walletName
      });

      try {
        const contract = new Contract(
          bridgeAddress,
          routerABI,
          await web3Provider.getSigner(account)
        );

        const _parsedAmountIn = parseUnits(
          swapInputData.amountIn.toString(),
          swapInputData.tokenFrom?.decimals
        );

        const _path = trade.route.path.map((token) => {
          return token.address;
        });

        const _amountOut = await contract["getAmountsOut"](
          _parsedAmountIn,
          _path
        );

        const _amountOutWithSlippage = calculateSlippageAmount(
          _amountOut[_amountOut.length - 1],
          slippage
        );

        const args: any = [
          _amountOutWithSlippage._hex,
          _path,
          account,
          deadline
        ];

        if (!isNativeToken(swapInputData.tokenFrom.address)) {
          args.unshift(BigNumber.from(_parsedAmountIn)._hex);
          args.push({
            from: account,
            value: 0
          });
        } else {
          args.push({
            from: account,
            value: _parsedAmountIn
          });
        }

        const _estimatedGas = await contract[functionName]["estimateGas"](...args);

        args[args.length - 1]["gasLimit"] = BigNumber.from(_estimatedGas)._hex;


        const tx = await contract[functionName](...args);

        setSubmitted(true);
        setSubmittedInfo({
          operation: "transaction",
          hash: tx.hash,
          chainId
        });

        wait({tx, chainId, summary: `Swap ${(+swapInputData.amountIn).toLocaleString('en-US', {maximumFractionDigits: 6})} ${swapInputData.tokenFrom.symbol} to ${(+swapInputData.amountOut).toLocaleString('en-US', {maximumFractionDigits: 6})} ${swapInputData.tokenTo.symbol}`});

        return tx;
      } catch (error: EthersError) {
        handleClose();
        if(error.code === "ACTION_REJECTED") {
          showMessage(
            "Action was rejected",
            "error"
          );
        } else {
          console.log(error);
          showMessage(
            "Something went wrong, please try again later",
            "error"
          );
        }
      }
    },
    [setSwapConfirmDialogOpenedFn, account, web3Provider, trade, swapInputData.tokenFrom, swapInputData.tokenTo, swapInputData.amountIn, swapInputData.amountOut, chainId, walletName, setSubmitted, handleOpen, setAwaitingApproveDialogInfo, showMessage, bridgeAddress, slippage, deadline, functionName, setSubmittedInfo, wait, handleClose]
  );

  return { handleSwap };
}
