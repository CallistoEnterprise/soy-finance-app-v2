import { TokenInfo } from "@/config/types/TokenInfo";
import { wrapTokenList } from "@/config/token-lists/wrapTokenList";

export const wbtt: TokenInfo = {
  "name": "Wrapped BTT",
  "symbol": "BTT",
  "address": "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e",
  "chainId": 199,
  "decimals": 18,
  "logoURI": "/images/all-tokens/BTT.svg"
}
export const tokensInBtt: {
  clo: TokenInfo,
  soy: TokenInfo,
  busdt: TokenInfo,
  bnb: TokenInfo,
  eth: TokenInfo,
  etc: TokenInfo,
  cloe: TokenInfo
} = {
  clo: {
    "name": "Wrapped CLO",
    "symbol": "ccCLO",
    "address": "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CLO.svg"
  },
  soy: {
    "name": "Wrapped SOY",
    "symbol": "SOY",
    "address": "0xcC00860947035a26Ffe24EcB1301ffAd3a89f910",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/SOY.svg"
  },
  busdt: {
    "name": "Tether",
    "symbol": "BUSDT",
    "address": "0xCC78D0A86B0c0a3b32DEBd773Ec815130F9527CF",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BUSDT.svg"
  },
  bnb: {
    "name": "Wrapped BNB",
    "symbol": "BNB",
    "address": "0x185a4091027E2dB459a2433F85f894dC3013aeB5",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BNB.svg"
  },
  eth: {
    "name": "Wrapped ETH",
    "symbol": "ETH",
    "address": "0x1249C65AfB11D179FFB3CE7D4eEDd1D9b98AD006",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ETH.svg"
  },
  etc: {
    "name": "Wrapped ETC",
    "symbol": "ETC",
    "address": "0xCc944bF3e76d483e41CC6154d5196E2e5d348fB0",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ETC.svg"
  },
  cloe: {
    "name": "Wrapped CLOE",
    "symbol": "CLOE",
    "address": "0xCC20d1B86bf1b80d4b9F0C19B138E17034457271",
    "chainId": 199,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CLOE.svg"
  }
}

const _tokenListInBTT: TokenInfo[] = Object.values(tokensInBtt);

export const tokenListInBTT = wrapTokenList(_tokenListInBTT);
