// import {ChainId} from "@callisto-enterprise/soy-sdk";
import {gql, request} from 'graphql-request';

export interface PriceChartEntry {
  time: number
  open: number
  close: number
  high: number
  low: number
}

export const multiQuery = async (
  queryConstructor: (subqueries: string[]) => string,
  subqueries: string[],
  endpoint: string,
  skipCount = 1000,
) => {
  let fetchedData: any = {}
  let allFound = false
  let skip = 0
  try {
    while (!allFound) {
      let end = subqueries.length
      if (skip + skipCount < subqueries.length) {
        end = skip + skipCount
      }
      const subqueriesSlice = subqueries.slice(skip, end)
      // eslint-disable-next-line no-await-in-loop
      const result = await request(endpoint, queryConstructor(subqueriesSlice))
      fetchedData = {
        ...fetchedData,
        // @ts-ignore
        ...result,
      }
      // @ts-ignore
      allFound = Object.keys(result).length < skipCount || skip + skipCount > subqueries.length
      skip += skipCount
    }
    return fetchedData
  } catch (error) {
    console.error('Failed to fetch info data', error)
    return null
  }
}

const chainId = 820;

export function getUnixTime(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export interface Block {
  number: number
  timestamp: string
}

const priceQueryConstructor = (subqueries: string[]) => {
  return gql`
    query tokenPriceData {
      ${subqueries}
    }
  `
}

const blocksQueryConstructor = (subqueries: string[]) => {
  return gql`query blocks {
    ${subqueries}
  }`
}

const getBlockSubqueries = (timestamps: number[]) =>
  timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })

export function sub(date: Date | number, duration: Duration): Date {
  const newDate = new Date(date);
  const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
  newDate.setFullYear(newDate.getFullYear() - years);
  newDate.setMonth(newDate.getMonth() - months);
  newDate.setDate(newDate.getDate() - (weeks * 7) - days);
  newDate.setHours(newDate.getHours() - hours);
  newDate.setMinutes(newDate.getMinutes() - minutes);
  newDate.setSeconds(newDate.getSeconds() - seconds);
  return newDate;
}

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const infoClient = 'https://explorer.callistodao.org/subgraphs/name/soyswap';
const blocksClient = 'https://explorer.callistodao.org/subgraphs/name/blocks';

export const getBlocksFromTimestamps = async (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' = 'desc',
  skipCount = 500,
): Promise<Block[]> => {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData: any = await multiQuery(
    blocksQueryConstructor,
    getBlockSubqueries(timestamps),
    blocksClient,
    skipCount,
  )

  const sortingFunction =
    sortDirection === 'desc' ? (a: Block, b: Block) => b.number - a.number : (a: Block, b: Block) => a.number - b.number

  const blocks: Block[] = []
  if (fetchedData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(fetchedData)) {
      if (fetchedData[key].length > 0) {
        blocks.push({
          timestamp: key.split('t')[1],
          number: parseInt(fetchedData[key][0].number, 10),
        })
      }
    }
    // graphql-request does not guarantee same ordering of batched requests subqueries, hence manual sorting
    blocks.sort(sortingFunction)
  }
  return blocks
}

const coinPrice = 'cloPrice';
const derivedCOIN = 'derivedCLO';

