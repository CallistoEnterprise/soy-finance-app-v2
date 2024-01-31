"use client";
import Container from "@/components/atoms/Container";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import BannerSlider from "@/app/[locale]/farms/components/BannerSlider";
import PageCardHeading from "@/components/PageCardHeading";
import Farms from "@/app/[locale]/farms/components/Farms";
import Switch from "@/components/atoms/Switch";
import clsx from "clsx";
import { useAccount, useBlockNumber, useChainId } from "wagmi";
import { IIFE } from "@/other/IIFE";
import { useFarmsUserDataStore } from "@/app/[locale]/farms/stores";
import farmsInClo from "@/config/farms/farmsInCLO";
import farmsInEtc from "@/config/farms/farmsInETC";
import farmsInBtt from "@/config/farms/farmsInBTT";
import { PAIR_ABI } from "@/config/abis/pair";
import { multicall } from "@wagmi/core";
import { formatUnits } from "viem";
import { Contract } from "@ethersproject/contracts";
import { ERC20_ABI } from "@/config/abis/erc20";
import { MASTERCHEF_ABI } from "@/config/abis/masterChef";
import { LOCAL_FARM_V2_ABI } from "@/config/abis/localFarmV2";
import { MASTER_CHEF_ADDRESS } from "@/config/addresses/masterChef";
import { ChainId } from "@callisto-enterprise/soy-sdk";
import { getBlocksFromTimestamps, getUnixTime, PoolData } from "@/other/fetchRecentTransactions";
import { gql, request } from "graphql-request";
import { startOfMinute, subDays, subWeeks } from "date-fns";
import { LOCAL_FARM_ABI } from "@/config/abis/localFarm";
import UnStakeLPTokensModal from "@/app/[locale]/farms/components/UnstakeLPTokensDialog";
import StakeLPTokensModal from "./components/StakeLPTokensDialog";
import { config } from "@/config/wagmi/config";
import Select from "@/components/atoms/Select";
import SearchInput from "@/components/atoms/SearchInput";
import useUSDPrices from "@/hooks/useUSDPrices";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import Preloader from "@/components/atoms/Preloader";

const farmsPids = {
  // clo-busdt
  [ChainId.MAINNET]: 43, // here it is busdt-wclo
  [ChainId.CLOTESTNET]: 25, // clo-busdt
  [ChainId.BTTMAINNET]: 14,
  [ChainId.ETCCLASSICMAINNET]: 6,
}
const busdtFarms = {
  // soy-busdt
  [ChainId.MAINNET]: 44,
  [ChainId.CLOTESTNET]: 24,
  [ChainId.BTTMAINNET]: 19,
  [ChainId.ETCCLASSICMAINNET]: 5,
}
const refFarms = {
  // soy-clo
  [ChainId.MAINNET]: 42,
  [ChainId.CLOTESTNET]: 23,
  [ChainId.BTTMAINNET]: 9,
  [ChainId.ETCCLASSICMAINNET]: 1,
};

const preferredQuoteTokensForMulti = {
  [ChainId.MAINNET]: ['BUSDT', 'CLO'],
  [ChainId.CLOTESTNET]: ['BUSDT', 'CLO'],
  [ChainId.BTTMAINNET]: ['BUSDT', 'BTT', 'CLO', 'SOY'],
  [ChainId.ETCCLASSICMAINNET]: ['BUSDT', 'ETC', 'CLO', 'SOY'],
}

const BigIntZero = 0;

const getFarmFromTokenSymbol = (farms: any[], tokenSymbol: string): any => {
  const farmsWithTokenSymbol = farms.filter((farm) => farm.token.symbol === tokenSymbol)
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol)
  return filteredFarm
}

const filterFarmsByQuoteToken = (farms: any[]): any => {
  const chainId = 820;
  const preferredFarm = farms.find((farm) => {
    return preferredQuoteTokensForMulti[chainId].some((quoteToken) => {
      return farm.quoteToken.symbol === quoteToken
    })
  })
  return preferredFarm || farms[42]
}

