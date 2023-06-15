import {useWeb3} from "../../processes/web3/hooks/useWeb3";
import tokenListInCLO from "../constants/tokenLists/tokenlistInCLO.json";
import tokenListInETC from "../constants/tokenLists/tokenlistInETC.json";
import tokenListInBTT from "../constants/tokenLists/tokenlistInBTT.json";
import {useMemo} from "react";
import {WrappedTokenInfo} from "../../pages/swap/hooks/useTrade";

const tokenListMap = {
  820: tokenListInCLO,
  61: tokenListInETC,
  199: tokenListInBTT
};

const nativeTokens = {
  820: new WrappedTokenInfo({
    chainId: 820,
    address: '0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a',
    symbol: "CLO",
    name: "CLO",
    decimals: 18,
    logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/2757.png"
  }, []),
  61: new WrappedTokenInfo({
    chainId: 61,
    address: '0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a',
    symbol: "ETC",
    name: "ETC",
    decimals: 18
  }, []),
  199: new WrappedTokenInfo({
    chainId: 199,
    address: '0x33e85f0e26600a6644b6c910639B0bc7a99fd34e',
    symbol: "BTT",
    name: "BitTorrent",
    decimals: 18
  }, []),
}

export function useAllTokens(): WrappedTokenInfo[] {
  const {chainId} = useWeb3();

  return useMemo(() => {
    if(!chainId || !tokenListMap[chainId] || !nativeTokens[chainId]) {
      return [];
    }

    const tokensArray = tokenListMap[chainId].tokens.map((token) => {
      return new WrappedTokenInfo({
        symbol: token.symbol,
        address: token.address,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        logoURI: token.logoURI
      }, []);
    });

    return [nativeTokens[chainId], ...tokensArray];
  }, [chainId]);
}
