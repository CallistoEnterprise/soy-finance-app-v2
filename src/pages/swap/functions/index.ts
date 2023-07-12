// computes price breakdown for the trade
import {
  BigintIsh,
  ChainId, Currency,
  CurrencyAmount, ETHERS,
  Fraction,
  JSBI, Pair,
  Percent, Token,
  TokenAmount,
  Trade, WETH
} from "@callisto-enterprise/soy-sdk";
import {isNativeToken} from "../../../shared/utils";
import {Contract, FunctionFragment, Interface} from "ethers";
import {PAIR_INTERFACE} from "../../../shared/config/interfaces";
import MULTICALL_ABI from "../../../shared/constants/abis/interfaces/multicall.json";

export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

export function computeTradePriceBreakdown(
  trade?: Trade | null,
  chainId = ChainId.MAINNET,
): {
  priceImpactWithoutFee: Percent | undefined
  realizedLPFee: CurrencyAmount | undefined | null
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
      trade.route.pairs.reduce<Fraction | BigintIsh>(
        (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT,
      ),
    )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const numerator = priceImpactWithoutFeeFraction?.numerator as BigintIsh;

  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient, chainId))

  return {priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount}
}

export function basisPointsToPercent(num: number): Percent {
  return new Percent(
    JSBI.BigInt(num || 0),
    JSBI.BigInt(10000)
  );
}

export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.minimumAmountOut(pct).toSignificant(4);
}


export function computeSlippageAdjustedAmountsOut(
  trade: Trade | undefined,
  allowedSlippage: number,
): string | undefined {
  const pct = basisPointsToPercent(allowedSlippage * 100);

  return trade?.maximumAmountIn(pct).toSignificant(4);
}

type ExtensionValue = string | number | boolean | null | undefined;

interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]:
      | {
      [key: string]:
        | {
        [key: string]: ExtensionValue;
      }
        | ExtensionValue;
    }
      | ExtensionValue;
  };
}

interface Tags {
  readonly [tagId: string]: {
    readonly name: string;
    readonly description: string;
  };
}

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;

  public readonly tags: TagInfo[];

  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(
      tokenInfo.chainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name
    );
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }

  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

export const WCLO_ADDRESS = "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a";
export const WETC_ADDRESS = "0x35e9A89e43e45904684325970B2E2d258463e072";
export const WBTT_ADDRESS = "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e";

const addresses = {
  199: WBTT_ADDRESS,
  820: WCLO_ADDRESS,
  61: WETC_ADDRESS
}

enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

interface Call {
  address: string
  callData: string
}

export interface CallState {
  readonly valid: boolean
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined
  // true if the result has never been fetched
  readonly loading: boolean
  // true if the result is not for the latest block
  readonly syncing: boolean
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean
}
export interface CallResult {
  readonly valid: boolean
  readonly data: string | undefined
  readonly blockNumber: number | undefined
}

function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHERS[chainId]
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined;
}


function getAddress(address, chainId) {
  if(isNativeToken(address) && addresses[chainId]) {
    return addresses[chainId];
  }

  return address;
}

export type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const SOY: { [chainId: number]: Token } = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
    18,
    "SOY",
    "SoyERC223-Token",
  ),
  [ChainId.CLOTESTNET]: new Token(
    ChainId.CLOTESTNET,
    "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
    18,
    "SOY",
    "SoyERC223-Token",
  ),
  [ChainId.BTTMAINNET]: new Token(
    ChainId.BTTMAINNET,
    "0xcC00860947035a26Ffe24EcB1301ffAd3a89f910",
    18,
    "SOY",
    "SoyERC223-Token",
  ),
  [ChainId.ETCCLASSICMAINNET]: new Token(
    ChainId.ETCCLASSICMAINNET,
    "0xcC67D978Ddf07971D9050d2b424f36f6C1a15893",
    18,
    "SOY",
    "SoyERC223-Token",
  )
};

