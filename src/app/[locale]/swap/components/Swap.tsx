import React, { useEffect, useMemo } from "react";
import TransactionSettingsDialog from "@/components/dialogs/TransactionSettingsDialog";
import { useState } from "react";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import PageCard from "@/components/PageCard";
import {
  useSwapAmountsStore,
  useSwapTokensStore,
  useTradeStore,
  useTransactionSettingsStore
} from "@/app/[locale]/swap/stores";
import TokenSelector from "@/components/TokenSelector";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import useTrade from "@/app/[locale]/swap/hooks/useTrade";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/confirm";
import ConfirmSwapDialog from "@/app/[locale]/swap/components/ConfirmSwapDialog";
import InfoRow from "@/components/InfoRow";
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  ONE_BIPS
} from "@/app/[locale]/swap/components/functions";
import RoutePath from "@/components/RoutePath";
import Drawer from "@/components/atoms/Drawer";
import TradingChart from "@/app/[locale]/swap/components/TradingChart";
import TradeHistory from "@/app/[locale]/swap/components/TradeHistory";
import SafeTrading from "@/app/[locale]/swap/components/SafeTrading";
import { useMediaQuery } from "react-responsive";
import { useAccount, useBalance, useBlockNumber, useChainId } from "wagmi";
import { isNativeToken } from "@/other/isNativeToken";
import useAllowance from "@/hooks/useAllowance";
import { ROUTER_ADDRESS } from "@/config/addresses/router";
import addToast from "@/other/toast";
import { safeTradingMap } from "@/config/safe-trading";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import {useTranslations} from "use-intl";



