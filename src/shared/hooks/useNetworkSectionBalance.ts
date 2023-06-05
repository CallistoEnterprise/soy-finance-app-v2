import { useEffect, useState } from "react";
import {ethers, formatEther, formatUnits, JsonRpcProvider, Provider} from "ethers";
import { useEvent, useStore } from "effector-react";
import { pushBalance } from "../models";
import WETH_ABI from "../abis/interfaces/weth.json";
import {isNativeToken} from "../utils";
import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import {BigNumber} from "@ethersproject/bignumber";
import networks from "../../processes/web3/constants/networks.json";
import tokens from "../../processes/web3/constants/tokens.json";
import {$balances} from "../models/stores";

export async function getBalance(account, network) {
  const RPC_URL = new JsonRpcProvider(network?.rpcs[0]);
  if (account) {
    try {
      const a  = await RPC_URL.getBalance(account);
      if (a) {
        return formatEther(a);
      }
      return "";
    } catch (e) {
      return 0;
    }
  }
  return 0;
}

export const getErc20Contract = (address: string, signer?: ethers.Signer | Provider) => {
  if (!address) return null;
  return new ethers.Contract(
    address,
    WETH_ABI,
    signer
  );
};

export async function getContractsBalances(account, network, tokensToBridge: any[]) {
  const RPC_URL = new JsonRpcProvider(network?.rpcs[0]);

  if (!account) {
    return {};
  }

  const tokensA = tokensToBridge.filter(t => {
    return Boolean(t[network.chainId]) && !isNativeToken(t[network.chainId].token_address);
  }).map((l) => {
    return l[network.chainId];
  });

  const temp: { [symbol: string]: string | number } = {};
  const promises = [];

  async function writeBalance(tokenContract, symbol, decimal) {
    try {
      const balance = await tokenContract.balanceOf(account);
      temp[symbol] = formatUnits(
        balance,
        decimal
      );
    }catch (e) {
      console.log(e);
    }

  }

  for (const asset of tokensA) {
    const tokenContract = getErc20Contract(
      asset.token_address,
      RPC_URL
    );

    promises.push(writeBalance(
      tokenContract,
      asset.original_name,
      asset.decimal_token
    ));
  }

  await Promise.all(promises);
  return temp;
}

const initialState = {
  img: "",
  symbol: "",
  balance: "",
  chainId: 1
};

export interface IBalanceContract {
  img: string,
  balance: BigNumber | number | string,
  symbol: string,
  USDBalance?: number | string
}

export interface IBalanceNetwork extends IBalanceContract {
  chainId: number
}

export type BalanceItem = {
  network: IBalanceNetwork,
  contracts: IBalanceContract[]
}



export function getNetworkByChainId(chainId: number, networks: Array<any>) {
  return networks?.find(n => +n.chainId === chainId);
}

export default function useNetworkSectionBalance({ chainId }) {
  const { account } = useWeb3();
  const [network, setNetwork] = useState<any>(initialState);
  const [contracts, setContracts] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const balances = useStore($balances);
  const pushBalanceFn = useEvent(pushBalance);

  useEffect(
    () => {
      (async () => {
        const existingNetworkBalance = balances[account]?.find(b => b.network.chainId === chainId);

        if (existingNetworkBalance) {
          setNetwork(existingNetworkBalance.network);
          setContracts(existingNetworkBalance.contracts);
          setIsLoading(false);
          return;
        }

        if (!existingNetworkBalance) {

          setIsLoading(true);
          const currentNetwork = getNetworkByChainId(
            chainId,
            networks
          );

          if (!currentNetwork) {
            return;
          }
          const networkBalance = await getBalance(
            account,
            currentNetwork
          );

          const tokenBalances = await getContractsBalances(
            account,
            currentNetwork,
            tokens
          );

          const tokensA = tokens.filter(t => {
            return Boolean(t[currentNetwork.chainId]) && !isNativeToken(t[currentNetwork.chainId].token_address);
          }).map((l) => {
            return l[currentNetwork.chainId];
          });

          const currentContracts = Object.keys(tokenBalances).map((symbol) => {
            const contractObj = tokensA.find(ta => {
              return ta.original_name === symbol;
            });

            return {
              balance: tokenBalances[symbol],
              img: contractObj.imgUri,
              symbol
            };
          });

          setNetwork({
            img: currentNetwork.img,
            balance: networkBalance,
            symbol: currentNetwork.symbol,
            chainId
          });

          setContracts(currentContracts);
          pushBalanceFn({
            account,
            value: {
              network: {
                img: currentNetwork.img,
                balance: networkBalance,
                symbol: currentNetwork.symbol,
                chainId
              },
              contracts: currentContracts
            }
          });
          setIsLoading(false);
        }
      })();
    },
    [account, balances, chainId, pushBalanceFn]
  );


  return {
    network,
    contracts,
    isLoading
  };
}