export const WCLO: { [chainId: number]: Token } = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    18,
    "WCLO",
    "Wrapped CLO"
  ),
  [ChainId.BTTMAINNET]: new Token(
    ChainId.BTTMAINNET,
    "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53",
    18,
    "ccCLO",
    "Wrapped Callisto Coin"
  ),
  [ChainId.ETCCLASSICMAINNET]: new Token(
    ChainId.ETCCLASSICMAINNET,
    "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53",
    18,
    "ccCLO",
    "Wrapped Callisto Coin"
  ),
};
export const BUSDT = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    "0xbf6c50889d3a620eb42C0F188b65aDe90De958c4",
    18,
    "BUSDT",
    "Tether USD"
  ),
  [ChainId.ETCCLASSICMAINNET]: new Token(
    ChainId.ETCCLASSICMAINNET,
    "0xCC48CD0B4a6f50b8f8bf0f9b80eD7881fA547968",
    18,
    "BUSDT",
    "Tether USD"
  ),
  [ChainId.BTTMAINNET]: new Token(
    ChainId.BTTMAINNET,
    "0xCC78D0A86B0c0a3b32DEBd773Ec815130F9527CF",
    18,
    "BUSDT",
    "Tether USD"
  )
};

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET], SOY[ChainId.MAINNET], BUSDT[ChainId.MAINNET]],
  [ChainId.CLOTESTNET]: [WETH[ChainId.CLOTESTNET], SOY[ChainId.CLOTESTNET]],
  [ChainId.ETHEREUM]: [WETH[ChainId.ETHEREUM]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.BSC]: [WETH[ChainId.BSC]],
  [ChainId.BSCTESTNET]: [WETH[ChainId.BSCTESTNET]],
  [ChainId.ETCCLASSICMAINNET]: [WETH[ChainId.ETCCLASSICMAINNET], SOY[ChainId.ETCCLASSICMAINNET], BUSDT[ChainId.ETCCLASSICMAINNET]],
  [ChainId.BTTMAINNET]: [WETH[ChainId.BTTMAINNET], SOY[ChainId.BTTMAINNET], BUSDT[ChainId.BTTMAINNET], WCLO[ChainId.BTTMAINNET]]
};

export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
  [ChainId.CLOTESTNET]: {},
  [ChainId.ETHEREUM]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.KOVAN]: {},
  [ChainId.BSC]: {},
  [ChainId.BSCTESTNET]: {},
  [ChainId.ETCCLASSICMAINNET]: {},
  [ChainId.BTTMAINNET]: {},
};

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

const INVALID_CALL_STATE: CallState = { valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false };

const LOADING_CALL_STATE: CallState = { valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false };


function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | null,
  latestBlockNumber: number | undefined,
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;

  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = (blockNumber ?? 0) < latestBlockNumber;
  let result: Result | undefined;
  if (success && data) {
    try {

      result = contractInterface.decodeFunctionResult(
        fragment,
        data
      );
    } catch (error) {
      console.debug(
        "Result data parsing failed",
        fragment,
        data
      );
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      };
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  };
}

export const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0x8bA3D23241c7044bE703afAF2A728FdBc16f5F6f",
  [ChainId.CLOTESTNET]: "0xDd2742Ba146A57F1F6e8F47235024ba1bd0cf568",
  [ChainId.ETHEREUM]: "",
  [ChainId.RINKEBY]: "",
  [ChainId.KOVAN]: "",
  [ChainId.BSC]: "0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B",
  [ChainId.BSCTESTNET]: "",
  [ChainId.ETCCLASSICMAINNET]: "0x98194aaA67638498547Df929DF4926C7D0DCD135",
  [ChainId.BTTMAINNET]: "0x8dFbdEEeF41eefd92A663a34331db867CA6581AE"
};

const methodName = "getReserves";
const fragment = PAIR_INTERFACE.getFunction(methodName);

