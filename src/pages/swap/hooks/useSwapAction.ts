import {useCallback, useMemo} from "react";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {BrowserProvider, Contract, ErrorCode, EthersError, parseUnits} from "ethers";
import routerABI from "../../../shared/abis/router.json";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEvent, useStore} from "effector-react";
import {$swapDeadline, $swapInputData, $swapSlippage, $trade} from "../models/stores";
import {BigNumber} from "@ethersproject/bignumber";
import useTransactionDeadline from "./useTransactionDeadline";
import {isNativeToken} from "../../../shared/utils";
import {err} from "pino-std-serializers";
import {addRecentTransaction} from "../../../shared/models";

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

async function setTransactionFinished(hash: string) {
  const currentTransactions = localStorage.getItem("recentTransactions");

  if(currentTransactions) {
    const updatedValue = JSON.parse(currentTransactions);

    updatedValue[hash]["status"] = "completed";

    localStorage.setItem(
      "recentTransactions",
      JSON.stringify(updatedValue)
    );
  }
}

async function awaitTransaction(hash: string, provider: BrowserProvider) {
  const receipt = await provider.getTransactionReceipt(hash);

  if(!receipt) {
    const transaction = await provider.getTransaction(hash);
    const _receipt = await transaction?.wait();

    if(_receipt) {
      setTransactionFinished(hash)
    }
  }
}

async function logWhenAwaited(tx, provider: BrowserProvider) {
  try {
    const beforeEnd = await provider.getTransactionReceipt(tx.hash);
    console.log("BEFORE END");
    console.log(beforeEnd);
    const transaction = await provider.getTransaction(tx.hash);

    if(transaction) {
      console.log(transaction);
      const receipt = await transaction.wait();
      console.log("Tx finished");
      console.log(receipt);
    }

    // const receipt = await tx.wait();

    // console.log(receipt);

    const afterEnd = await provider.getTransactionReceipt(tx.hash);
    console.log(afterEnd);
  } catch (e) {

  }
}

export function useSwapAction() {
  const {chainId, web3Provider, account} = useWeb3();
  const {showMessage} = useSnackbar();

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );
  const swapDeadline = useStore($swapDeadline);
  const deadline = useTransactionDeadline(swapDeadline);

  const swapInputData = useStore($swapInputData)

  const trade = useStore($trade);

  const functionName = useMemo(() => {
    if(swapInputData.tokenFrom && isNativeToken(swapInputData.tokenFrom?.token_address)) {
      return "swapExactCLOForTokens";
    }

    if(swapInputData.tokenTo && isNativeToken(swapInputData.tokenTo?.token_address)) {
      return "swapExactTokensForCLO";
    }

    return "swapExactTokensForTokens";
  }, [swapInputData.tokenTo, swapInputData.tokenFrom, swapInputData.amountIn]);

  const slippage = useStore($swapSlippage);

  const addRecentTransactionFn = useEvent(addRecentTransaction);

  const handleSwap = useCallback(
    async () => {
      if(!account || !web3Provider || !trade || !swapInputData.tokenFrom || !swapInputData.tokenTo || !chainId) {
        return;
      }

      try {
        const contract = new Contract(
          bridgeAddress,
          routerABI,
          await web3Provider.getSigner(account)
        );

        const _parsedAmountIn = parseUnits(
          swapInputData.amountIn.toString(),
          swapInputData.tokenFrom?.decimal_token
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

        if (!isNativeToken(swapInputData.tokenFrom.token_address)) {
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

        addRecentTransactionFn({chainId, hash: tx.hash, summary: `Swap ${swapInputData.amountIn} ${swapInputData.tokenFrom.original_name} to ${swapInputData.amountOut} ${swapInputData.tokenTo.original_name}`})

        return tx;
      } catch (error: EthersError) {

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
    [web3Provider, account, trade]
  );

  return { handleSwap };
}