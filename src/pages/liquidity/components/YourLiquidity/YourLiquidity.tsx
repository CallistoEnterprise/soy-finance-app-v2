import React, {useCallback, useEffect, useMemo, useState} from "react";
import styles from "./YourLiquidity.module.scss";
import {JSBI, Pair, Token, TokenAmount} from "@callisto-enterprise/soy-sdk";
import {isAddress} from "ethers";
import {usePairs} from "../../../../shared/hooks/usePairs";
import LiquidityCard from "../LiquidityCard";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useAllTokens} from "../../../../shared/hooks/useAllTokens";
import {useErc20Fragment} from "../../../../shared/config/fragments";
import {useMultiCallBalanceOf} from "../../../../shared/web3/hooks/useMultiCallBalanceOf";
import {toCallState} from "../../../../shared/toCallState";
import {ERC_20_INTERFACE} from "../../../../shared/config/interfaces";
import Preloader from "../../../../components/atoms/Preloader";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import NoPool from "../NoPool";
import SelectTokenToFindLiquidity from "../SelectTokenToFindLiquidity";
import NoPoolYet from "../NoPoolYet";
import ConnectWalletToSeeLiquidity from "../ConnectWalletToSeeLiquidity";
import {usePairsWithLiquidity} from "../../models/hooks/usePairsWithLiquidity";
import TokensSelect from "../TokensSelect";
import {useEvent, useStore} from "effector-react";
import {$importTokenA, $importTokenB} from "../../models/stores";
import {setImportTokenA, setImportTokenB} from "../../models";
import Divider from "../../../../components/atoms/Divider";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import tokensListInClo from "../../../../shared/constants/tokenLists/tokenlistInCLO.json";

const BASES_TO_TRACK_LIQUIDITY_FOR = {
  820: [
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a',
      symbol: "CLO",
      name: "CLO",
      decimals: 18,
      logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/2757.png"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65',
      symbol: "SOY",
      name: "Soy-ERC223",
      decimals: 18,
      logoURI: "https://app.soy.finance/images/coins/0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65.png"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xbf6c50889d3a620eb42C0F188b65aDe90De958c4',
      symbol: "BUSDT",
      name: "Bulls USD",
      decimals: 18,
      logoURI: "https://app.soy.finance/images/coins/0xbf6c50889d3a620eb42C0F188b65aDe90De958c4.png"
    }, [])
  ]
}

function getPairOfWrappedTokensByAddress(addressPair: [string, string]) {
  const [addressA, addressB] = addressPair;

  const tokenA = tokensListInClo.tokens.find((t) => t.address === addressA);
  const tokenB = tokensListInClo.tokens.find((t) => t.address === addressB);

  const wrappedTokenA = new WrappedTokenInfo({
    address: addressA,
    decimals: tokenA.decimals,
    chainId: 820,
    name: tokenA.name,
    symbol: tokenA.symbol,
    logoURI: tokenA.logoURI
  }, []);

  const wrappedTokenB = new WrappedTokenInfo({
    address: addressB,
    decimals: tokenA.decimals,
    chainId: 820,
    name: tokenB.name,
    symbol: tokenB.symbol,
    logoURI: tokenB.logoURI
  }, []);

  return [[wrappedTokenA, wrappedTokenB]];
}

export function useTrackedTokenPairs(): [WrappedTokenInfo, WrappedTokenInfo][] {
  const {chainId} = useWeb3();

  const wrappedTokens = useAllTokens();

  const generatedPairs: [WrappedTokenInfo, WrappedTokenInfo][] = useMemo(
    () =>
      chainId
        ? Object.keys(wrappedTokens).flatMap((tokenAddress) => {
          const token = wrappedTokens[tokenAddress]
          // for each token on the current chain,
          return (
            // loop though all bases on the current chain
            (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
              // to construct pairs of the given token with each base
              .map((base) => {
                if (base.address === token.address) {
                  return null
                }
                return [base, token]
              })
              .filter((p): p is [WrappedTokenInfo, WrappedTokenInfo] => p !== null)
          )
        })
        : [],
    [wrappedTokens, chainId],
  )

  const savedSerializedPairs = useMemo(() => {
    return localStorage.getItem("trackedTokenPairs");
  }, []);

  console.log(savedSerializedPairs);

  const userPairs = useMemo(() => {
    if(!savedSerializedPairs) {
      return [];
    }

    console.log(JSON.parse(savedSerializedPairs)[0]);

    return getPairOfWrappedTokensByAddress(JSON.parse(savedSerializedPairs)["820"][0]);
  }, [savedSerializedPairs]);

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs),
    [generatedPairs, userPairs],
  );

  console.log(combinedList);

  return useMemo(() => {
    const keyed = combinedList.reduce<{ [key: string]: [WrappedTokenInfo, WrappedTokenInfo] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}

export function toV2LiquidityToken([tokenA, tokenB]: [WrappedTokenInfo, WrappedTokenInfo]): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, 'SOY-LP', 'soyfinance LPs')
}

