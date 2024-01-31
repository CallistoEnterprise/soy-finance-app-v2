import { TokenInfo } from "@/config/types/TokenInfo";
import { wrapTokenList } from "@/config/token-lists/wrapTokenList";

export const wetc: TokenInfo = {
  "name": "Wrapped ETC",
  "symbol": "ETC",
  "address": "0x35e9A89e43e45904684325970B2E2d258463e072",
  "chainId": 61,
  "decimals": 18,
  "logoURI": "/images/all-tokens/CLO.svg"

}
export const tokensInEtc: {
  clo: TokenInfo,
  soy: TokenInfo,
  busdt: TokenInfo,
  eth: TokenInfo,
  bnb: TokenInfo,
  cloe: TokenInfo
} = {
  clo: {
    "name": "Wrapped CLO",
    "symbol": "ccCLO",
    "address": "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CLO.svg"
  },
  soy: {
    "name": "Wrapped SOY",
    "symbol": "SOY",
    "address": "0xcC67D978Ddf07971D9050d2b424f36f6C1a15893",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/SOY.svg"
  },
  busdt: {
    "name": "Tether",
    "symbol": "BUSDT",
    "address": "0xCC48CD0B4a6f50b8f8bf0f9b80eD7881fA547968",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BUSDT.svg"
  },
  eth: {
    "name": "Wrapped ETH",
    "symbol": "ETH",
    "address": "0xcc74b43F5092B9Dd0A4a86c85794C7d19ff10d88",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ETH.svg"
  },
  bnb: {
    "name": "Wrapped BNB",
    "symbol": "BNB",
    "address": "0xcC653d74E087D35577049AB23e2141D619D95AEe",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BNB.svg"
  },
  cloe: {
    "name": "Wrapped CLOE",
    "symbol": "CLOE",
    "address": "0x09c4a1ACAE1b591C63691B8E62F46E2F0eD9A0F9",
    "chainId": 61,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CLOE.svg"
  }
}

const _tokenListInETC: TokenInfo[] = Object.values(tokensInEtc);

export const tokenListInETC = wrapTokenList(_tokenListInETC);