const getFarmBaseTokenPrice = (
  farm: any,
  quoteTokenFarm: any,
  cloPriceBusd: number,
  ccCloPrice: number,
  chainId: number,
): number => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === 'BUSDT' || farm.quoteToken.symbol === 'USDT') {
    return hasTokenPriceVsQuote ? farm.tokenPriceVsQuote : 0
  }

  if (farm.quoteToken.symbol === "CLO") {
    return hasTokenPriceVsQuote ? cloPriceBusd * farm.tokenPriceVsQuote : 0
  }

  if ((chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET) && farm.quoteToken.symbol === 'CLO') {
    return hasTokenPriceVsQuote ? ccCloPrice * farm.tokenPriceVsQuote : 0
  }
  // We can only calculate profits without a quoteTokenFarm for BUSDT/CLO farms
  if (!quoteTokenFarm) {
    return 0
  }

  // Possible alternative farm quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the farm's quote token isn't BUSDT or wCLO, we then use the quote token, of the original farm's quote token
  // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - CLO, (pBTC - CLO)
  // from the CLO - pBTC price, we can calculate the PNT - BUSDT price
  if (quoteTokenFarm.quoteToken.symbol === "CLO") {
    const quoteTokenInBusd = cloPriceBusd * quoteTokenFarm.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? farm.tokenPriceVsQuote * quoteTokenInBusd
      : BigIntZero
  }

  if (quoteTokenFarm.quoteToken.symbol === 'BUSDT' || quoteTokenFarm.quoteToken.symbol === 'USDT') {
    const quoteTokenInBusd: number = quoteTokenFarm.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? farm.tokenPriceVsQuote * quoteTokenInBusd
      : BigIntZero
  }

  // Catch in case token does not have immediate or once-removed BUSDT/wCLO quoteToken
  return BigIntZero
}

const getFarmQuoteTokenPrice = (
  farm: any,
  quoteTokenFarm: any,
  bnbPriceBusd: number,
  ccCloPrice: number,
  chainId: number,
): number => {
  if (farm.quoteToken.symbol === 'BUSDT' || farm.quoteToken.symbol === 'USDT') {
    return 1;
  }

  if (farm.quoteToken.symbol === "CLO") {
    return bnbPriceBusd
  }

  if ((chainId === ChainId.BTTMAINNET || chainId === ChainId.ETCCLASSICMAINNET) && farm.quoteToken.symbol === 'CLO') {
    return ccCloPrice
  }

  if (!quoteTokenFarm) {
    return BigIntZero;
  }

  if (quoteTokenFarm.quoteToken.symbol === "CLO") {
    return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd * quoteTokenFarm.tokenPriceVsQuote : BigIntZero
  }

  if (quoteTokenFarm.quoteToken.symbol === 'BUSDT' || quoteTokenFarm.quoteToken.symbol === 'USDT') {
    return quoteTokenFarm.tokenPriceVsQuote ? quoteTokenFarm.tokenPriceVsQuote : BigIntZero
  }

  return BigIntZero
}
const fetchFarmsPrices = (farms: any[], chainId: AvailableChains) => {
  const nativeBusdtFarm = farms.find((farm) => farm.pid === farmsPids[chainId])
  const soyBusdtFarm = farms.find((farm) => farm.pid === busdtFarms[chainId])
  const soyCloFarm = farms.find((farm) => farm.pid === refFarms[chainId])

  const soyPrice: number = soyBusdtFarm ? soyBusdtFarm.tokenPriceVsQuote : 0;
  const cloPrice = soyCloFarm ? soyPrice * soyCloFarm.tokenPriceVsQuote : 0;

  const nativePriceBusdt = nativeBusdtFarm?.tokenPriceVsQuote ? 1 / nativeBusdtFarm.tokenPriceVsQuote : 0

  return farms.map((farm) => {
    const quoteTokenFarm = getFarmFromTokenSymbol(farms, farm.quoteToken.symbol);
    const baseTokenPrice =
      farm.pid === 15 && (chainId === 199 || chainId === 61)
        ? nativePriceBusdt
        : getFarmBaseTokenPrice(farm, quoteTokenFarm, nativePriceBusdt, cloPrice, chainId)
    const quoteTokenPrice =
      farm.pid === 15 && (chainId === 199 || chainId === 61)
        ? cloPrice
        : getFarmQuoteTokenPrice(farm, quoteTokenFarm, nativePriceBusdt, cloPrice, chainId)


    if(farm.pid === 45) {
      const poolLiquidity = Number(farm.quoteTokenAmountMc) * Number(quoteTokenPrice);
    }

    const poolLiquidity = Number(formatUnits(farm.lpTotalInQuoteToken, farm.quoteToken.decimals)) * Number(quoteTokenPrice);

    const farmLiquidity = poolLiquidity * Number(farm.lpTokenBalance) / Number(farm.totalSupply);

    const token = { ...farm.token, usdcPrice: baseTokenPrice }
    const quoteToken = { ...farm.quoteToken, usdcPrice: quoteTokenPrice }

    return { ...farm, token, quoteToken, liquidity: farmLiquidity }
  })
}

const TOTAL_FEE = 0.002;
const LP_HOLDERS_FEE = 0.002;