const getPriceSubqueries = (tokenAddress: string, blocks: any) =>
  blocks.map(
    (block: any) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        ${derivedCOIN}
      }
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        ${coinPrice}
      }
    `,
  )

const timeWindow = { weeks: 1 };

export function startOfHour(date: Date): Date {
  const startHour = new Date(date);
  startHour.setMinutes(0);
  startHour.setSeconds(0);
  startHour.setMilliseconds(0);
  return startHour;
}

export const utcCurrentTime = getUnixTime(new Date()) * 1000
export const startTimestamp = getUnixTime(startOfHour(sub(utcCurrentTime, timeWindow)))
export const inter = 3600;

export const fetchTokenPriceData = async (
  address: string | undefined,
  interval: number,
  startTimestamp: number,
): Promise<{
  data?: PriceChartEntry[]
  error: boolean
}> => {
  // Construct timestamps to query against
  const endTimestamp = getUnixTime(new Date())
  const timestamps = []
  let time = startTimestamp
  while (time <= endTimestamp) {
    timestamps.push(time)
    time += interval
  }
  try {
    const blocks = await getBlocksFromTimestamps(timestamps, 'asc', 500)
    if (!blocks || blocks.length === 0 || !address) {
      console.error('Error fetching blocks for timestamps', timestamps)
      return {
        error: false,
      }
    }

    const prices: any | undefined = await multiQuery(
      priceQueryConstructor,
      getPriceSubqueries(address, blocks),
      infoClient,
      200,
    )

    if (!prices) {
      console.error('Price data failed to load')
      return {
        error: false,
      }
    }

    // format token CLO price results
    const tokenPrices: {
      timestamp: string
      derivedCOIN: number
      priceUSD: number
    }[] = []

    // Get Token prices in CLO
    Object.keys(prices).forEach((priceKey) => {
      const timestamp = priceKey.split('t')[1]
      // if its CLO price e.g. `b123` split('t')[1] will be undefined and skip CLO price entry

      if (timestamp) {
        if (chainId === 820) {
          tokenPrices.push({
            timestamp,
            derivedCOIN: prices[priceKey]?.derivedCLO ? parseFloat(prices[priceKey].derivedCLO) : 0,
            priceUSD: 0,
          })
        } else if (chainId === 61) {
          tokenPrices.push({
            timestamp,
            derivedCOIN: prices[priceKey]?.derivedETC ? parseFloat(prices[priceKey].derivedETC) : 0,
            priceUSD: 0,
          })
        }
      }
    })

    // Go through CLO USD prices and calculate Token price based on it
    Object.keys(prices).forEach((priceKey) => {
      const timestamp = priceKey.split('b')[1]
      // if its Token price e.g. `t123` split('b')[1] will be undefined and skip Token price entry
      if (timestamp) {
        const tokenPriceIndex = tokenPrices.findIndex((tokenPrice) => tokenPrice.timestamp === timestamp)
        if (tokenPriceIndex >= 0) {
          const { derivedCOIN } = tokenPrices[tokenPriceIndex]
          if (chainId === 820) {
            tokenPrices[tokenPriceIndex].priceUSD = parseFloat(prices[priceKey]?.cloPrice ?? 0) * derivedCOIN
          } else if (chainId === 61) {
            tokenPrices[tokenPriceIndex].priceUSD = parseFloat(prices[priceKey]?.etcPrice ?? 0) * derivedCOIN
          }
        }
      }
    })

    // graphql-request does not guarantee same ordering of batched requests subqueries, hence sorting by timestamp from oldest to newest
    tokenPrices.sort((a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10))

    const formattedHistory = []

    // for each timestamp, construct the open and close price
    for (let i = 0; i < tokenPrices.length - 1; i++) {
      formattedHistory.push({
        time: parseFloat(tokenPrices[i].timestamp),
        open: tokenPrices[i].priceUSD,
        close: tokenPrices[i + 1].priceUSD,
        high: tokenPrices[i + 1].priceUSD,
        low: tokenPrices[i].priceUSD,
      })
    }

    return { data: formattedHistory, error: false }
  } catch (error) {
    console.error(`Failed to fetch price data for token ${address}`, error)
    return {
      error: true,
    }
  }
}

/**
 * Data for displaying Liquidity and Volume charts on Overview page
 */
const PANCAKE_DAY_DATAS = gql`
  query overviewCharts($startTime: Int!, $skip: Int!) {
    soySwapDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

export interface Block {
  number: number
  timestamp: string
}

export interface ChartEntry {
  date: number
  volumeUSD: number
  liquidityUSD: number
}

/**
 * Formatted type for Candlestick charts
 */
export interface PriceChartEntry {
  time: number
  open: number
  close: number
  high: number
  low: number
}

export enum TransactionType {
  SWAP,
  MINT,
  BURN,
}

export type Transaction = {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0Symbol: string
  token1Symbol: string
  token0Address: `0x${string}`
  token1Address: `0x${string}`
  amountUSD: number
  amountToken0: number
  amountToken1: number
}

export interface ProtocolData {
  volumeUSD: number
  volumeUSDChange: number // in 24h, as percentage

  liquidityUSD: number
  liquidityUSDChange: number // in 24h, as percentage

  txCount: number
  txCountChange: number
}

export interface ProtocolState {
  readonly overview?: ProtocolData

  readonly chartData?: ChartEntry[]

  readonly transactions?: Transaction[]
}

// POOLS

export interface PoolData {
  address: string

  token0: {
    name: string
    symbol: string
    address: string
  }

  token1: {
    name: string
    symbol: string
    address: string
  }

  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  volumeUSDChangeWeek: number

  totalFees24h: number
  totalFees7d: number
  lpFees24h: number
  lpFees7d: number
  lpApr7d: number

  liquidityUSD: number
  liquidityUSDChange: number

  token0Price: number
  token1Price: number

  liquidityToken0: number
  liquidityToken1: number
}

export interface PoolsState {
  byAddress: {
    [address: string]: {
      data?: PoolData
      chartData?: ChartEntry[]
      transactions?: Transaction[]
    }
  }
}

// TOKENS

export type TokenData = {
  exists: boolean

  name: string
  symbol: string
  address: string

  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  txCount: number

  liquidityToken: number
  liquidityUSD: number
  liquidityUSDChange: number

  priceUSD: number
  priceUSDChange: number
  priceUSDChangeWeek: number
}

export interface TokensState {
  byAddress: {
    [address: string]: {
      data?: TokenData
      poolAddresses?: string[]
      chartData?: ChartEntry[]
      priceData: {
        oldestFetchedTimestamp?: number
        [secondsInterval: number]: PriceChartEntry[] | undefined
      }
      transactions?: Transaction[]
    }
  }
}

export interface TokenDayData {
  date: number // UNIX timestamp in seconds
  dailyVolumeUSD: string
  totalLiquidityUSD: string
}

export interface TokenDayDatasResponse {
  tokenDayDatas: TokenDayData[]
}

// Footprint is the same, declared just for better readability
export type PancakeDayData = TokenDayData

export interface PancakeDayDatasResponse {
  soySwapDayDatas: PancakeDayData[]
}

// Info redux state
export interface InfoState {
  protocol: ProtocolState
  pools: PoolsState
  tokens: TokensState
}

const SS_V2_START = 1634494539;

export const mapDayData = (tokenDayData: TokenDayData | PancakeDayData): ChartEntry => ({
  date: tokenDayData.date,
  volumeUSD: parseFloat(tokenDayData.dailyVolumeUSD),
  liquidityUSD: parseFloat(tokenDayData.totalLiquidityUSD),
})

export const getOverviewChartData = async (skip: number): Promise<{ data?: ChartEntry[]; error: boolean }> => {
  try {
    const { soySwapDayDatas } = await request<PancakeDayDatasResponse>(infoClient, PANCAKE_DAY_DATAS, {
      startTime: SS_V2_START,
      skip,
    })
    const data = soySwapDayDatas.map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch overview chart data', error)
    return { error: true }
  }
}

const ONE_DAY_UNIX = 86400;

type PoolOrTokenFetchFn = (skip: number, address: string | undefined) => Promise<{ data?: ChartEntry[]; error: boolean }>
type OverviewFetchFn = (skip: number) => Promise<{ data?: ChartEntry[]; error: boolean }>

export const fetchChartData = async (
  getEntityDayDatas: PoolOrTokenFetchFn | OverviewFetchFn,
  address?: string,
): Promise<{ data?: ChartEntry[]; error: boolean }> => {
  let chartEntries: ChartEntry[] = []
  let error = false
  let skip = 0
  let allFound = false

  while (!allFound) {
    const { data, error: fetchError } = await getEntityDayDatas(skip, address)
    skip += 1000
    // @ts-ignore
    allFound = data.length < 1000
    error = fetchError
    if (data) {
      chartEntries = chartEntries.concat(data)
    }
  }

  if (error || chartEntries.length === 0) {
    return {
      error: true,
    }
  }

  const formattedDayDatas = chartEntries.reduce((accum: { [date: number]: ChartEntry }, dayData) => {
    // At this stage we track unix day ordinal for each data point to check for empty days later
    const dayOrdinal = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
    return {
      [dayOrdinal]: dayData,
      ...accum,
    }
  }, {})

  const availableDays = Object.keys(formattedDayDatas).map((dayOrdinal) => parseInt(dayOrdinal, 10))

  const firstAvailableDayData = formattedDayDatas[availableDays[0]]
  // fill in empty days ( there will be no day datas if no trades made that day )
  let timestamp = firstAvailableDayData?.date ?? SS_V2_START
  let latestLiquidityUSD = firstAvailableDayData?.liquidityUSD ?? 0
  const endTimestamp = getUnixTime(new Date())
  while (timestamp < endTimestamp - ONE_DAY_UNIX) {
    timestamp += ONE_DAY_UNIX
    const dayOrdinal = parseInt((timestamp / ONE_DAY_UNIX).toFixed(0), 10)
    if (!Object.keys(formattedDayDatas).includes(dayOrdinal.toString())) {
      formattedDayDatas[dayOrdinal] = {
        date: timestamp,
        volumeUSD: 0,
        liquidityUSD: latestLiquidityUSD,
      }
    } else {
      latestLiquidityUSD = formattedDayDatas[dayOrdinal].liquidityUSD
    }
  }

  return {
    data: Object.values(formattedDayDatas),
    error: false,
  }
}


const GLOBAL_TRANSACTIONS = gql`
  query overviewTransactions {
    mints: mints(first: 50, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      amount0
      amount1
      amountUSD
    }
    burns: burns(first: 50, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
    },
    swaps: swaps(first: 50, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
  }
`;

const SWAP_TRANSACTIONS = gql`
  query overviewTransactions {
    swaps: swaps(first: 50, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
  }
`;

export const mapMints = (mint: MintResponse) => {
  return {
    type: TransactionType.MINT,
    hash: mint.id.split('-')[0],
    timestamp: mint.timestamp,
    sender: mint.to,
    token0Symbol: mint.pair.token0.symbol,
    token1Symbol: mint.pair.token1.symbol,
    token0Address: mint.pair.token0.id,
    token1Address: mint.pair.token1.id,
    amountUSD: parseFloat(mint.amountUSD),
    amountToken0: parseFloat(mint.amount0),
    amountToken1: parseFloat(mint.amount1),
  }
}

export const mapBurns = (burn: BurnResponse) => {
  return {
    type: TransactionType.BURN,
    hash: burn.id.split('-')[0],
    timestamp: burn.timestamp,
    sender: burn.sender,
    token0Symbol: burn.pair.token0.symbol,
    token1Symbol: burn.pair.token1.symbol,
    token0Address: burn.pair.token0.id,
    token1Address: burn.pair.token1.id,
    amountUSD: parseFloat(burn.amountUSD),
    amountToken0: parseFloat(burn.amount0),
    amountToken1: parseFloat(burn.amount1),
  }
}

export const mapSwaps = (swap: SwapResponse) => {
  return {
    type: TransactionType.SWAP,
    hash: swap.id.split('-')[0],
    timestamp: swap.timestamp,
    sender: swap.from,
    token0Symbol: swap.pair.token0.symbol,
    token1Symbol: swap.pair.token1.symbol,
    token0Address: swap.pair.token0.id,
    token1Address: swap.pair.token1.id,
    amountUSD: parseFloat(swap.amountUSD),
    amountToken0: parseFloat(swap.amount0Out) - parseFloat(swap.amount0In),
    amountToken1: parseFloat(swap.amount1Out) - parseFloat(swap.amount1In),
  }
}

interface PairResponse {
  token0: {
    id: `0x${string}`
    symbol: string
  }
  token1: {
    id: `0x${string}`
    symbol: string
  }
}

export interface MintResponse {
  id: string
  timestamp: string
  pair: PairResponse
  to: string
  amount0: string
  amount1: string
  amountUSD: string
}

export interface SwapResponse {
  id: string
  timestamp: string
  pair: PairResponse
  from: string
  amount0In: string
  amount1In: string
  amount0Out: string
  amount1Out: string
  amountUSD: string
}

export interface BurnResponse {
  id: string
  timestamp: string
  pair: PairResponse
  sender: string
  amount0: string
  amount1: string
  amountUSD: string
}

interface TransactionResults {
  mints: MintResponse[]
  swaps: SwapResponse[]
  burns: BurnResponse[]
}

export const fetchTopTransactions = async (): Promise<{ add: Transaction[], remove: Transaction[], swap: Transaction[] } | undefined> => {
  try {
    const data = await request<TransactionResults>(infoClient, GLOBAL_TRANSACTIONS)

    if (!data) {
      return undefined
    }

    const mints = data.mints.map(mapMints)
    const burns = data.burns.map(mapBurns)
    const swaps = data.swaps.map(mapSwaps)

    return {
      add: mints.sort((a, b) => {
        return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
      }),
      remove: burns.sort((a, b) => {
        return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
      }),
      swap: swaps.sort((a, b) => {
        return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
      })
    }
  } catch {
    return undefined
  }
}

interface PricesResponse {
  current: {
    cloPrice: string
  }
  oneDay: {
    cloPrice: string
  }
  twoDay: {
    cloPrice: string
  }
  oneWeek: {
    cloPrice: string
  }
}

const CLO_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundle(id: "1") {
      cloPrice
    }
    oneDay: bundle(id: "1", block: { number: $block24 }) {
      cloPrice
    }
    twoDay: bundle(id: "1", block: { number: $block48 }) {
      cloPrice
    }
    oneWeek: bundle(id: "1", block: { number: $blockWeek }) {
      cloPrice
    }
  }
`

export const fetchCloPrices = async (
  block24: number,
  block48: number,
  blockWeek: number,
): Promise<{ cloPrices: any | undefined; error: boolean }> => {
  try {
    const data = await request<PricesResponse>(infoClient, CLO_PRICES, {
      block24,
      block48,
      blockWeek,
    })
    return {
      error: false,
      cloPrices: {
        current: parseFloat(data.current?.cloPrice ?? '0'),
        oneDay: parseFloat(data.oneDay?.cloPrice ?? '0'),
        twoDay: parseFloat(data.twoDay?.cloPrice ?? '0'),
        week: parseFloat(data.oneWeek?.cloPrice ?? '0'),
      },
    }
  } catch (error) {
    console.error('Failed to fetch CLO prices', error)
    return {
      error: true,
      cloPrices: undefined,
    }
  }
}

export const fetchTopSwapTransactions = async (): Promise<Transaction[] | undefined> => {
  try {
    const data = await request<TransactionResults>(infoClient, SWAP_TRANSACTIONS)

    if (!data) {
      return undefined
    }

    const swaps = data.swaps.map(mapSwaps)


    return [...swaps].sort((a, b) => {
      return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
    })
  } catch {
    return undefined
  }
}
