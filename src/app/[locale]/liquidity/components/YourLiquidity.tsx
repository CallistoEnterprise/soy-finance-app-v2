import PageCardHeading from "@/components/PageCardHeading";
import React, { useMemo, useState } from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import Svg from "@/components/atoms/Svg";
import LiquidityCard from "@/app/[locale]/liquidity/components/LiquidityCard";
import {
  toV2LiquidityToken,
  usePairBalances,
  usePairsWithLiquidity
} from "@/app/[locale]/liquidity/hooks/usePairsWithLiquidity";
import Preloader from "@/components/atoms/Preloader";
import Image from "next/image";
import { WrappedToken } from "@/config/types/WrappedToken";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import { useImportPoolStore } from "@/app/[locale]/liquidity/stores/useImportPoolStore";
import { Address, formatUnits, isAddress } from "viem";
import usePair from "@/hooks/usePair";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import InfoRow from "@/components/InfoRow";
import { ERC20_ABI } from "@/config/abis/erc20";
import { Percent, Token, TokenAmount } from "@callisto-enterprise/soy-sdk";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { useTrackedPoolsStore } from "@/app/[locale]/liquidity/stores/useTrackedPoolsStore";
import { useTrackedPools } from "@/app/[locale]/liquidity/hooks/useTrackedPools";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import RemoveLiquidity from "@/app/[locale]/liquidity/components/RemoveLiquidity";
import { useLiquidityAmountsStore, useLiquidityTokensStore } from "@/app/[locale]/liquidity/stores";

function SelectContent({ token }: { token: WrappedToken }) {
  return <div className="flex items-center gap-2 h">
    <Image src={token.logoURI} width={24} height={24} alt={token.name || ""}/>
    {token.symbol}
  </div>
}

interface _Props {
  height?: number
}

function ConnectWalletToSeeLiquidity({ height = 578 }: _Props) {
  return <div style={{ height }} className="flex justify-center items-center flex-col gap-1">
    <EmptyStateIcon iconName="wallet"/>
    <div className="max-w-[350px] text-center mt-1.5 mb-5">
      <p className="text-center font-bold text-24">
        Connect to a wallet to view your liquidity</p>
    </div>

    <PrimaryButton>Connect wallet</PrimaryButton>
  </div>;
}

function SelectTokenToFindLiquidity({ height }: _Props) {
  return <div style={{ height }} className="flex justify-center items-center flex-col gap-1">
    <EmptyStateIcon iconName="drop"/>
    <div className="max-w-[350px] text-center mt-2.5 mb-5">
      <p className="text-center font-bold text-24">
        Select a token to find your liquidity
      </p>
    </div>

    <p className="text-center text-secondary-text">Select the liquidity pair you are looking for</p>
  </div>
}

interface PropsNoPool {
  height?: number,
  onClick: any
}

function NoPoolYet({ height = 578, onClick }: PropsNoPool) {
  return <div style={{ height }} className="flex justify-center items-center flex-col gap-1">
    <EmptyStateIcon iconName="liquidity"/>
    <div className="max-w-[350px] text-center mt-1.5 mb-5">
      <p className="text-center font-bold text-24">
        No Active Liquidity Pools
      </p>
    </div>

    <p className="text-center text-secondary-text">Don&apos;t see a pool you joined?</p>
    <div className="mt-4">
      <PrimaryButton onClick={onClick}>Find other LP tokens</PrimaryButton>
    </div>
  </div>;
}

function NoPool({ height, onClick }: PropsNoPool) {
  return <div style={{ height }} className="flex justify-center items-center flex-col gap-1">
    <EmptyStateIcon iconName="search"/>
    <div className="max-w-[350px] text-center mt-1.5">
      <p className="text-center font-bold text-24">
        You don’t have liquidity in this pool yet
      </p>
    </div>

    <div className="mt-1">
      <button className="text-green hover:text-green-saturated duration-200" onClick={onClick}>Add liquidity</button>
    </div>
  </div>;
}

