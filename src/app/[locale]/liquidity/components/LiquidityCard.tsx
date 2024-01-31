import React, { useEffect, useMemo, useState } from "react";
import { Currency, ETHERS, JSBI, Percent, Token, TokenAmount, WETH } from "@callisto-enterprise/soy-sdk";
import Collapse from "../../../../components/atoms/Collapse";
import clsx from "clsx";
import { useAccount, useBalance, useBlockNumber, useReadContract } from "wagmi";
import { ERC20_ABI } from "@/config/abis/erc20";
import Image from "next/image";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import OutlineButtonWithIcon from "@/components/buttons/OutlineButtonWithIcon";
import {
  useRemoveLiquidityAmountsStore,
  useRemoveLiquidityTokensStore
} from "@/app/[locale]/liquidity/stores/useRemoveLiquidityStore";
import { useLiquidityAmountsStore, useLiquidityTokensStore } from "@/app/[locale]/liquidity/stores";
import { IIFE } from "@/other/IIFE";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import { formatUnits } from "viem";

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.chainId])) return ETHERS[token.chainId]
  return token
}

export default function LiquidityCard({ pair, setActiveTab, setContent }: { pair: any, setActiveTab: any, setContent: any }) {
  const { address: account } = useAccount();

  const {setTokenA: setRemoveLiquidityTokenA, setTokenB: setRemoveLiquidityTokenB, setTokenLP: setRemoveLiquidityTokenLP} = useRemoveLiquidityTokensStore();
  const {setAmountA: setRemoveLiquidityAmountA, setAmountB: setRemoveLiquidityAmountB, setAmountLP: setRemoveLiquidityAmountLP} = useRemoveLiquidityAmountsStore();
  const {setTokenA: setAddLiquidityTokenA, setTokenB: setAddLiquidityTokenB} = useLiquidityTokensStore();
  const {setAmountA: setAddLiquidityAmountA, setAmountB: setAddLiquidityAmountB} = useLiquidityAmountsStore();

  const [expanded, setExpanded] = useState<boolean>(false);

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data: userPoolBalance, refetch } = useBalance({
    address: account,
    token: pair.liquidityToken.address,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  // const totalPoolTokens = useTotalSupply(pair.liquidityToken);


  // const { data: userPoolBalance } = useBalance({
  //   address: pair?.liquidityToken.address ? account : undefined,
  //   token: pair?.liquidityToken.address as `0x${string}` | undefined,
  // })

  const { data: totalPoolTokens } = useReadContract({
    address: pair?.liquidityToken.address as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "totalSupply"
  });

  const {data: reserves} = useReadContract({
    address: pair?.liquidityToken.address,
    abi: LP_TOKEN_ABI,
    functionName: "getReserves"
  })


  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && totalPoolTokens >= userPoolBalance.value
      ? new Percent(userPoolBalance.value, totalPoolTokens)
      : undefined;

  const _token0Deposited = useMemo(() => {
    if(!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[0] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  const _token1Deposited = useMemo(() => {
    if(!reserves || !userPoolBalance || !totalPoolTokens) {
      return BigInt(0);
    }

    return reserves[1] * userPoolBalance.value / totalPoolTokens;
  }, [reserves, totalPoolTokens, userPoolBalance]);

  return <div className="rounded-2 border border-primary-border px-5">
    <div className="flex justify-between items-center py-[13px]">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full border border-primary-bg">
          <Image src={pair.tokenAmounts[0].token.logoURI} alt={pair.tokenAmounts[0].token.name} width={32} height={32}/>
        </div>
        <div className="w-8 h-8 rounded-full relative -ml-2 mr-2 border border-primary-bg">
          <Image src={pair.tokenAmounts[1].token.logoURI} alt={pair.tokenAmounts[1].token.name} width={32} height={32}/>
        </div>

        <p className="font-bold text-20">{currency0.symbol} / {currency1.symbol}</p>
      </div>

      <ActionIconButton svgClassname={clsx("duration-200", expanded && "-rotate-180")}
                        onClick={() => setExpanded(!expanded)} icon="arrow-bottom"/>
    </div>
    <Collapse open={expanded}>
      {/*<Divider />*/}
      <div className="flex flex-col gap-2.5 py-5 border-t border-primary-border">
        <div className="flex items-center justify-between">
          <p>Pooled {currency0.symbol}:</p>
          <p>{formatUnits(_token0Deposited, currency0.decimals)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p>Pooled {currency1.symbol}:</p>
          <p>{formatUnits(_token1Deposited, currency1.decimals)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p>Your pool tokens:</p>
          <p>{userPoolBalance ? userPoolBalance.formatted : 0}</p>
        </div>
        <div className="flex items-center justify-between">
          <p>Your pool share:</p>
          <p>{poolTokenPercentage?.toSignificant(2)}</p>
        </div>

        <div className="flex gap-2.5">
          <OutlineButtonWithIcon icon="delete" mode="error" fullWidth onClick={() => {
            setRemoveLiquidityTokenA(pair.tokenAmounts[0].token);
            setRemoveLiquidityTokenB(pair.tokenAmounts[1].token);
            setRemoveLiquidityTokenLP(pair.liquidityToken);
            setRemoveLiquidityAmountA("");
            setRemoveLiquidityAmountB("");
            setRemoveLiquidityAmountLP("");
            setContent("remove");
          }}>Remove</OutlineButtonWithIcon>
          <OutlineButtonWithIcon icon="add-token" fullWidth onClick={() => {
            setAddLiquidityTokenA(pair.tokenAmounts[0].token);
            setAddLiquidityTokenB(pair.tokenAmounts[1].token);
            setAddLiquidityAmountA("");
            setAddLiquidityAmountB("");
            setActiveTab(1);
          }}>Add</OutlineButtonWithIcon>
        </div>
      </div>
    </Collapse>
  </div>;
}
