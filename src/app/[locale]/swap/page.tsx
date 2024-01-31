"use client";
import Swap from "@/app/[locale]/swap/components/Swap";
import Container from "@/components/atoms/Container";
import SafeTrading from "@/app/[locale]/swap/components/SafeTrading";
import TradeHistory from "@/app/[locale]/swap/components/TradeHistory";
import TradingChart from "@/app/[locale]/swap/components/TradingChart";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { availableChainIds } from "@/config/networks";
import PageCard from "@/components/PageCard";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import PrimaryButton from "@/components/buttons/PrimaryButton";

const safeTradingMap: {
  [key: string]: {
    score: number,
    link: string
  }
} = {
  SOY: {
    score: 10,
    link: "https://callisto.network/soy-finance-soy-security-audit/"
  },
  BUSDT: {
    score: 9,
    link: "https://callisto.network/bulls-usd-busdt-security-audit/"
  },
  CLOE: {
    score: 9,
    link: "https://docs.soy.finance/soy-products/safelistings/projects-safelisted/callisto-enterprise-token-cloe"
  },
  DOGE: {
    score: 7,
    link: "https://callisto.network/dogecoin-token-doge-security-audit/"
  },
  FTM: {
    score: 9,
    link: "https://callisto.network/fantom-token-security-audit-report/"
  },
  TWT: {
    score: 9,
    link: "https://callisto.network/trust-wallet-token-security-audit-report/"
  },
  LINA: {
    score: 7,
    link: "https://callisto.network/linear-token-security-audit-report/"
  },
  SHIB: {
    score: 9,
    link: "https://callisto.network/shiba-inu-token-security-audit-report/"
  },
  VVT: {
    score: 9,
    link: "https://callisto.network/vipwarz-v2-security-audit-report/"
  },
  ETC: {
    score: 9,
    link: ""
  },
  ETH: {
    score: 9,
    link: ""
  },
  BNB: {
    score: 9,
    link: ""
  }
};

function Column({ children }: PropsWithChildren) {
  return <div className="flex flex-col lg:gap-5 min-w-0">
    {children}
  </div>
}

export default function SwapPage() {
  const { tokenTo, setTokenTo, setTokenFrom } = useSwapTokensStore();
  const { chainId: accountChainId } = useAccount();
  const chainId = useChainId();


  const safeTradingSymbol = useMemo(() => {
    if (!tokenTo || !tokenTo.symbol) {
      return null;
    }

    const symbol = tokenTo.symbol?.replace(/^cc/, "");

    if (safeTradingMap[symbol]) {
      return symbol;
    }

    return null;
  }, [tokenTo]);

  useEffect(() => {
    setTokenTo(null);
    setTokenFrom(null);
  }, [chainId, setTokenFrom, setTokenTo]);

  const {switchChain} = useSwitchChain();

  return <Container>
    <div className="grid grid-cols-1 lg:grid-cols-content mb-5 sm:my-5 lg:gap-5 ">
      <Column>
        <div className="hidden lg:block"><TradingChart/></div>
        <div className="hidden lg:block"><TradeHistory/></div>
      </Column>
      <Column>
        <div className="md:w-[492px] md:mx-auto lg:w-auto lg:mx-0">
          {accountChainId && availableChainIds.includes(accountChainId) && <Swap/>}
          {accountChainId && !availableChainIds.includes(accountChainId) && <PageCard>
            <div className="min-h-[400px] flex flex-col justify-center items-center gap-5">
              <EmptyStateIcon iconName="network" />
              <h2 className="bold text-16 lg:text-20">Swap is not supported via this chain</h2>
              <PrimaryButton onClick={() => switchChain({ chainId: 820 })}>Switch to Callisto</PrimaryButton>
            </div>
          </PageCard>}
          {!accountChainId && <Swap />}
        </div>
        {safeTradingSymbol && <SafeTrading token={tokenTo!} meta={safeTradingMap[safeTradingSymbol]}/>}
      </Column>
    </div>
  </Container>
}
