"use client";
import Container from "@/components/atoms/Container";
import LiquidityChart from "@/app/[locale]/liquidity/components/LiquidityChart";
import LiquidityHistory from "@/app/[locale]/liquidity/components/LiquidityHistory";
import Liquidity from "@/app/[locale]/liquidity/components/Liquidity";
import React, { PropsWithChildren } from "react";
import { useAccount } from "wagmi";
import { availableChainIds } from "@/config/networks";
import PageCard from "@/components/PageCard";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import {useTranslations} from "use-intl";

function Column({ children }: PropsWithChildren) {
  return <div className="flex flex-col lg:gap-5 min-w-0">
    {children}
  </div>
}

export default function LiquidityPage() {
  const t = useTranslations("Liquidity");
  const navT = useTranslations("Navigation");
  const { chainId } = useAccount();
  const {setIsOpened: setConnectWalletOpened} = useConnectWalletDialogStateStore();

  return <Container>
    <div className="grid grid-cols-1 lg:grid-cols-content mb-5 sm:my-5 lg:gap-5">
      <Column>
        <div className="hidden lg:block"><LiquidityChart/></div>
        <div className="hidden lg:block"><LiquidityHistory/></div>
      </Column>
      <Column>
        <div className="md:w-[492px] md:mx-auto lg:w-auto lg:mx-0">
          {chainId && availableChainIds.includes(chainId) ? <Liquidity/> : <PageCard>
            <div className="min-h-[400px] flex flex-col justify-center items-center gap-5">
              <EmptyStateIcon iconName="wallet" />
              <h2 className="bold text-16 lg:text-20 text-center">{t("connect_wallet_to_view_liquidity")}</h2>
              <PrimaryButton onClick={() => setConnectWalletOpened(true)}>{navT("connect_wallet")}</PrimaryButton>
            </div>
          </PageCard>}
        </div>
      </Column>
    </div>
  </Container>
}
