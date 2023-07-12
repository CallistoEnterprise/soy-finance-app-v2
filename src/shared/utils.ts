export function isNativeToken(address) {
  if (!address) {
    return false;
  }
  return ["0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e"].includes(address)
}

export function formatBalance(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(4)
    .replace(
      /\.0000/,
      ".0"
    );
}

export function formatBalanceToSix(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(6)
    .replace(
      /\.00000000/,
      ".0"
    );
}

export function formatBalanceToEight(balance) {
  if(!balance) {
    return "0.0";
  }

  return Number(balance).toFixed(8)
    .replace(
      /\.00000000/,
      ".0"
    );
}

export function formatAddress(address: string | null) {
  if (!address) {
    return "";
  }

  return `${address.substring(0, 4)}...${address.slice(-4)}`;
}

const logos = {
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

export function getLogo({address}): string {
  const token = logos[address];
  if (!token) {
    return "/images/all-tokens/placeholder.svg";
  }

  return token.logo;
}

export const tokenEarnedPerThousandDollarsCompounding = ({
                                                           numberOfDays,
                                                           farmApr,
                                                           tokenPrice,
                                                           roundingDecimals = 2,
                                                           compoundFrequency = 1,
                                                           performanceFee = 0,
                                                         }) => {
  // Everything here is worked out relative to a year, with the asset compounding at the compoundFrequency rate. 1 = once per day
  const timesCompounded = 365 * compoundFrequency
  // We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
  let aprAsDecimal = farmApr / 100

  if (performanceFee) {
    // Reduce the APR by the % performance fee
    const feeRelativeToApr = (farmApr / 100) * performanceFee
    const aprAfterFee = farmApr - feeRelativeToApr

    aprAsDecimal = aprAfterFee / 100
  }

  const daysAsDecimalOfYear = numberOfDays / 365
  // Calculate the starting TOKEN balance with a dollar balance of $1000.
  const principal = 1000 / tokenPrice
  // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
  const finalAmount = principal * (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)
  // To get the TOKEN amount earned, deduct the amount after compounding (finalAmount) from the starting TOKEN balance (principal)
  const interestEarned = finalAmount - principal

  // return parseFloat((interestEarned * 10).toFixed(roundingDecimals))
  return parseFloat(interestEarned.toFixed(roundingDecimals))
}

export const getRoi = ({ amountEarned, amountInvested }) => {
  const percentage = (amountEarned / amountInvested) * 100
  return percentage
}

export const tokenEarnedPerThousandDollarsCompoundingForPools = ({
                                                                   numberOfDays,
                                                                   farmApr,
                                                                   tokenPrice,
                                                                   roundingDecimals = 2,
                                                                   compoundFrequency = 1,
                                                                   performanceFee = 0,
                                                                 }) => {
  const earnedSoy = tokenPrice === 0 ? 0 : (10 * farmApr) / tokenPrice
  return parseFloat(earnedSoy.toFixed(roundingDecimals))
}
