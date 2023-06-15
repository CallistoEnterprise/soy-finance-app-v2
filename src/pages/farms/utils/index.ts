import {Farm} from "../FarmsPage";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import {FixedNumber} from "ethers";

const FixedZero = FixedNumber.fromValue(0);

const preferredQuoteTokensForMulti = {
  [ChainId.MAINNET]: ['BUSDT', 'WCLO'],
  [ChainId.CLOTESTNET]: ['BUSDT', 'WCLO'],
  [ChainId.BTTMAINNET]: ['BUSDT', 'WBTT', 'ccCLO', 'SOY'],
  [ChainId.ETCCLASSICMAINNET]: ['BUSDT', 'WETC', 'ccCLO', 'SOY'],
}

const filterFarmsByQuoteToken = (farms: Farm[]): Farm => {
  const chainId = 820;
  const preferredFarm = farms.find((farm) => {
    return preferredQuoteTokensForMulti[chainId].some((quoteToken) => {
      return farm.quoteToken.symbol === quoteToken
    })
  })
  return preferredFarm || farms[2]
}

const getFarmFromTokenSymbol = (farms: Farm[], tokenSymbol: string): Farm => {
  const farmsWithTokenSymbol = farms.filter((farm) => farm.token.symbol === tokenSymbol)
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol)
  return filteredFarm
}

const getFarmBaseTokenPrice = (
  farm: Farm,
  quoteTokenFarm: Farm,
  cloPriceBusd: FixedNumber,
  ccCloPrice: FixedNumber,
  chainId: number,
): FixedNumber => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === 'BUSDT' || farm.quoteToken.symbol === 'USDT') {
    return hasTokenPriceVsQuote ? farm.tokenPriceVsQuote : FixedZero
  }

  if (farm.quoteToken.symbol === "WCLO") {
    return hasTokenPriceVsQuote ? cloPriceBusd.mul(farm.tokenPriceVsQuote) : FixedZero
  }

  if ((chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET) && farm.quoteToken.symbol === 'ccCLO') {
    return hasTokenPriceVsQuote ? ccCloPrice.mul(farm.tokenPriceVsQuote) : FixedZero
  }
  // We can only calculate profits without a quoteTokenFarm for BUSDT/CLO farms
  if (!quoteTokenFarm) {
    return FixedZero
  }

  // Possible alternative farm quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the farm's quote token isn't BUSDT or wCLO, we then use the quote token, of the original farm's quote token
  // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - CLO, (pBTC - CLO)
  // from the CLO - pBTC price, we can calculate the PNT - BUSDT price
  if (quoteTokenFarm.quoteToken.symbol === "WCLO") {
    const quoteTokenInBusd = cloPriceBusd.mul(quoteTokenFarm.tokenPriceVsQuote)
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? farm.tokenPriceVsQuote.mul(quoteTokenInBusd)
      : FixedZero
  }

  if (quoteTokenFarm.quoteToken.symbol === 'BUSDT' || quoteTokenFarm.quoteToken.symbol === 'USDT') {
    const quoteTokenInBusd = quoteTokenFarm.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? farm.tokenPriceVsQuote.mul(quoteTokenInBusd)
      : FixedZero
  }

  // Catch in case token does not have immediate or once-removed BUSDT/wCLO quoteToken
  return FixedZero
}

const getFarmQuoteTokenPrice = (
  farm: Farm,
  quoteTokenFarm: Farm,
  bnbPriceBusd: FixedNumber,
  ccCloPrice: FixedNumber,
  chainId: number,
): FixedNumber => {
  if (farm.quoteToken.symbol === 'BUSDT' || farm.quoteToken.symbol === 'USDT') {
    return FixedNumber.fromValue(1);
  }

  if (farm.quoteToken.symbol === "WCLO") {
    return bnbPriceBusd
  }

  if ((chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET) && farm.quoteToken.symbol === 'ccCLO') {
    return ccCloPrice
  }

  if (!quoteTokenFarm) {
    return FixedZero
  }

  if (quoteTokenFarm.quoteToken.symbol === "WCLO") {
    return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd.mul(quoteTokenFarm.tokenPriceVsQuote) : FixedZero
  }

  if (quoteTokenFarm.quoteToken.symbol === 'BUSDT' || quoteTokenFarm.quoteToken.symbol === 'USDT') {
    return quoteTokenFarm.tokenPriceVsQuote ? quoteTokenFarm.tokenPriceVsQuote : FixedZero
  }

  return FixedZero
}

const farmsPids = {
  // clo-busdt
  [ChainId.MAINNET]: 4, // here it is busdt-wclo
  [ChainId.CLOTESTNET]: 25, // clo-busdt
  [ChainId.BTTMAINNET]: 14,
  [ChainId.ETCCLASSICMAINNET]: 6,
}
const busdtFarms = {
  // soy-busdt
  [ChainId.MAINNET]: 5,
  [ChainId.CLOTESTNET]: 24,
  [ChainId.BTTMAINNET]: 19,
  [ChainId.ETCCLASSICMAINNET]: 5,
}
const refFarms = {
  // soy-clo
  [ChainId.MAINNET]: 2,
  [ChainId.CLOTESTNET]: 23,
  [ChainId.BTTMAINNET]: 9,
  [ChainId.ETCCLASSICMAINNET]: 1,
};
export const fetchFarmsPrices = (farms) => {
  const chainId = 820;
  const nativeBusdtFarm = farms.find((farm: Farm) => farm.pid === farmsPids[chainId])
  const soyBusdtFarm = farms.find((farm: Farm) => farm.pid === busdtFarms[chainId])
  const soyCloFarm = farms.find((farm: Farm) => farm.pid === refFarms[chainId])

  const soyPrice = soyBusdtFarm ? soyBusdtFarm.tokenPriceVsQuote : FixedZero;
  const cloPrice = soyCloFarm ? soyPrice.mul(soyCloFarm.tokenPriceVsQuote) : FixedZero;

  const nativePriceBusdt = nativeBusdtFarm.tokenPriceVsQuote ? FixedNumber.fromValue(1).div(nativeBusdtFarm.tokenPriceVsQuote) : FixedZero

  const farmsWithPrices = farms.map((farm) => {
    const quoteTokenFarm = getFarmFromTokenSymbol(farms, farm.quoteToken.symbol)
    const baseTokenPrice =
      farm.pid === 15 && (chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET)
        ? nativePriceBusdt
        : getFarmBaseTokenPrice(farm, quoteTokenFarm, nativePriceBusdt, cloPrice, chainId)
    const quoteTokenPrice =
      farm.pid === 15 && (chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET)
        ? cloPrice
        : getFarmQuoteTokenPrice(farm, quoteTokenFarm, nativePriceBusdt, cloPrice, chainId)

    const token = { ...farm.token, usdcPrice: baseTokenPrice }
    const quoteToken = { ...farm.quoteToken, usdcPrice: quoteTokenPrice }

    return { ...farm, token, quoteToken, liquidity: farm.lpTotalInQuoteToken.mul(quoteTokenPrice) }
  })

  return farmsWithPrices
}
