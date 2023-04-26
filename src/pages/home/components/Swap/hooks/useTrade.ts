import {useCallback, useEffect, useState} from "react";
import {ChainId, Currency, ETHERS, Pair, Token, TokenAmount, Trade, WETH} from "@callisto-enterprise/soy-sdk";
import {Contract, parseUnits} from "ethers";
import MULTICALL_ABI from "../../../../../shared/abis/multicall.json";
import {isNativeToken} from "../../../../../shared/utils";
import {FunctionFragment, Interface} from "@ethersproject/abi";
import IUniswapV2PairABI from "../../../../../shared/abis/IUniswapV2Pair.json";
import {useEvent, useStore} from "effector-react";
import {$swapInputData, $trade} from "../models/stores";
import {SwapVariant} from "../models/types";
import {useWeb3} from "../../../../../processes/web3/hooks/useWeb3";
import {useBlockNumber} from "../../../../../shared/hooks/useBlockNumber";
import {setAmountIn, setAmountOut, setRoute, setTrade} from "../models";

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

const CLO = {
  "token_address":"0x0000000000000000000000000000000000000001",
  "original_name":"CLO",
  "decimal_token":18,
  "imgUri":"https://s2.coinmarketcap.com/static/img/coins/64x64/2757.png"
};
export const WCLO_ADDRESS = "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a";


const BTT = {
  "token_address":"0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3",
  "original_name":"ccBTT",
  "decimal_token":18,
  "imgUri":"https://s2.coinmarketcap.com/static/img/coins/64x64/16086.png"
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


function getAddress(address) {
  if(isNativeToken(address)) {
    return WCLO_ADDRESS;
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
  fragment: FunctionFragment | undefined,
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

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI);
const methodName = "getReserves";
const fragment = PAIR_INTERFACE.getFunction(methodName);

export async function getAllowedPairs(currencyIn, currencyOut, web3Provider, blockNumber) {

  const common = BASES_TO_CHECK_TRADES_AGAINST["820"] ?? [];

  const basePairs: [Token, Token][] = common.flatMap(
    (base): [Token, Token][] => common.map((otherBase) => [base, otherBase])
  );

  const [tokenA, tokenB] = [wrappedCurrency(
    currencyIn,
    820
  ), wrappedCurrency(
    currencyOut,
    820
  )];

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

      const customBases = CUSTOM_BASES["820"];

      const customBasesA: Token[] | undefined = customBases?.[tokenA_.address];
      const customBasesB: Token[] | undefined = customBases?.[tokenB_.address];

      if (!customBasesA && !customBasesB) return true;

      if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false;
      if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false;

      return true;
    }) : [];

  console.log("FOUR");

  const tokens = swapPairCombinations.map(([currencyA, currencyB]) => [
    wrappedCurrency(
      currencyA,
      ChainId.MAINNET
    ),
    wrappedCurrency(
      currencyB,
      ChainId.MAINNET
    ),
  ]);


  const swapPairAddresses = tokens.map(([tokenA, tokenB]) => {
    return tokenA && tokenB ? Pair.getAddress(
      tokenA,
      tokenB
    ) : undefined;
  });

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

  console.log("FIVE");


  const multicallContract: any = new Contract(
    "0x8bA3D23241c7044bE703afAF2A728FdBc16f5F6f",
    MULTICALL_ABI,
    web3Provider
  );

  const [block, returnData] = await multicallContract.aggregate(calls.map((obj) => {
    return [obj.address, obj.callData];
  }));

  console.log(returnData);


  const swapCallResults = returnData.map((value) => {
    return {
      valid: true,
      data: value,
      blockNumber: block
    };
  });

  console.log(swapCallResults);

  const swapReserveResults = swapCallResults.map((result) => toCallState(
    result,
    PAIR_INTERFACE,
    fragment,
    blockNumber
  ));

  console.log(swapReserveResults);

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

  console.log(pairs);

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

function toCurrency(token) {
  return new WrappedTokenInfo({
      chainId: ChainId.MAINNET,
      address: getAddress(token.token_address),
      decimals: token.decimal_token,
      symbol: token.original_name,
      name: token.original_name,
    },
    []
  );
}

function toTokenAmount(currency, value) {
  return new TokenAmount(
    currency, value
  )
}

export function useTrade() {
  const { web3Provider } = useWeb3();
  const blockNumber = useBlockNumber();
  const swapInputData = useStore($swapInputData);

  const setAmountInFn = useEvent(setAmountIn);
  const setAmountOutFn = useEvent(setAmountOut);

  const setTradeFn = useEvent(setTrade);
  const setRouteFn = useEvent(setRoute);
  console.log(swapInputData);
  console.log(web3Provider);
  console.log(blockNumber);


  const recalculateTradeIn = useCallback(async (amount, token, tokenB = null) => {
    const tokenTo = tokenB || swapInputData.tokenTo;

    if(!amount) {
      setAmountOutFn("");
      return;
    }

    if(!token || !tokenTo || !web3Provider || !blockNumber) {
      return null;
    }

      const currencyIn = toCurrency(token);
      const currencyOut = toCurrency(tokenTo);


      const typedValueParsed = parseUnits(
        amount,
        token.decimal_token
      ).toString();

      const currencyAmountIn = toTokenAmount(currencyIn, typedValueParsed);

      const allowedPairs = await getAllowedPairs(currencyIn, currencyOut, web3Provider, blockNumber);

      const trade1 = Trade.bestTradeExactIn(
        allowedPairs,
        currencyAmountIn,
        currencyOut,
        {
          maxHops: 3, maxNumResults: 1
        }
      );

      if(trade1[0]) {
        setAmountOutFn(trade1[0].outputAmount.toSignificant());
        setTradeFn(trade1[0]);
        setRouteFn(trade1[0].route);
        return;
      }

    setTradeFn(null);
    setRouteFn(null);

  }, [swapInputData.tokenTo, web3Provider, blockNumber]);

  const recalculateTradeOut = useCallback(async (amount, token, tokenB = null) => {
    const tokenFrom = tokenB || swapInputData.tokenFrom;

    if(!amount) {
      setAmountInFn("");
      return;
    }

    if(!tokenFrom || !token || !web3Provider || !blockNumber) {
      return null;
    }

    const currencyIn = toCurrency(tokenFrom);
    const currencyOut = toCurrency(token);

    const typedValueParsed = parseUnits(
      amount,
      token.decimal_token
    ).toString();

    const currencyAmountOut = toTokenAmount(currencyOut, typedValueParsed);

    const allowedPairs = await getAllowedPairs(currencyIn, currencyOut, web3Provider, blockNumber);

    const trade1 = Trade.bestTradeExactOut(
      allowedPairs,
      currencyIn,
      currencyAmountOut,
      {
        maxHops: 3, maxNumResults: 1
      }
    );

    console.log(trade1);
    if(trade1[0]) {
      setAmountInFn(trade1[0].inputAmount.toSignificant());
      setTradeFn(trade1[0]);
      setRouteFn(trade1[0].route);
      return;
    }

    setTradeFn(null);
    setRouteFn(null);

  }, [swapInputData.tokenFrom, web3Provider, blockNumber]);

  return {recalculateTradeIn, recalculateTradeOut};
}
