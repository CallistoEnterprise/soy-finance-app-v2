import { ChainId, Currency, ETHERS, Pair, Token, TokenAmount, WETH } from "@callisto-enterprise/soy-sdk";
import { multicall } from "@wagmi/core";
import { PAIR_ABI } from "@/config/abis/pair";
import { config } from "@/config/wagmi/config";

function isTruthy<T>(value?: T | undefined | null | false): value is T {
  return !!value
}
export async function getPairs(tokens: (Token | undefined)[][], chainId: number) {
  const swapPairAddresses = tokens.map(([tokenA, tokenB]) => {
    return tokenA && tokenB ? Pair.getAddress(
      tokenA,
      tokenB
    ) : undefined;
  });

  const contracts = swapPairAddresses.filter((pairAddress) => Boolean(pairAddress)).map((pairAddress) => {
    return {
      abi: PAIR_ABI,
      address: pairAddress as `0x${string}`,
      functionName: "getReserves"
    }
  });

  if (contracts.length) {
    const data = await multicall(config, {
      contracts: contracts
    });

    const pairs = data.map((item, index) => {
      const result: any = item.result;

      if (!result || !result[0] || !result[1]) {
        return undefined;
      }

      const reserve0 = result[0];
      const reserve1 = result[1];

      const tokenA = tokens[index][0];
      const tokenB = tokens[index][1];

      if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
        return undefined;
      }

      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];

      return new Pair(
        new TokenAmount(
          token0,
          reserve0.toString()
        ),
        new TokenAmount(
          token1,
          reserve1.toString()
        )
      )
    });

    const filtered = pairs.filter(isTruthy);

    return Object.values(filtered
      // filter out duplicated pairs
      .reduce<{ [pairAddress: string]: Pair }>(
        (memo, curr) => {
          memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr;
          return memo;
        },
        {}
      ));
  }
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

export type ChainTokenList = {
  readonly [key: number]: Token[]
}
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

function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHERS[chainId]
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined;
}

export const CUSTOM_BASES: { [key: number]: { [tokenAddress: string]: Token[] } } = {
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
export default function getAllowedPairs(currencyIn: Token, currencyOut: Token, chainId: number) {
  const common: Token[] = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [];

  const basePairs: [Token, Token][] = common.flatMap(
    (base): [Token, Token][] => common.map((otherBase) => [base, otherBase])
  )

  const [tokenA, tokenB] = [
    wrappedCurrency(
      currencyIn,
      chainId
    ),
    wrappedCurrency(
      currencyOut,
      chainId
    )
  ];

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
  ])

  return getPairs(tokens, chainId);
}