const getLpFeesAndApr = (volumeUSD: number, volumeUSDWeek: number, liquidityUSD: number) => {
  const totalFees24h = volumeUSD * TOTAL_FEE
  const totalFees7d = volumeUSDWeek * TOTAL_FEE
  const lpFees24h = volumeUSD * LP_HOLDERS_FEE
  const lpFees7d = volumeUSDWeek * LP_HOLDERS_FEE

  const lpApr7d = liquidityUSD > 0 ? (volumeUSDWeek * LP_HOLDERS_FEE * WEEKS_IN_YEAR * 100) / liquidityUSD : 0
  return {
    totalFees24h,
    totalFees7d,
    lpFees24h,
    lpFees7d,
    lpApr7d: lpApr7d !== Infinity ? lpApr7d : 0,
  }
}

interface Block {
  number: number
  timestamp: string
}

const useBlocksFromTimestamps = (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' = 'desc',
  skipCount = 1000,
): {
  blocks?: Block[]
  error: boolean
} => {
  const [blocks, setBlocks] = useState<Block[]>()
  const [error, setError] = useState(false)

  const timestampsString = JSON.stringify(timestamps)
  const blocksString = blocks ? JSON.stringify(blocks) : undefined

  useEffect(() => {
    const fetchData = async () => {
      const timestampsArray = JSON.parse(timestampsString)
      const result = await getBlocksFromTimestamps(timestampsArray, sortDirection, skipCount)
      if (result.length === 0) {
        setError(true)
      } else {
        setBlocks(result)
      }
    }
    const blocksArray = blocksString ? JSON.parse(blocksString) : undefined
    if (!blocksArray && !error) {
      fetchData()
    }
  }, [blocksString, error, skipCount, sortDirection, timestampsString])

  return {
    blocks,
    error,
  }
}

function compareApr(a: any, b: any) {
  if (!a.apr && !b.apr) {
    return 0;
  }

  if (!a.apr) {
    return 1;
  }

  if (!b.apr) {
    return -1;
  }


  const farmA_APR = a.apr + a.lpRewardsApr;
  const farmB_APR = b.apr + b.lpRewardsApr;

  if (farmA_APR < farmB_APR) {
    return 1;
  }
  if (farmA_APR > farmB_APR) {
    return -1;
  }
  return 0;
}

function compareMultiplier(a: any, b: any) {
  if (a.multiplier < b.multiplier) {
    return 1;
  }
  if (a.multiplier > b.multiplier) {
    return -1;
  }
  return 0;
}

function compareLiquidity(a: any, b: any) {
  if (a.liquidity < b.liquidity) {
    return 1;
  }
  if (a.liquidity > b.liquidity) {
    return -1;
  }

  return 0;
}

const getDeltaTimestamps = (): [number, number, number, number] => {
  const utcCurrentTime = getUnixTime(new Date()) * 1000
  const t24h = getUnixTime(startOfMinute(subDays(utcCurrentTime, 1)))
  const t48h = getUnixTime(startOfMinute(subDays(utcCurrentTime, 2)))
  const t7d = getUnixTime(startOfMinute(subWeeks(utcCurrentTime, 1)))
  const t14d = getUnixTime(startOfMinute(subWeeks(utcCurrentTime, 2)))
  return [t24h, t48h, t7d, t14d]
}

interface TopPoolsResponse {
  pairDayDatas: {
    id: string
  }[]
}

const infoClient = 'https://03.callisto.network/subgraphs/name/soyswap';

// These tokens are either incorrectly priced or have some other issues that spoil the query data
// None of them present any interest as they have almost 0 daily trade volume
const TOKEN_BLACKLIST = [
  '0xffbce94c24a6c67daf7315948eb8b9fa48c5cdee',
  '0xcc78d0a86b0c0a3b32debd773ec815130f9527cf',
]

const fetchTopPools = async (timestamp24hAgo: number): Promise<string[]> => {
  try {
    const query = gql`
      query topPools($blacklist: [String!], $timestamp24hAgo: Int) {
        pairDayDatas(
          first: 30
          where: { dailyTxns_gt: 1, token0_not_in: $blacklist, token1_not_in: $blacklist, date_gt: $timestamp24hAgo }
          orderBy: dailyVolumeUSD
          orderDirection: desc
        ) {
          id
        }
      }
    `
    const data = await request<TopPoolsResponse>(infoClient, query, { blacklist: TOKEN_BLACKLIST, timestamp24hAgo });
    // pairDayDatas id has compound id "0xPOOLADDRESS-NUMBERS", extracting pool address with .split('-')
    return data.pairDayDatas.map((p) => p.id.split('-')[0])
  } catch (error) {
    console.error('Failed to fetch top pools', error)
    return []
  }
}