export function usePairBalances(pairs, addresses, validatedTokens) {
  const [pairBalances, setPairBalances] = useState([]);

  const {account} = useWeb3();

  const fragment = useErc20Fragment("balanceOf")
  const {loading, result} = useMultiCallBalanceOf({addresses});

  useEffect(() => {
    if (!fragment || loading) {
      return;
    }
    const {returnData, resultsBlockNumber} = result;

    const serializedReturnData = returnData.map((item) => {
      return {
        valid: true,
        data: item,
        blockNumber: resultsBlockNumber
      }
    });

    const req = serializedReturnData.map((result) => toCallState(result, ERC_20_INTERFACE, fragment, resultsBlockNumber))

    const ldd = validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
      const value = req?.[i]?.result?.[0]
      const amount = value ? JSBI.BigInt(value.toString()) : undefined
      if (amount) {
        memo[token.address] = new TokenAmount(token, amount)
      }
      return memo
    }, {})

    setPairBalances(ldd);

  }, [fragment, pairs, addresses, validatedTokens, account, loading, result]);

  return pairBalances;
}

export default function YourLiquidity({setActiveTab}) {
  const {isActive} = useWeb3();

  const [content, setContent] = useState<"pools" | "import">("pools");

  const {pairsWithLiquidity, loading} = usePairsWithLiquidity();

  console.log(pairsWithLiquidity);

  const tokens = useAllTokens();

  const handleImportPool = useCallback(() => {
    setContent("import");
  }, []);

  const importTokenA = useStore($importTokenA);
  const importTokenB = useStore($importTokenB);

  const setImportTokenAFn = useEvent(setImportTokenA);
  const setImportTokenBFn = useEvent(setImportTokenB);

  const currencyPair = useMemo(() => {
    if(!importTokenA || !importTokenB) {
      return [];
    }

    return [[importTokenA, importTokenB]]
  }, [importTokenA, importTokenB]);


  const tokenPairsWithLiquidityTokens = useMemo(
    () => {

      return currencyPair.map((tokens) => ({liquidityToken: toV2LiquidityToken(tokens), tokens}))

    },[currencyPair]
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const validatedTokens: WrappedTokenInfo[] = useMemo(
    () => liquidityTokens.filter((t?: Token): t is WrappedTokenInfo => isAddress(t?.address) !== false) ?? [],
    [liquidityTokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const pairBalances = usePairBalances(currencyPair, validatedTokenAddresses, validatedTokens);

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({liquidityToken}) =>
        pairBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, pairBalances],
  );

  const importPair = usePairs(currencyPair);

  const userPoolBalance = useBalanceOf(importPair?.[0]?.[1]?.liquidityToken || null);

  if (!isActive) {
    return <ConnectWalletToSeeLiquidity/>
  }

  if (loading) {
    return <div className={styles.preloaderWrapper}>
      <Preloader size={80} withLogo={false}/>
    </div>
  }

  if (!pairsWithLiquidity.length && content === "pools") {
    return <NoPoolYet onClick={() => setContent("import")}/>
  }

  return <div>
    {content === "pools" && <>
       <div>
          <PageCardHeading title="Your active liquidity"/>
          <div className={styles.cards}>{
            pairsWithLiquidity.map((pair) => {
              return <LiquidityCard setActiveTab={setActiveTab} key={pair.liquidityToken.address} pair={pair}/>
            })
          }</div>
          <Text variant={16} color="secondary">
            If you do not see the pool that you have joined, you can <Button onClick={handleImportPool} variant="text">import
            it</Button>.
            <br/>Or in case you have staked your LP tokens in the farm, you can unstake them to view them in this
            section.
          </Text>
        </div>
    </>}

    {content === "import" && <>
      <div className={styles.importHeader}>
        <IconButton onClick={() => {
          setContent("pools");
        }}>
          <Svg iconName="back"/>
        </IconButton>
        <PageCardHeading title="Import pool"/>
      </div>

      <TokensSelect pickedToken={importTokenA} onPick={(token) => setImportTokenAFn(token)} tokens={tokens} />
      <div className={styles.middleIcon}>
        <Svg iconName="add-token" />
      </div>
      <TokensSelect pickedToken={importTokenB} onPick={(token) => setImportTokenBFn(token)} tokens={tokens} />

      {(!importTokenA || !importTokenB) && <SelectTokenToFindLiquidity height={366}/>}

      {importTokenA && importTokenB && !liquidityTokensWithBalances.length && <NoPool onClick={() => setActiveTab(0)} height={366}/>}

      {importTokenA && importTokenB && liquidityTokensWithBalances.length ? <div className={styles.poolToImport}>
        <div className={styles.poolToImportHeader}>
          <div className={styles.poolLogos}>
            <img src={importTokenA.logoURI} alt=""/>
            <img src={importTokenB.logoURI} alt=""/>
          </div>
          <Text weight={700}>{importTokenA.symbol}/{importTokenB.symbol}</Text>
        </div>
        <Divider />
        <div className={styles.poolToImportInfo}>
          Your pool tokens: {userPoolBalance?.toSignificant(6)}
        </div>

        <Button fullWidth onClick={() => {
          localStorage.setItem("trackedTokenPairs", JSON.stringify({
            820: [[importTokenA?.address, importTokenB?.address]]
          }))
        }}>Import pool</Button>
      </div> : null}
    </>}
  </div>;
}