async function getPairs(tokens, chainId, web3Provider, blockNumber) {
  const swapPairAddresses = tokens.map(([tokenA, tokenB]) => {
    return tokenA && tokenB ? Pair.getAddress(
      tokenA,
      tokenB
    ) : undefined;
  });

  // console.log(swapPairAddresses);

  const callData: string | undefined = fragment
    ? PAIR_INTERFACE.encodeFunctionData(fragment)
    : undefined;

  const calls: Call[] = fragment && swapPairAddresses && swapPairAddresses.length > 0 && callData
    ? swapPairAddresses.map<Call>((address: string) => {
      return {
        address,
        callData,
      }
    })
    : [];

  const multicallContract: any = new Contract(
    MULTICALL_NETWORKS[chainId],
    MULTICALL_ABI,
    web3Provider
  );

  const [block, returnData] = await multicallContract.aggregate(calls.map((obj) => {
    return [obj.address, obj.callData];
  }));

  const swapCallResults = returnData.map((value) => {
    return {
      valid: true,
      data: value,
      blockNumber: block
    };
  });

  const swapReserveResults = swapCallResults.map((result) => toCallState(
    result,
    PAIR_INTERFACE,
    fragment,
    blockNumber
  ));

  const pairs = swapReserveResults.map((result, i) => {
    const { result: reserves, loading } = result;

    const tokenA = tokens[i]?.[0];
    const tokenB = tokens[i]?.[1];

    if (loading) return [PairState.LOADING, null];
    if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
    if (!reserves) return [PairState.NOT_EXISTS, null];

    const reserve0 = reserves[0];
    const reserve1 = reserves[1];

    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];

    return [
      PairState.EXISTS,
      new Pair(
        new TokenAmount(
          token0,
          reserve0.toString()
        ),
        new TokenAmount(
          token1,
          reserve1.toString()
        )
      ),
    ];
  });

  return pairs;
}

export async function getAllowedPairs(currencyIn, currencyOut, web3Provider, blockNumber, chainId) {
  const common: [Token, Token] = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [];

  const basePairs: [Token, Token][] = common.flatMap(
    (base): [Token, Token][] => common.map((otherBase) => [base, otherBase])
  );

  const [tokenA, tokenB] = [wrappedCurrency(
    currencyIn,
    chainId
  ), wrappedCurrency(
    currencyOut,
    chainId
  )];

  if (!chainId) return [];

  const swapPairCombinations = tokenA && tokenB ? [
    // the direct pair
    [tokenA, tokenB],
    // token A against all bases
    ...common.map((base): [Token, Token] => [tokenA, base]),
    // token B against all bases
    ...common.map((base): [Token, Token] => [tokenB, base]),
    // each base against all bases
    ...basePairs,
  ]
    .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
    .filter(([t0, t1]) => t0.address !== t1.address)
    .filter(([tokenA_, tokenB_]) => {

      const customBases = CUSTOM_BASES[chainId];

      const customBasesA: Token[] | undefined = customBases?.[tokenA_.address];
      const customBasesB: Token[] | undefined = customBases?.[tokenB_.address];

      if (!customBasesA && !customBasesB) return true;

      if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false;
      if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false;

      return true;
    }) : [];

  const tokens = swapPairCombinations.map(([currencyA, currencyB]) => [
    wrappedCurrency(
      currencyA,
      chainId
    ),
    wrappedCurrency(
      currencyB,
      chainId
    ),
  ]);

  const pairs = await getPairs(tokens, chainId, web3Provider, blockNumber);

  const allowedPairs: Pair[] = Object.values(pairs
    // filter out invalid pairs
    .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
    // filter out duplicated pairs
    .reduce<{ [pairAddress: string]: Pair }>(
      (memo, [, curr]) => {
        memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr;
        return memo;
      },
      {}
    ));

  return allowedPairs;
}

export function toTokenAmount(currency, value) {
  return new TokenAmount(
    currency, value
  )
}