const useTopPoolAddresses = (): string[] => {
  const [topPoolAddresses, setTopPoolAddresses] = useState<string[]>([]);
  const [timestamp24hAgo] = useMemo(() => {
    return getDeltaTimestamps();
  }, []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const addresses = await fetchTopPools(timestamp24hAgo);
      setTopPoolAddresses(addresses);
      setLoaded(true);
    }
    if (topPoolAddresses.length === 0 && !loaded) {
      fetch()
    }
  }, [topPoolAddresses, timestamp24hAgo, loaded])

  return topPoolAddresses
}

/**
 * Data for displaying pool tables (on multiple pages, used throughout the site)
 * Note: Don't try to refactor it to use variables, server throws error if blocks passed as undefined variable
 * only works if its hard-coded into query string
 */
const POOL_AT_BLOCK = (block: number | null, pools: string[]) => {
  const blockString = block ? `block: {number: ${block}}` : ``
  const addressesString = `["${pools.join('","')}"]`
  return `pairs(
    where: { id_in: ${addressesString} }
    ${blockString}
    orderBy: trackedReserveCLO
    orderDirection: desc
  ) {
    id
    reserve0
    reserve1
    reserveUSD
    volumeUSD
    token0Price
    token1Price
    token0 {
      id
      symbol
      name
    }
    token1 {
      id
      symbol
      name
    }
  }`
}

interface PoolFields {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  token0Price: string
  token1Price: string
  token0: {
    id: string
    symbol: string
    name: string
  }
  token1: {
    id: string
    symbol: string
    name: string
  }
}

interface FormattedPoolFields
  extends Omit<PoolFields, 'volumeUSD' | 'reserveUSD' | 'reserve0' | 'reserve1' | 'token0Price' | 'token1Price'> {
  volumeUSD: number
  reserveUSD: number
  reserve0: number
  reserve1: number
  token0Price: number
  token1Price: number
}

interface PoolsQueryResponse {
  now: PoolFields[]
  oneDayAgo: PoolFields[]
  twoDaysAgo: PoolFields[]
  oneWeekAgo: PoolFields[]
  twoWeeksAgo: PoolFields[]
}

const fetchPoolData = async (
  block24h: number,
  block48h: number,
  block7d: number,
  block14d: number,
  poolAddresses: string[],
) => {
  try {
    const query = gql`
      query pools {
        now: ${POOL_AT_BLOCK(null, poolAddresses)}
        oneDayAgo: ${POOL_AT_BLOCK(block24h, poolAddresses)}
        twoDaysAgo: ${POOL_AT_BLOCK(block48h, poolAddresses)}
        oneWeekAgo: ${POOL_AT_BLOCK(block7d, poolAddresses)}
        twoWeeksAgo: ${POOL_AT_BLOCK(block14d, poolAddresses)}
      }
    `
    const data = await request<PoolsQueryResponse>(infoClient, query)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch pool data', error)
    return { error: true }
  }
}

// Transforms pools into "0xADDRESS: { ...PoolFields }" format and cast strings to numbers
const parsePoolData = (pairs?: PoolFields[]) => {
  if (!pairs) {
    return {}
  }
  return pairs.reduce((accum: { [address: string]: FormattedPoolFields }, poolData) => {
    const { volumeUSD, reserveUSD, reserve0, reserve1, token0Price, token1Price } = poolData
    accum[poolData.id] = {
      ...poolData,
      volumeUSD: parseFloat(volumeUSD),
      reserveUSD: parseFloat(reserveUSD),
      reserve0: parseFloat(reserve0),
      reserve1: parseFloat(reserve1),
      token0Price: parseFloat(token0Price),
      token1Price: parseFloat(token1Price),
    }
    return accum
  }, {})
}

interface PoolDatas {
  error: boolean
  data?: {
    [address: string]: PoolData
  }
}

/**
 * Get increase/decrease of value compared to the previous value (e.g. 24h volume compared to 24h volume the day before )
 * @param valueNow - more recent value
 * @param valueBefore - value to compare with
 */
const getAmountChange = (valueNow?: number, valueBefore?: number) => {
  if (valueNow && valueBefore) {
    return valueNow - valueBefore
  }
  if (valueNow) {
    return valueNow
  }
  return 0
}

/**
 * Get increase/decrease of value compared to the previous value as a percentage
 * @param valueNow - more recent value
 * @param valueBefore - value to compare with
 */
const getPercentChange = (valueNow?: number, valueBefore?: number): number => {
  if (valueNow && valueBefore) {
    return ((valueNow - valueBefore) / valueBefore) * 100
  }
  return 0
}