function SwapActionButton() {
  const t = useTranslations("Swap");
  const toastT = useTranslations("Toast");

  const { setSwapConfirmDialogOpened } = useConfirmSwapDialogStore();
  const {isConnected, address} = useAccount();
  const { amountIn, amountOut } = useSwapAmountsStore();
  const {tokenFrom, tokenTo} = useSwapTokensStore();
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const {setIsOpened: setWalletConnectOpened} = useConnectWalletDialogStateStore();

  const { data, refetch } = useBalance({
    address: tokenFrom ? address : undefined,
    token: tokenFrom
      ? isNativeToken(tokenFrom?.address)
        ? undefined
        : tokenFrom.address as `0x${string}`
      : undefined,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const { chainId } = useAccount();

  const {isAllowed, writeTokenApprove} = useAllowance({
    contractAddress: chainId ? ROUTER_ADDRESS[chainId] : undefined,
    amountToCheck: amountIn,
    token: tokenFrom
  })

  const isEnoughBalance = useMemo(() => {
    if(!data || !amountIn || !tokenFrom) {
      return false
    }

    return data.value >= amountIn;
  }, [amountIn, data, tokenFrom]);

  if(!isConnected) {
    return <PrimaryButton onClick={() => setWalletConnectOpened(true)} fullWidth>
      {t("connect_wallet")}
    </PrimaryButton>
  }

  if(!amountIn) {
    return <PrimaryButton fullWidth disabled>{t("enter_amount")}</PrimaryButton>
  }

  if(!tokenTo || !tokenFrom) {
    return <PrimaryButton fullWidth disabled>{t("select_tokens_to_swap")}</PrimaryButton>
  }

  if(!isEnoughBalance) {
    return <PrimaryButton fullWidth disabled>{t("insufficient_amount")}</PrimaryButton>
  }

  if(!isAllowed) {
    return <PrimaryButton onClick={() => {
      if(writeTokenApprove){
        writeTokenApprove();
      } else {
        addToast(toastT("something_went_wrong"), "error");
      }
    }} fullWidth>Approve {tokenFrom.symbol}</PrimaryButton>
  }

  return <PrimaryButton fullWidth onClick={() => {
    setSwapConfirmDialogOpened(true);
  }}>{t("swap")}</PrimaryButton>
}
export default function Swap() {
  const t = useTranslations('Swap');
  const [isSettingsOpened, setSettingsOpened] = useState(false);

  const { tokenTo, tokenFrom, setTokenFrom, setTokenTo } = useSwapTokensStore();
  const { amountInString, amountOutString } = useSwapAmountsStore();

  const [pickDialogContext, setPickDialogContext] = useState("token-to");
  const [isPickTokenOpened, setPickOpened] = useState(false);

  const { slippage } = useTransactionSettingsStore();
  const { trade } = useTradeStore();

  const {
    handleAmountInChange,
    handleAmountOutChange,
    handleTokenFromChange,
    handleTokenToChange,
    handleSwitch
  } = useTrade();

  const [mobileChartOpened, setMobileChartOpened] = useState(false);
  const [safeTradingOpened, setSafeTradingOpened] = useState(false);
  const [swapHistoryOpened, setSwapHistoryOpened] = useState(false);

  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const [showInverted, setShowInverted] = useState(false);

  const { showPrice, label } = useMemo(() => {
    const show = Boolean(trade?.executionPrice?.baseCurrency && trade?.executionPrice?.quoteCurrency)

    const formattedPrice = showInverted ? trade?.executionPrice?.toSignificant(6) : trade?.executionPrice?.invert()?.toSignificant(6);
    const tokensLabel = showInverted
      ? t("tokenX_per_tokenY", {tokenX: trade?.executionPrice?.quoteCurrency?.symbol, tokenY: trade?.executionPrice?.baseCurrency?.symbol})
      : t("tokenX_per_tokenY", {tokenX: trade?.executionPrice?.baseCurrency?.symbol, tokenY: trade?.executionPrice?.quoteCurrency?.symbol})

    const priceLabel = `${formattedPrice || "-"} ${tokensLabel}`;

    return {
      showPrice: show,
      label: priceLabel
    }
  }, [trade?.executionPrice, showInverted, t]);

  const safeTradingSymbol = useMemo(() => {
    if(!tokenTo || !tokenTo.symbol) {
      return null;
    }

    const symbol = tokenTo.symbol?.replace(/^cc/, "");

    if(safeTradingMap[symbol]) {
      return symbol;
    }

    return null;
  }, [tokenTo]);

  const isMobile = useMediaQuery({ query: '(max-width: 1023px)' });

  return <PageCard>
    <div className="flex justify-between items-center">
      <h2 className="text-24 font-bold">{t("swap")}</h2>

      <div className="hidden lg:block">
        <ActionIconButton onClick={() => setSettingsOpened(true)} icon="filter"/>
      </div>

      <div className="flex lg:hidden items-center gap-1">
        {safeTradingSymbol && <ActionIconButton onClick={() => setSafeTradingOpened(true)} icon="safe-trading"/>}
        <ActionIconButton onClick={() => setSwapHistoryOpened(true)} icon="history"/>
        <ActionIconButton onClick={() => setMobileChartOpened(true)} icon="trading"/>
        <ActionIconButton onClick={() => setSettingsOpened(true)} icon="filter"/>
      </div>

    </div>
    <TransactionSettingsDialog isOpen={isSettingsOpened} setIsOpen={setSettingsOpened}/>
    <div className="mb-4"/>

    <TokenSelector
      amount={amountInString}
      setAmount={(value) => {
        handleAmountInChange(value);
      }}
      label={t("from")}
      token={tokenFrom}
      onPick={() => {
        setPickOpened(true)
        setPickDialogContext('token-from');
      }}
    />

    <div className="my-2.5 xl:my-5 flex justify-center">
      <RoundedIconButton icon="swap" onClick={handleSwitch}/>
    </div>

    <TokenSelector
      amount={amountOutString}
      setAmount={(value) => {
        handleAmountOutChange(value);
      }}
      label={t("to")}
      token={tokenTo}
      onPick={() => {
        setPickOpened(true)
        setPickDialogContext('token-to');
      }}
    />

    <div className="mb-4"/>

    <PickTokenDialog
      pickToken={(token) => {
        if (pickDialogContext === "token-to") {
          handleTokenToChange(token);
        }

        if (pickDialogContext === "token-from") {
          handleTokenFromChange(token);
        }

        setPickOpened(false);
      }}
      isOpen={isPickTokenOpened}
      setIsOpen={setPickOpened}
    />

    <div className="my-5 flex flex-col gap-2.5">
      <InfoRow label={t("price")} value={<span className="flex items-center gap-1">
        {showPrice && <>
          {label}
          <InlineIconButton onClick={() => setShowInverted(!showInverted)} icon="swap" className="rotate-90"/>
        </> || "—"}
      </span>}/>
      <InfoRow label={
        <span className="flex items-center gap-1">
          {t("slippage_tolerance")}
          <InlineIconButton icon="edit" onClick={() => setSettingsOpened(true)}/>
        </span>

      } value={`${slippage}%`}/>
    </div>

    <SwapActionButton />

    <div className="flex flex-col gap-2.5 px-5 py-4 rounded-2 border border-primary-border mt-5">
      <InfoRow label={t("minimum_received")} value={trade ? computeSlippageAdjustedAmounts(trade, slippage) : '—'}/>
      <InfoRow label={t("price_impact")}
               value={priceImpactWithoutFee ? (priceImpactWithoutFee.lessThan(ONE_BIPS) ? '< 0.01%' : `${priceImpactWithoutFee.toFixed(2)}%`) : '—'}/>
      <InfoRow label={t("liquidity_provider_fee")}
               value={realizedLPFee ? `${realizedLPFee?.toSignificant(6)} ${trade?.inputAmount.currency.symbol}` : '—'}/>
      <InfoRow label={t("route")} value={<RoutePath route={trade?.route}/>}/>
    </div>
    <ConfirmSwapDialog/>
    <Drawer isOpen={mobileChartOpened && isMobile} setIsOpen={setMobileChartOpened} placement="bottom">
      <TradingChart />
    </Drawer>
    <Drawer isOpen={swapHistoryOpened && isMobile} setIsOpen={setSwapHistoryOpened} placement="bottom">
      <TradeHistory handleClose={() => setSwapHistoryOpened(false)} />
    </Drawer>
    <Drawer isOpen={safeTradingOpened && isMobile} setIsOpen={setSafeTradingOpened} placement="bottom">
      {safeTradingSymbol && <SafeTrading meta={safeTradingMap[safeTradingSymbol]} token={tokenTo!} />}
    </Drawer>
  </PageCard>
}
