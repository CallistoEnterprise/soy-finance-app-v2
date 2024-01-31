"use client";
import Container from "@/components/atoms/Container";
import LiquidityChart from "@/app/[locale]/liquidity/components/LiquidityChart";
import LiquidityHistory from "@/app/[locale]/liquidity/components/LiquidityHistory";
import Liquidity from "@/app/[locale]/liquidity/components/Liquidity";
import { PropsWithChildren } from "react";
import { useAccount, useChainId } from "wagmi";
import { availableChainIds } from "@/config/networks";
import PageCard from "@/components/PageCard";

function Column({ children }: PropsWithChildren) {
  return <div className="flex flex-col lg:gap-5 min-w-0">
    {children}
  </div>
}

export default function LiquidityPage() {
  const { chainId } = useAccount();

  return <Container>
    <div className="grid grid-cols-1 lg:grid-cols-content mb-5 sm:my-5 lg:gap-5">
      <Column>
        <div className="hidden lg:block"><LiquidityChart/></div>
        <div className="hidden lg:block"><LiquidityHistory/></div>
      </Column>
      <Column>
        <div className="md:w-[492px] md:mx-auto lg:w-auto lg:mx-0">
          {chainId && availableChainIds.includes(chainId) ? <Liquidity/> : <PageCard>
            Current network is not supported
          </PageCard>}
        </div>
      </Column>
    </div>
  </Container>
}
