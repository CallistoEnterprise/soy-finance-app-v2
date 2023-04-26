import {useCallback, useMemo} from "react";
import {useSnackbar} from "../../../../../shared/providers/SnackbarProvider";
import {parseUnits} from "ethers";
import routerABI from "../../../../../shared/abis/router.json";
import {useWeb3} from "../../../../../processes/web3/hooks/useWeb3";
import {useStore} from "effector-react";
import {$swapInputData, $trade} from "../models/stores";
import {BigNumber} from "@ethersproject/bignumber";
import {Contract} from "@ethersproject/contracts";


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
  const {chainId, web3Provider, account, provider} = useWeb3();
  const {showMessage} = useSnackbar();

  const bridgeAddress = useMemo(
    () => contracts.router[chainId],
    [chainId]
  );
  const deadline = 1682473091;


  const swapInputData = useStore($swapInputData)

  const trade = useStore($trade);

  const handleSwap = useCallback(
    async () => {
      if(!account || !web3Provider || !trade) {
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

        console.log("AMOUNT OUT");
        console.log( _amountOut[_amountOut.length - 1]);

        const _amountOutWithSlippage = calculateSlippageAmount(
          _amountOut[_amountOut.length - 1],
          0.5
        );

        const args: any = [
          _amountOutWithSlippage._hex,
          _path,
          account,
          deadline
        ];

        args.unshift(BigNumber.from(_parsedAmountIn)._hex);
        args.push({
          from: account,
          value: 0
        });

        console.log(1);
        console.log(args);
        // const _args = [...args];
        //
        console.log(2);
        const _estimatedGas = await contract["estimateGas"]["swapExactTokensForTokens"](...args);

        console.log(3);
        console.log(_estimatedGas);
        args[args.length - 1]["gasLimit"] = BigNumber.from(_estimatedGas)._hex;
        console.log("Staaart");
        const tx = await contract["swapExactTokensForTokens"](...args);
        console.log("END D:");

        // saveSwapTransaction({
        //   from: swapTokens.input.original_name,
        //   to: swapTokens.output.original_name,
        //   amountIn: amountIn,
        //   amountOut: estimatedOut,
        //   hash: tx.hash,
        //   setRecentTransactionsToState: setRecentSwapTransactionsFn
        // });

        console.log(tx);

        return tx;
      } catch (e) {
        if (e.message) {
          showMessage(
            e.message,
            "error"
          );
        }
      }
    },
    [web3Provider, account, trade]
  );

  return { handleSwap };
}
