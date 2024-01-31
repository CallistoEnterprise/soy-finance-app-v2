"use client";
import Swap from "@/app/[locale]/swap/components/Swap";
import Container from "@/components/atoms/Container";
import SafeTrading from "@/app/[locale]/swap/components/SafeTrading";
import { tokenListInCLO } from "@/config/token-lists/tokenListInCLO";
import TradeHistory from "@/app/[locale]/swap/components/TradeHistory";
import TradingChart from "@/app/[locale]/swap/components/TradingChart";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useEffect } from "react";

export default function SwapPage() {
  return <Container>
    <div className="grid grid-cols-content my-5 gap-5">
      Staking page
    </div>
  </Container>
}
