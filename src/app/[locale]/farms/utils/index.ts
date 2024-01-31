const logos: {
  [key: string]: {
    symbol: string,
    logo: string
  }
} = {
  "0xf5ad6f6edec824c7fd54a66d241a227f6503ad3a": {
    symbol: "WCLO",
    logo: "/images/all-tokens/CLO.svg",
  },
  "0xbf6c50889d3a620eb42c0f188b65ade90de958c4": {
    symbol: "BUSDT",
    logo: "/images/all-tokens/BUSDT.svg"
  },
  "0x9fae2529863bd691b4a7171bdfcf33c7ebb10a65": {
    symbol: "SOY",
    logo: "/images/all-tokens/SOY.svg"
  },
  "0xccc766f97629a4e14b3af8c91ec54f0b5664a69f": {
    symbol: "ccETC",
    logo: "/images/all-tokens/ETC.svg"
  },
  "0x1eaa43544daa399b87eecfcc6fa579d5ea4a6187": {
    symbol: "CLOE",
    logo: "/images/all-tokens/CLOE.svg"
  },
  "0xcc208c32cc6919af5d8026dab7a3ec7a57cd1796": {
    symbol: "ccETH",
    logo: "/images/all-tokens/ETH.svg"
  },
  "0xccde29903e621ca12df33bb0ad9d1add7261ace9": {
    symbol: "ccBNB",
    logo: "/images/all-tokens/BNB.svg"
  },
  "0xcc099e75152accda96d54fabaf6e333ca44ad86e": {
    symbol: "ccTWT",
    logo: "/images/all-tokens/TWT.svg"
  },
  "0xcc68a5a0fe33fe74a24955717989ea094e6c2b9f": {
    symbol: "ccDOGE",
    logo: "/images/all-tokens/DOGE.svg"
  },
  "0xcc1530716a7ebecfdc7572edcbf01766f042155c": {
    symbol: "ccREEF",
    logo: "/images/all-tokens/REEF.svg"
  },
  "0xcc99c6635fae4dacf967a3fc2913ab9fa2b349c3": {
    symbol: "ccBTT",
    logo: "/images/all-tokens/BTT.svg"
  },
  "0xccebb9f0ee6d720debccee42f52915037f774a70": {
    symbol: "ccWSG",
    logo: "/images/all-tokens/WSG.svg"
  },
  "0xcca4f2ed7fc093461c13f7f5d79870625329549a": {
    symbol: "ccSHIBA",
    logo: "/images/all-tokens/SHIB.svg"
  },
  "0xcc8b04c0f7d0797b3bd6b7be8e0061ac0c3c0a9b": {
    symbol: "ccRACA",
    logo: "/images/all-tokens/RACA.svg"
  },
  "0xccd792f5d06b73685a1b54a32fe786346cad1894": {
    symbol: "ccANTEX",
    logo: "/images/all-tokens/ANTEX.svg"
  },
  "0xcc10a4050917f771210407df7a4c048e8934332c": {
    symbol: "ccLINA",
    logo: "/images/all-tokens/LINA.svg"
  },
  "0xcc50ab63766660c6c1157b8d6a5d51cea82dff34": {
    symbol: "ccFTM",
    logo: "/images/all-tokens/FTM.svg"
  },
  "0x9f9b6dd3dedb4d2e6c679bcb8782f546400e9a53": {
    symbol: "ccVVT",
    logo: "/images/all-tokens/VVT.svg"
  },
  "0xcc2d45f7fe1b8864a13f5d552345eb3f5a005fed": {
    symbol: "ccCAKE",
    logo: "/images/all-tokens/CAKE.svg"
  },
  "0xccec9f26f52e8e0d1d88365004f4f475f5274279": {
    symbol: "ccBAKE",
    logo: "/images/all-tokens/BAKE.svg"
  },
  "0xcc50d400042177b9dab6bd31ede73ae8e1ed6f08": {
    symbol: "ccTON",
    logo: "/images/all-tokens/TON.svg"
  },
  "0xcc45afedd2065edca770801055d1e376473a871b": {
    symbol: "ccXMS",
    logo: "/images/all-tokens/XMS.svg"
  },
  "0xcccac2f22752bbe77d4dab4e9421f2ac6c988427": {
    symbol: "ccBBT",
    logo: "/images/all-tokens/BBT.svg"
  },
  "0xcc9afce1e164fc2b381a3a104909e2d9e52cfb5d": {
    symbol: "ccZOO",
    logo: "/images/all-tokens/ZOO.svg"
  },
  "0xcc6e7e97a46b6f0ed3bc81518fc816da78f7cb65": {
    symbol: "ccBCOIN",
    logo: "/images/all-tokens/BCOIN.svg"
  }
}

export function getLogo({address}: {address: string}): string {
  const token = logos[address];
  if (!token) {
    return "/images/all-tokens/placeholder.svg";
  }

  return token.logo;
}