/**
 * Given current value and value 1 and 2 periods (e.g. 1day + 2days, 1week - 2weeks) returns the amount change for latest period
 * and percentage change compared to the previous period.
 * @param valueNow - current value
 * @param valueOnePeriodAgo - value 1 period ago (e.g. 1 day or 1 week ago), period unit must be same as valueTwoPeriodsAgo
 * @param valueTwoPeriodsAgo - value 2 periods ago (e.g. 2 days or 2 weeks ago), period unit must be same as valueOnePeriodAgo
 * @returns amount change for the latest period and percentage change compared to previous period
 */
const getChangeForPeriod = (
  valueNow?: number,
  valueOnePeriodAgo?: number,
  valueTwoPeriodsAgo?: number,
): [number, number] => {
  const currentPeriodAmount = getAmountChange(valueNow, valueOnePeriodAgo)
  const previousPeriodAmount = getAmountChange(valueOnePeriodAgo, valueTwoPeriodsAgo)
  const percentageChange = getPercentChange(currentPeriodAmount, previousPeriodAmount)
  return [currentPeriodAmount, percentageChange]
}

const getBlockSubqueries = (timestamps: number[]) =>
  timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })

const blocksQueryConstructor = (subqueries: string[]) => {
  return gql`query blocks {
    ${subqueries}
  }`
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @param {Array} timestamps
 */

const WEEKS_IN_YEAR = 52.1429;

const usePoolDatas = (poolAddresses: string[]): PoolDatas => {
  const [fetchState, setFetchState] = useState<PoolDatas>({ error: false })
  const [t24h, t48h, t7d, t14d] = useMemo(() => {
    return getDeltaTimestamps()
  }, []);
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h, t7d, t14d])
  const [block24h, block48h, block7d, block14d] = useMemo(() => {
    return blocks ?? [];
  }, [blocks])

  useEffect(() => {
    const fetch = async () => {
      const { error, data } = await fetchPoolData(
        block24h.number,
        block48h.number,
        block7d.number,
        block14d.number,
        poolAddresses,
      )
      if (error) {
        setFetchState({ error: true })
      } else {
        const formattedPoolData = parsePoolData(data?.now)
        const formattedPoolData24h = parsePoolData(data?.oneDayAgo)
        const formattedPoolData48h = parsePoolData(data?.twoDaysAgo)
        const formattedPoolData7d = parsePoolData(data?.oneWeekAgo)
        const formattedPoolData14d = parsePoolData(data?.twoWeeksAgo)

        // Calculate data and format
        const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
          // Undefined data is possible if pool is brand new and didn't exist one day ago or week ago.
          const current: FormattedPoolFields | undefined = formattedPoolData[address]
          const oneDay: FormattedPoolFields | undefined = formattedPoolData24h[address]
          const twoDays: FormattedPoolFields | undefined = formattedPoolData48h[address]
          const week: FormattedPoolFields | undefined = formattedPoolData7d[address]
          const twoWeeks: FormattedPoolFields | undefined = formattedPoolData14d[address]

          const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
            current?.volumeUSD,
            oneDay?.volumeUSD,
            twoDays?.volumeUSD,
          )
          const [volumeUSDWeek, volumeUSDChangeWeek] = getChangeForPeriod(
            current?.volumeUSD,
            week?.volumeUSD,
            twoWeeks?.volumeUSD,
          )

          const liquidityUSD = current ? current.reserveUSD : 0

          const liquidityUSDChange = getPercentChange(current?.reserveUSD, oneDay?.reserveUSD)

          const liquidityToken0 = current ? current.reserve0 : 0
          const liquidityToken1 = current ? current.reserve1 : 0

          const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
            volumeUSD,
            volumeUSDWeek,
            liquidityUSD,
          )

          if (current) {
            accum[address] = {
              address,
              token0: {
                address: current.token0.id,
                name: current.token0.name,
                symbol: current.token0.symbol,
              },
              token1: {
                address: current.token1.id,
                name: current.token1.name,
                symbol: current.token1.symbol,
              },
              token0Price: current.token0Price,
              token1Price: current.token1Price,
              volumeUSD,
              volumeUSDChange,
              volumeUSDWeek,
              volumeUSDChangeWeek,
              totalFees24h,
              totalFees7d,
              lpFees24h,
              lpFees7d,
              lpApr7d,
              liquidityUSD,
              liquidityUSDChange,
              liquidityToken0,
              liquidityToken1,
            }
          }

          return accum
        }, {})
        setFetchState({ data: formatted, error: false })
      }
    }

    const allBlocksAvailable = block24h?.number && block48h?.number && block7d?.number && block14d?.number;

    if (poolAddresses.length > 0 && allBlocksAvailable && !blockError) {
      fetch()
    }
  }, [poolAddresses, block24h, block48h, block7d, block14d, blockError])

  return fetchState
}

