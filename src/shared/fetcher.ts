import {ChainId} from "@callisto-enterprise/soy-sdk";
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
        ...result,
      }
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

function getUnixTime(date: Date): number {
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

function sub(date: Date | number, duration: Duration): Date {
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

const infoClient = 'https://03.callisto.network/subgraphs/name/soyswap';
const blocksClient = 'https://03.callisto.network/subgraphs/name/blocks';

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

function startOfHour(date: Date): Date {
  const startHour = new Date(date);
  startHour.setMinutes(0);
  startHour.setSeconds(0);
  startHour.setMilliseconds(0);
  return startHour;
}

const utcCurrentTime = getUnixTime(new Date()) * 1000
export const startTimestamp = getUnixTime(startOfHour(sub(utcCurrentTime, timeWindow)))
export const inter = 3600;

export const fetchTokenPriceData = async (
  address: string,
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
    if (!blocks || blocks.length === 0) {
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
        if (chainId === ChainId.MAINNET) {
          tokenPrices.push({
            timestamp,
            derivedCOIN: prices[priceKey]?.derivedCLO ? parseFloat(prices[priceKey].derivedCLO) : 0,
            priceUSD: 0,
          })
        } else if (chainId === ChainId.ETCCLASSICMAINNET) {
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
          if (chainId === ChainId.MAINNET) {
            tokenPrices[tokenPriceIndex].priceUSD = parseFloat(prices[priceKey]?.cloPrice ?? 0) * derivedCOIN
          } else if (chainId === ChainId.ETCCLASSICMAINNET) {
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
