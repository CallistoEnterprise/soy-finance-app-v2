import {
  $loadingChains,
  $loadingTokens,
  $tokenBalances,
  addLoadingChain,
  addLoadingToken, removeLoadingChain, removeLoadingToken,
  setNetworkBalances
} from "./stores";
import {useEvent, useStore} from "effector-react";
import {formatUnits} from "ethers";
import {useCallback, useEffect} from "react";
import {useMultiCallContract} from "../../shared/web3/hooks/useMultiCallContract";
import {useErc20Fragment} from "../../shared/config/fragments";
import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import {ERC_20_INTERFACE} from "../../shared/config/interfaces";
import {nativeTokens, tokenListMap} from "../../shared/hooks/useAllTokens";

export function useTokenBalance({address, chainId}) {
  const {account, web3Provider} = useWeb3();

  const tokenBalances = useStore($tokenBalances);
  const loadingChains = useStore($loadingChains);
  const loadingTokens = useStore($loadingTokens);

  const setNetworkBalancesFn = useEvent(setNetworkBalances);
  const addLoadingChainFn = useEvent(addLoadingChain);
  const addLoadingTokenFn = useEvent(addLoadingToken);
  const removeLoadingChainFn = useEvent(removeLoadingChain);
  const removeLoadingTokenFn = useEvent(removeLoadingToken);

  const multiCallContract = useMultiCallContract();
  const fragment = useErc20Fragment("balanceOf");

  const updateBalanceNetwork = useCallback(async (networkId) => {
    if (!networkId || !address || !multiCallContract || !fragment || !account || !web3Provider) {
      return;
    }

    const tokenList = tokenListMap[networkId];

    if (!tokenList) {
      return;
    }

    const addresses = [...tokenList.tokens.map((tokenItem) => tokenItem.address), ];

    const calls = addresses.map((address) => {
      return {
        address,
        callData: ERC_20_INTERFACE.encodeFunctionData(fragment, [account])
      }
    });

    const nativeTokenBalance = await web3Provider.getBalance(account);

    addLoadingChainFn(networkId);
    const balanceMap = {
      [nativeTokens[networkId].address]: formatUnits(nativeTokenBalance, nativeTokens[networkId].decimals)
    };

    try {
      const [resultsBlockNumber, returnData] = await multiCallContract["aggregate"](calls.map((c) => {
        return [c.address, c.callData];
      }));

      console.log(returnData);


      addresses.forEach((address, index) => {
        const balance = ERC_20_INTERFACE.decodeFunctionResult(fragment, returnData[index])["balance"];
        const decimals = tokenList.tokens.find(t => t.address === address).decimals;
        balanceMap[address] = formatUnits(balance.toString(), decimals);
      });

      setNetworkBalancesFn({balances: balanceMap, chainId: networkId})
    } catch (e) {
      console.log(e);

    } finally {
      removeLoadingChainFn(networkId);
    }
  }, [account, addLoadingChainFn, address, fragment, multiCallContract, removeLoadingChainFn, setNetworkBalancesFn, web3Provider]);

  useEffect(() => {
    if(!tokenBalances[chainId]) {
      updateBalanceNetwork(chainId);
    }
  }, [chainId, tokenBalances, updateBalanceNetwork]);


  return {
    tokenBalance: tokenBalances[chainId]?.[address],
    loading: loadingChains.includes(chainId),
    updateBalanceNetwork
  }
}