const multipliers = {
  820: 0.8,
  199: 0.1
}
const getFarmApr = (
  poolWeight: any,
  soyPriceUsd: any | undefined,
  poolLiquidityUsd: any,
  farmAddress: string | undefined,
  chainId = 820,
  swapApr = 0,
): { cakeRewardsApr: number | null; lpRewardsApr: number } => {
  // console.log(poolWeight, farmAddress);

  const yearlySoyRewardAllocation = 50000000 * (multipliers[chainId as 820] || 0.1) * poolWeight;
  const p = soyPriceUsd || 0;

  let soyRewardsAprAsNumber = null

  if (Boolean(poolLiquidityUsd) /* && soyRewardsApr.isFinite() */) {
    soyRewardsAprAsNumber = yearlySoyRewardAllocation * p / poolLiquidityUsd * 100
  }
  const lpRewardsApr = swapApr //lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
  return { cakeRewardsApr: soyRewardsAprAsNumber, lpRewardsApr }
}

function isNewFarm(pid: number) {
  return Boolean(pid >= 42 && pid <= 52);
}

export default function FarmsPage() {
  const { isConnected: isActive, address: account } = useAccount();
  const { chainId } = useAccount();

  // const pendingRewardV2Fragment = useLocalFarmV2Fragment("pendingReward");

  const [data, setData] = useState<any[] | null>(null);

  const { farmsUserData, setFarmsUserData } = useFarmsUserDataStore();

  const [showActive, setShowActive] = useState(true);
  const [showOnlyStaked, setShowOnlyStaked] = useState(false);

  const [sorting, setSorting] = useState<"hot" | "liquidity" | "apr" | "multiplier">("hot");
  const addresses = useTopPoolAddresses();
  const poolsDatas = usePoolDatas(addresses);

  // const addresses = useTopPoolAddresses();
  // const poolsDatas = usePoolDatas(addresses);

  const [fPrice, setFPrice] = useState<any>(0);
  const [searchRequest, setSearchRequest] = useState("");

  const networkId = useMemo(() => {
    if (chainId === 820 || chainId === 199 || chainId === 61) {
      return chainId;
    }

    return 820;
    // return chainId || 61;
  }, [chainId]);

  const farmsToFetch = useMemo(() => {
    if (!networkId || networkId === 820) {
      return farmsInClo;
    }

    if (networkId === 61) {
      return farmsInEtc;
    }

    return farmsInBtt;
  }, [networkId]);

  useEffect(() => {
    IIFE(async () => {
      let contracts: any[] = [];

      for (let i = 0; i < farmsToFetch.length; i++) {
        const { lpAddress, token, quoteToken, localFarmAddress, pid } = farmsToFetch[i];

        contracts.push({
          abi: LP_TOKEN_ABI,
          address: lpAddress,
          functionName: "getReserves"
        });

        contracts.push({
          address: lpAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [localFarmAddress],
        });

        contracts.push({
          address: lpAddress,
          abi: ERC20_ABI,
          functionName: "totalSupply"
        });

        contracts.push({
          address: localFarmAddress,
          abi: LOCAL_FARM_V2_ABI,
          functionName: "getAllocationX1000"
        });

        contracts.push({
          address: MASTER_CHEF_ADDRESS[networkId],
          abi: MASTERCHEF_ABI,
          functionName: "localFarms",
          args: [pid]
        });
      }

      const data = await multicall(config, {
        contracts,
      });

      if (data) {
        const chunks = [];

        const CALL_ITERATOR = 5;

        for (let i = 0; i < data.length; i += CALL_ITERATOR) {
          const subarray = data.slice(i, i + CALL_ITERATOR) as [
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: [bigint, bigint]; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: any[]; status: "success"; },
          ];
          console.log("SUBARRAY: ", subarray);
          chunks.push(subarray);
        }

        // console.log(chunks);

        const serializedResult = chunks.map((chunk, i) => {
          const [
            { result: poolReserves },
            { result: lpTokenBalance },
            { result: totalSupply },
            { result: allocData },
            { result: multiplierData },
          ] = chunk;

          // console.log("POOL RESERVES: ", poolReserves);

          // let lpTokenRatio;
          let tokenAmountMc;
          let quoteTokenAmountMc;
          let tokenPriceVsQuote;
          let lpTotalInQuoteToken;

          // let poolLiquidity;

          if (poolReserves && lpTokenBalance && totalSupply) {
            if(farmsToFetch[i].pid === 45) {
              console.log("POOL res");
              console.log(poolReserves);
            }

            const [tokenBalance, quoteTokenBalance] = poolReserves;
            // lpTokenRatio = Number(lpTokenBalance) / Number(totalSupply);
            tokenAmountMc = tokenBalance;
            quoteTokenAmountMc = quoteTokenBalance;
            lpTotalInQuoteToken = quoteTokenAmountMc * BigInt(2);
            tokenPriceVsQuote = Number(quoteTokenAmountMc) / Number(tokenAmountMc);
          }
          // if (lpTokenBalance && totalSupply && tokenBalance && quoteTokenBalance) {
          //   poolLiquidity =
          //

          //
          //   tokenAmountMc = Number(tokenBalance) * lpTokenRatio;
          //
          //   quoteTokenAmountMc = Number(quoteTokenBalance) * lpTokenRatio;
          //
          //   lpTotalInQuoteToken = quoteTokenAmountMc * 2;
          //
          //   tokenPriceVsQuote = Number(quoteTokenBalance) / Number(tokenBalance);
          // }

          const poolWeight = allocData ? Number(allocData) / 1000 : 0;

          return {
            ...farmsToFetch[i],
            tokenAmountMc,
            quoteTokenAmountMc,
            // tokenAmountTotal: tokenBalance,
            totalSupply,
            lpTotalInQuoteToken,
            multiplier: multiplierData?.[1] || BigInt(0),
            poolWeight,
            tokenPriceVsQuote,
            lpTokenBalance
          }
        });

        const cloETHFarm = serializedResult.find((f) => f.pid === 45);
        console.log(cloETHFarm);

        const farmsWithPrices = fetchFarmsPrices(serializedResult, chainId as AvailableChains || 820);

        // console.log("FARMS WITH PRICES");
        // console.log(farmsWithPrices);

        //
        const mainFarmPrice = farmsWithPrices.find((farm) => farm.pid === 44)?.token.usdcPrice;
        setFPrice(mainFarmPrice);

        console.log(mainFarmPrice);
        //
        const farmsWithAPR = farmsWithPrices.map((farm) => {
          const poolKey = farm.lpAddress.toLowerCase();
          const farmSwapAPR = poolsDatas.data && poolsDatas.data[poolKey] ? poolsDatas.data[poolKey].lpApr7d : 0

          const { cakeRewardsApr, lpRewardsApr } = getFarmApr(
            Number(farm.poolWeight),
            Number(mainFarmPrice),
            farm.liquidity,
            farm.lpAddress,
            networkId || undefined,
            farmSwapAPR,
          );

          return { ...farm, apr: cakeRewardsApr ? cakeRewardsApr : 0, lpRewardsApr }
        });

        // console.log("FARMS with APR: ", farmsWithAPR);
        setData(farmsWithAPR);
      }
    });
  }, [chainId, farmsToFetch, networkId, poolsDatas.data]);

  const { data: blockNumber } = useBlockNumber({ watch: true });


  useEffect(() => {
    if (!account) {
      return;
    }

    (IIFE(async () => {
      const contracts = [];

      for (let i = 0; i < farmsToFetch.length; i++) {
        const { localFarmAddress, lpAddress } = farmsToFetch[i];

        contracts.push({
          address: localFarmAddress,
          abi: isNewFarm(farmsToFetch[i].pid) ? LOCAL_FARM_V2_ABI : LOCAL_FARM_ABI,
          functionName: "userInfo",
          args: [account]
        });

        contracts.push({
          address: localFarmAddress,
          abi: LOCAL_FARM_ABI,
          functionName: "pendingReward",
          args: [account]
        });

        contracts.push({
          address: lpAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account]
        });
      }

      const data = await multicall(config, {
        contracts
      });

      if (data) {
        const chunks = [];

        for (let i = 0; i < data.length; i += 3) {
          const subarray = data.slice(i, i + 3) as [
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint; status: "success"; },
              { error: Error; result?: undefined; status: "failure"; } | { error?: undefined; result: bigint[]; status: "success"; },
          ];
          chunks.push(subarray);
        }

        const serializedResult = chunks.map((chunk, i) => {
          const [
            { result: userInfoResult },
            { result: pendingRewardResult },
            { result: lpTokenBalanceResult }
          ] = chunk;

          return {
            userInfoResult,
            pendingRewardResult,
            lpTokenBalanceResult
          }
        });

        const res: any = {};

        for (let i = 0; i < farmsToFetch.length; i++) {
          res[farmsToFetch[i].pid] = {
            staked: serializedResult[i].userInfoResult,
            reward: serializedResult[i].pendingRewardResult,
            lpBalance: serializedResult[i].lpTokenBalanceResult
          };
        }
        setFarmsUserData(res);
      }
    }));
  }, [account, farmsToFetch, networkId, setFarmsUserData, blockNumber]);

  const farmsWithSearch = useMemo(() => {
    if (searchRequest && data) {
      return data.filter((farm) => {
        return farm.token.symbol.toLowerCase().startsWith(searchRequest.toLowerCase())
          || farm.quoteToken.symbol.toLowerCase().startsWith(searchRequest.toLowerCase())
      })
    }

    return data;
  }, [data, searchRequest]);

  const filteredFarms = useMemo(() => {
    if (showOnlyStaked && farmsUserData && farmsWithSearch) {
      return farmsWithSearch.filter((farm) => {
        return Boolean(farmsUserData[farm.pid]?.staked[0]);
      });
    }

    return farmsWithSearch;
  }, [farmsWithSearch, showOnlyStaked, farmsUserData]);

  const sortedFarms = useMemo(() => {
    if (!filteredFarms) {
      return null;
    }

    switch (sorting) {
      case "apr":
        const asorted = [...filteredFarms];
        asorted.sort(compareApr);

        return asorted;

      case "multiplier":
        const msorted = [...filteredFarms];
        msorted.sort(compareMultiplier);

        return msorted;

      case "liquidity":
        const lsorted = [...filteredFarms];
        lsorted.sort(compareLiquidity);

        return lsorted;
      default:
        return filteredFarms;
    }

  }, [filteredFarms, sorting]);

  const activeFarms = useMemo(() => {
    if (!sortedFarms) {
      return null;
    }

    return sortedFarms.filter((farm) => Boolean(farm.multiplier));
  }, [sortedFarms]);

  const inactiveFarms = useMemo(() => {
    if (!sortedFarms) {
      return null;
    }

    return sortedFarms.filter((farm) => !Boolean(farm.multiplier));
  }, [sortedFarms]);

  useEffect(() => {
    if (!isActive) {
      setShowOnlyStaked(false);
    }
  }, [isActive]);

  const usdPrices = useUSDPrices();

  return <Container>
    <div className="bg-primary-bg rounded-5 p-5 xl:flex flex-col gap-5 xl:mt-5 border border-primary-border hidden">
      <PageCardHeading title="Soy Finance essentials"/>
      <BannerSlider/>
    </div>
    <div className="bg-primary-bg sm:rounded-5 sm:mt-5 mb-5 p-4 xl:p-5 border-y sm:border border-primary-border">
      <PageCardHeading title="All farms"/>

      <div className="grid grid-cols-1 xl:flex gap-2.5 xl:gap-0 justify-between items-center my-5">
        <div className="flex gap-5 items-center">
          <div className="hidden xl:flex items-center gap-2.5">
            <p className="text-14">Staked only</p>
            <Switch checked={showOnlyStaked} setChecked={() => setShowOnlyStaked(!showOnlyStaked)}/>
          </div>
          <div className="flex border border-primary-border p-[1px] items-center gap-0.5 rounded-2">
            <button
              className={clsx("h-[38px] rounded-1.5 min-w-[100px] px-4", showActive ? "bg-green text-white pointer-events-none" : "text-primary-text hover:bg-green/10")}
              onClick={() => setShowActive(true)}
            >
              Live
            </button>
            <button
              className={clsx("h-[38px] rounded-1.5 min-w-[100px] px-4", !showActive ? "bg-green text-white pointer-events-none" : "text-primary-text hover:bg-green/10")}
              onClick={() => setShowActive(false)}
            >
              Finished
            </button>
          </div>
        </div>
        <div className="grid grid-areas-farms xl:flex items-center gap-2.5">
          <div className="grid-in-sorting flex justify-end">
            <Select options={[
              {
                value: "hot",
                label: "Hot"
              },
              {
                value: "liquidity",
                label: "Liquidity"
              },
              {
                value: "multiplier",
                label: "Multiplier"
              },
              {
                value: "apr",
                label: "APR"
              },
            ]} value={sorting} setValue={setSorting}/>
          </div>
          <div className="w-full grid-in-search">
            <SearchInput value={searchRequest}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchRequest(e.target.value)}
                         placeholder="Name or address"/>
          </div>
          <div className="grid-in-staked flex items-center gap-2.5 text-14 xl:hidden">
            <p className="text-14">Staked only</p>
            <Switch checked={showOnlyStaked} setChecked={() => setShowOnlyStaked(!showOnlyStaked)}/>
          </div>
        </div>
      </div>
      {activeFarms && showActive &&
        <Farms searchRequest={searchRequest} fPrice={fPrice} onlyStaked={showOnlyStaked} farms={activeFarms}
               userData={farmsUserData}/>}
      {inactiveFarms && !showActive &&
        <Farms searchRequest={searchRequest} fPrice={fPrice} onlyStaked={showOnlyStaked} farms={inactiveFarms}
               userData={farmsUserData}/>}

      {!data && <div className="h-[400px] flex justify-center items-center">
        <Preloader size={100} />
      </div>}
    </div>
    <StakeLPTokensModal/>
    <UnStakeLPTokensModal/>
  </Container>
}
