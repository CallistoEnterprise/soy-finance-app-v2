import { TokenInfo } from "@/config/types/TokenInfo";
import { wrapTokenList } from "@/config/token-lists/wrapTokenList";

export const wclo: TokenInfo = {
  "name": "Wrapped CLO",
  "symbol": "CLO",
  "address": "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
  "chainId": 820,
  "decimals": 18,
  "logoURI": "/images/all-tokens/CLO.svg"
}

export const tokensInClo: {
  cloe: TokenInfo,
  busdt: TokenInfo,
  etc: TokenInfo
  soy: TokenInfo
  bnb: TokenInfo
  eth: TokenInfo
  cake: TokenInfo
  twt: TokenInfo
  wsg: TokenInfo
  reef: TokenInfo
  bake: TokenInfo
  shib: TokenInfo
  raca: TokenInfo
  lina: TokenInfo
  ton: TokenInfo
  xms: TokenInfo
  ftm: TokenInfo
  btt: TokenInfo
  bbt: TokenInfo
  antex: TokenInfo
  zoo: TokenInfo
  bcoin: TokenInfo
  vvt: TokenInfo
  slofi: TokenInfo
  ce: TokenInfo
  ce2: TokenInfo
  ce3: TokenInfo
  ce4: TokenInfo
} = {
  cloe: {
    "name": "Callisto Enterprise",
    "symbol": "CLOE",
    "address": "0x1eAa43544dAa399b87EEcFcC6Fa579D5ea4A6187",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CLOE.svg"
  },
  busdt: {
    "name": "Bulls USD",
    "symbol": "BUSDT",
    "address": "0xbf6c50889d3a620eb42C0F188b65aDe90De958c4",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BUSDT.svg"
  },
  etc: {
    "name": "Wrapped ETC",
    "symbol": "ccETC",
    "address": "0xCCc766f97629a4E14b3af8C91EC54f0b5664A69F",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ETC.svg"
  },
  soy: {
    "name": "Soy-ERC223",
    "symbol": "SOY",
    "address": "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/SOY.svg"
  },
  bnb: {
    "name": "Wrapped BNB(ERC223)",
    "symbol": "ccBNB",
    "address": "0xcCDe29903E621Ca12DF33BB0aD9D1ADD7261Ace9",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BNB.svg"
  },
  eth: {
    "name": "Wrapped ETH(ERC223)",
    "symbol": "ccETH",
    "address": "0xcC208c32Cc6919af5d8026dAB7A3eC7A57CD1796",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ETH.svg"
  },
  cake: {
    "name": "Wrapped CAKE",
    "symbol": "ccCAKE",
    "address": "0xCC2D45F7fE1b8864a13F5D552345eB3f5a005FEd",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CAKE.svg"
  },
  twt: {
    "name": "Wrapped TWT",
    "symbol": "ccTWT",
    "address": "0xCC099e75152ACCda96d54FAbaf6e333ca44AD86e",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/TWT.svg"
  },
  wsg: {
    "name": "Wrapped WSG",
    "symbol": "ccWSG",
    "address": "0xccEbb9f0EE6D720DebccEE42f52915037f774A70",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/WSG.svg"
  },
  reef: {
    "name": "Wrapped REEF",
    "symbol": "ccREEF",
    "address": "0xCc1530716A7eBecFdc7572eDCbF01766f042155c",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/REEF.svg"
  },
  bake: {
    "name": "Wrapped BAKE",
    "symbol": "ccBAKE",
    "address": "0xCCeC9F26F52E8e0D1d88365004f4F475f5274279",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BAKE.svg"
  },
  shib: {
    "name": "Wrapped SHIB",
    "symbol": "ccSHIB",
    "address": "0xccA4F2ED7Fc093461c13f7F5d79870625329549A",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/SHIB.svg"
  },
  raca: {
    "name": "Wrapped RACA",
    "symbol": "ccRACA",
    "address": "0xCC8B04c0f7d0797B3BD6b7BE8E0061ac0c3c0A9b",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/RACA.svg"
  },
  lina: {
    "name": "Wrapped LINA",
    "symbol": "ccLINA",
    "address": "0xCC10A4050917f771210407DF7A4C048e8934332c",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/LINA.svg"
  },
  ton: {
    "name": "Wrapped TON",
    "symbol": "ccTON",
    "address": "0xCC50D400042177B9DAb6bd31ede73aE8e1ED6F08",
    "chainId": 820,
    "decimals": 9,
    "logoURI": "/images/all-tokens/TON.svg"
  },
  xms: {
    "name": "Wrapped XMS",
    "symbol": "ccXMS",
    "address": "0xcc45afedd2065EDcA770801055d1E376473a871B",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/XMS.svg"
  },
  ftm: {
    "name": "Wrapped FTM",
    "symbol": "ccFTM",
    "address": "0xcc50aB63766660C6C1157B8d6A5D51ceA82Dff34",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/FTM.svg"
  },
  btt: {
    "name": "Wrapped BTT",
    "symbol": "ccBTT",
    "address": "0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BTT.svg"
  },
  bbt: {
    "name": "Wrapped BBT",
    "symbol": "ccBBT",
    "address": "0xcCCaC2f22752bbe77D4DAb4e9421F2AC6c988427",
    "chainId": 820,
    "decimals": 8,
    "logoURI": "/images/all-tokens/BBT.svg"
  },
  antex: {
    "name": "Wrapped ANTEX",
    "symbol": "ccANTEX",
    "address": "0xCCd792f5D06b73685a1b54A32fE786346cAd1894",
    "chainId": 820,
    "decimals": 8,
    "logoURI": "/images/all-tokens/ANTEX.svg"
  },
  zoo: {
    "name": "Wrapped ZOO",
    "symbol": "ccZOO",
    "address": "0xCC9aFcE1e164fC2b381A3a104909e2D9E52cfB5D",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/ZOO.svg"
  },
  bcoin: {
    "name": "Wrapped BCOIN",
    "symbol": "ccBCOIN",
    "address": "0xcC6e7E97A46B6F0eD3bC81518Fc816da78F7cb65",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/BCOIN.svg"
  },
  vvt: {
    "name": "VIPSVERSE Token",
    "symbol": "VVT",
    "address": "0x9f9b6DD3DEDB4D2e6C679bCb8782f546400e9A53",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/VVT.svg"
  },
  slofi: {
    "name": "Sloth Finance Token",
    "symbol": "SLOFI",
    "address": "0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/SLOFI.svg"
  },
  ce: {
    "name": "Callisto Evolution",
    "symbol": "CE",
    "address": "0x3986E815F87feA74910F7aDeAcD1cE7f172E1df0",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CE.png"
  },
  ce2: {
    "name": "Callisto Evolution Phase 2",
    "symbol": "CE2",
    "address": "0xB376e0eE3f4430ddE2cd6705eeCB48b2d5eb5C3C",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CE.png"
  },
  ce3: {
    "name": "Callisto Evolution Phase 3",
    "symbol": "CE3",
    "address": "0x54BdF1fB03f1ff159FE175EAe6cDCE25a2192F2E",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CE.png"
  },
  ce4: {
    "name": "Callisto Evolution Phase 4",
    "symbol": "CE4",
    "address": "0x4928688C4c83bC9a0D3c4a20A4BC13c54Af55C94",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "/images/all-tokens/CE.png"
  }
}

const _tokenListInCLO: TokenInfo[] = Object.values(tokensInClo);

export const tokenListInCLO = wrapTokenList(_tokenListInCLO);