export default function YourLiquidity({ setActiveTab }: { setActiveTab: any }) {
  const [content, setContent] = useState<"pools" | "import" | "remove">("pools");

  const [isPickTokenOpened, setPickOpened] = useState(false);
  const [context, setContext] = useState<"set-token-a" | "set-token-b">("set-token-a");
  const { address } = useAccount();
  const { tokenA, tokenB, setTokenA, setTokenB } = useImportPoolStore();

  const { pairsWithLiquidity, loading } = usePairsWithLiquidity();
  const { isConnected } = useAccount();

  const { importPool } = useTrackedPools();
  const { chainId } = useAccount();

  const {setTokenA: setAddLiquidityTokenA, setTokenB: setAddLiquidityTokenB} = useLiquidityTokensStore();
  const {setAmountA: setAddLiquidityAmountA, setAmountB: setAddLiquidityAmountB} = useLiquidityAmountsStore();

  const currencyPair = useMemo(() => {
    if (!tokenA || !tokenB) {
      return [];
    }

    return [[tokenA, tokenB]]
  }, [tokenA, tokenB]);


  const tokenPairsWithLiquidityTokens = useMemo(
    () => {
      if (tokenA && tokenB) {
        return currencyPair.map((tokens) => ({ liquidityToken: toV2LiquidityToken([tokenA, tokenB]), tokens }))
      }

      return []

    }, [currencyPair, tokenA, tokenB]
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const validatedTokens: Token[] = useMemo(
    () => liquidityTokens.filter((t: Token) => isAddress(t.address) !== false) ?? [],
    [liquidityTokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  const pairBalances = usePairBalances({
    pairs: currencyPair,
    addresses: validatedTokenAddresses,
    validatedTokens: validatedTokens
  });

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        pairBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, pairBalances],
  );

  const importPair = usePair({ tokenA, tokenB });

  const { data: userPoolBalance } = useBalance({
    address: address,
    token: importPair?.liquidityToken.address as Address,
  });

  const { data: totalPoolTokens } = useReadContract({
    address: importPair?.liquidityToken.address as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "totalSupply"
  });

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && totalPoolTokens >= userPoolBalance.value
      ? new Percent(userPoolBalance.value, totalPoolTokens)
      : undefined

  const { data: reserves } = useReadContract({
    address: importPair?.liquidityToken.address as Address | undefined,
    abi: LP_TOKEN_ABI,
    functionName: "getReserves"
  });

  const token0Deposited = useMemo(() => {
    if (!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[0] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  const token1Deposited = useMemo(() => {
    if (!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[1] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  if (!isConnected) {
    return <ConnectWalletToSeeLiquidity/>
  }

  if (loading) {
    return <div className="h-[578px] flex justify-center items-center">
      <Preloader size={80}/>
    </div>
  }

  if (!pairsWithLiquidity.length && content === "pools") {
    return <NoPoolYet onClick={() => setContent("import")}/>
  }

  return <div>
    {content === "pools" && <>
      <div>
        <PageCardHeading title="Your active liquidity"/>
        <div className="flex flex-col gap-2.5 mt-5 mb-2.5">{
          pairsWithLiquidity.map((pair) => {
            return <LiquidityCard setContent={setContent} setActiveTab={setActiveTab} key={pair.liquidityToken.address}
                                  pair={pair}/>
          })
        }</div>
        <p className="text-secondary-text text-16">
          If you do not see the pool that you have joined, you can <button
          className="text-green hover:text-green-saturated duration-200" onClick={() => setContent("import")}>import
          it</button>.
          <br/>Or in case you have staked your LP tokens in the farm, you can unstake them to view them in this
          section.
        </p>
      </div>
    </>}

    {content === "import" && <>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => {
          setContent("pools");
        }}>
          <Svg iconName="back"/>
        </button>
        <PageCardHeading title="Import pool"/>
      </div>


      <div className="flex flex-col gap-2.5 xl:gap-5 ">
        <button
          className="hover:border-green duration-200 border flex justify-between items-center border-primary-border w-full pl-5 pr-4 py-[7px] rounded-2"
          onClick={() => {
            setPickOpened(true);
            setContext("set-token-a");
          }}>
          {tokenA ? <SelectContent token={tokenA}/> : "Select token"}
          <Svg iconName="arrow-bottom"/>
        </button>
        <div className="flex justify-center">
          <RoundedIconButton icon="add-token" disabled/>
        </div>
        <button
          className="hover:border-green duration-200 border flex justify-between items-center border-primary-border w-full pl-5 pr-4 py-[7px] rounded-2"
          onClick={() => {
            setPickOpened(true);
            setContext("set-token-b");
          }}>
          {tokenB ? <SelectContent token={tokenB}/> : "Select token"}
          <Svg iconName="arrow-bottom"/>
        </button>
      </div>

      <PickTokenDialog
        pickToken={(token) => {
          if (context === "set-token-a") {
            setTokenA(token);

          }

          if (context === "set-token-b") {
            setTokenB(token);
          }

          setPickOpened(false);
        }}
        isOpen={isPickTokenOpened}
        setIsOpen={setPickOpened}
      />

      {(!tokenA || !tokenB) && <SelectTokenToFindLiquidity height={287}/>}

      {tokenA && tokenB && !liquidityTokensWithBalances.length && <NoPool onClick={() => {
        setAddLiquidityTokenA(tokenA);
        setAddLiquidityTokenB(tokenB);
        setAddLiquidityAmountA("");
        setAddLiquidityAmountB("");
        setActiveTab(1);
      }} height={287}/>}

      {tokenA && tokenB && liquidityTokensWithBalances.length ?
        <div className="py-3.5 px-5 border border-primary-border rounded-2 mt-5">
          <div className="flex items-center gap-2 mb-4 border-b border-primary-border pb-3.5">
            <div className="flex items-center">
              <img src={tokenA.logoURI} alt=""/>
              <img src={tokenB.logoURI} alt=""/>
            </div>
            <p className="font-bold">{tokenA.symbol} / {tokenB.symbol}</p>
          </div>
          <div className="my-5 flex flex-col gap-2.5">
            <InfoRow label={`Pooled ${tokenA.symbol}`} value={formatUnits(token0Deposited, tokenA.decimals)}/>
            <InfoRow label={`Pooled ${tokenB.symbol}`} value={formatUnits(token1Deposited, tokenB.decimals)}/>
            <InfoRow label="Your pool tokens" value={userPoolBalance ? userPoolBalance.formatted : 0}/>
            <InfoRow label="Your pool share" value={poolTokenPercentage?.toSignificant(2)}/>
          </div>

          <PrimaryButton fullWidth onClick={() => {
            importPool({ chainId: chainId || null, pair: [tokenA?.address || "", tokenB?.address || ""] });
            setContent("pools");
          }}>Import pool</PrimaryButton>
        </div> : null}
    </>}

    {content === "remove" && <RemoveLiquidity setContent={setContent}/>}
  </div>
}
