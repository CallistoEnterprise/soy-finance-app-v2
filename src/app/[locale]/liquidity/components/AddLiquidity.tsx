import TokenSelector from "@/components/TokenSelector";
import PageCardHeading from "@/components/PageCardHeading";
import React, { useEffect, useMemo, useState } from "react";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import InfoRow from "@/components/InfoRow";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useLiquidityAmountsStore, useLiquidityTokensStore } from "@/app/[locale]/liquidity/stores";
import { useLiquidity } from "@/app/[locale]/liquidity/hooks/useLiquidity";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import Drawer from "@/components/atoms/Drawer";
import LiquidityHistory from "@/app/[locale]/liquidity/components/LiquidityHistory";
import LiquidityChart from "@/app/[locale]/liquidity/components/LiquidityChart";
import { useMediaQuery } from "react-responsive";
import useAllowance from "@/hooks/useAllowance";
import useRouterAddress from "@/hooks/useRouterAddress";
import { useAccount, useReadContract } from "wagmi";
import useEnoughBalance from "@/hooks/useEnoughBalance";
import TransactionSettingsDialog from "@/components/dialogs/TransactionSettingsDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { ERC20_ABI } from "@/config/abis/erc20";
import usePair from "@/hooks/usePair";
import { Address } from "viem";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";

function AddLiquidityAction() {
  const {isConnected} = useAccount();
  const { tokenA, tokenB } = useLiquidityTokensStore();
  const {  amountA, amountB } = useLiquidityAmountsStore();
  const routerAddress = useRouterAddress();

  const {isAllowed: isAllowedA, writeTokenApprove: approveA, isApproving: isApprovingA} = useAllowance({
    token: tokenA,
    contractAddress: routerAddress,
    amountToCheck: amountA
  });

  const {isAllowed: isAllowedB, writeTokenApprove: approveB, isApproving: isApprovingB} = useAllowance({
    token: tokenB,
    contractAddress: routerAddress,
    amountToCheck: amountB
  });

  const [wasApprovingTokenA, setWasApprovingTokenA] = useState(false);
  const [wasApprovingTokenB, setWasApprovingTokenB] = useState(false);

  const isEnoughBalanceA = useEnoughBalance({tokenAddress: tokenA?.address, amountToCheck: amountA})
  const isEnoughBalanceB = useEnoughBalance({tokenAddress: tokenB?.address, amountToCheck: amountB})

  const {addLiquidity} = useLiquidity();
  const {setIsOpened: setWalletConnectOpened} = useConnectWalletDialogStateStore();

  useEffect(() => {
    if (isApprovingA) {
      setWasApprovingTokenA(true);
    }
  }, [isApprovingA]);

  useEffect(() => {
    if (isApprovingB) {
      setWasApprovingTokenB(true);
    }
  }, [isApprovingB]);

  if (!isConnected) {
    return <PrimaryButton fullWidth onClick={() => setWalletConnectOpened(true)}>Connect wallet</PrimaryButton>
  }

  if (!tokenA || !tokenB) {
    return <PrimaryButton disabled fullWidth>Choose tokens to proceed</PrimaryButton>;
  }

  if (!amountA || !amountB) {
    return <PrimaryButton disabled fullWidth>Enter an amount to proceed</PrimaryButton>;
  }

  if (!isEnoughBalanceA && !isEnoughBalanceB) {
    return <PrimaryButton disabled fullWidth>Insufficient tokens balance</PrimaryButton>;
  } else {
    if (!isEnoughBalanceA) {
      return <PrimaryButton disabled fullWidth>Insufficient {tokenA.symbol} balance</PrimaryButton>;
    }

    if (!isEnoughBalanceB) {
      return <PrimaryButton disabled fullWidth>Insufficient {tokenB.symbol} balance</PrimaryButton>;
    }
  }

  if ((!isAllowedA || wasApprovingTokenA) && (!isAllowedB || wasApprovingTokenB)) {
    return <div>
      <div className="flex gap-2.5 mb-5 flex-col">
        <div className="grid grid-cols-[40px_1fr] gap-5">
          <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative mr-2.5 before:absolute before:top-full before:w-[1px] before:h-3 before:left-1/2 before:bg-green before:-translate-x-1/2">1</div>
          <div className="grid gap-2.5 grid-cols-2">
            {wasApprovingTokenA && isAllowedA && <PrimaryButton disabled className="bg-green/20">{tokenA.symbol} approved</PrimaryButton>}
            {!isAllowedA && <PrimaryButton loading={isApprovingA} fullWidth onClick={approveA}>Approve {tokenA.symbol}</PrimaryButton>}
            {wasApprovingTokenB && isAllowedB && <PrimaryButton disabled className="bg-green/20">{tokenB.symbol} approved</PrimaryButton>}
            {!isAllowedB && <PrimaryButton loading={isApprovingB} fullWidth onClick={approveB}>{isApprovingB ? `Approving ${tokenB.symbol}` : `Approve ${tokenB.symbol}`}</PrimaryButton>}
          </div>
        </div>
        <div className="grid grid-cols-[40px_1fr] gap-5">
          <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative mr-2.5">2</div>
          <PrimaryButton fullWidth disabled={!isAllowedA || !isAllowedB} onClick={addLiquidity}>Supply liquidity</PrimaryButton>
        </div>
      </div>
    </div>
  }

  if (!isAllowedA || wasApprovingTokenA &&
    isAllowedB
  ) {
    return <div className="grid gap-2.5">
      <div className="grid grid-cols-[40px_1fr] gap-5">
        <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative">1</div>
        <div>
          {!isAllowedA && <PrimaryButton disabled={isApprovingA} fullWidth onClick={approveA}>{isApprovingA ? `Approving ${tokenA.symbol}` : `Approve ${tokenA.symbol}`}</PrimaryButton>}
          {isAllowedA && wasApprovingTokenA &&
            <PrimaryButton fullWidth disabled>Approve {tokenA.symbol}</PrimaryButton>}
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr] gap-5">
        <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative">2</div>

        <PrimaryButton
          disabled={isApprovingB || !isAllowedA}
          fullWidth onClick={addLiquidity}>Supply liquidity</PrimaryButton>
      </div>
    </div>
  }

  if (isAllowedA &&
    !isAllowedB || wasApprovingTokenB
  ) {
    return <div className="grid gap-2.5">
      <div className="grid grid-cols-[40px_1fr] gap-5">
        <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative">1</div>
        <div>
          {!isAllowedB && <PrimaryButton disabled={isApprovingB} fullWidth onClick={approveB}>{isApprovingB ? `Approving ${tokenB.symbol}` : `Approve ${tokenB.symbol}`}</PrimaryButton>}
          {isAllowedB && wasApprovingTokenB &&
            <PrimaryButton fullWidth disabled>Approve {tokenB.symbol}</PrimaryButton>}
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr] gap-5">
        <div className="rounded-full w-10 h-10 flex justify-center items-center border border-green relative">2</div>

        <PrimaryButton
          disabled={isApprovingB || !isAllowedB}
          fullWidth onClick={addLiquidity}>Supply liquidity</PrimaryButton>
      </div>
    </div>
  }

  return <PrimaryButton fullWidth onClick={addLiquidity}>Supply liquidity</PrimaryButton>
}
export default function AddLiquidity() {
  const [reversed, setReversed] = useState(false);
  const { tokenA, tokenB } = useLiquidityTokensStore();
  const { amountAString, amountBString, amountA, amountB } = useLiquidityAmountsStore();
  const [isSettingsOpened, setSettingsOpened] = useState(false);

  const [pickDialogContext, setPickDialogContext] = useState<"add-liquidity-tokenA" | "add-liquidity-tokenB">("add-liquidity-tokenA");
  const [isPickTokenOpened, setPickOpened] = useState(false);

  const [mobileChartOpened, setMobileChartOpened] = useState(false);
  const [swapHistoryOpened, setSwapHistoryOpened] = useState(false);

  const isMobile = useMediaQuery({ query: '(max-width: 1023px)' });

  const {
    priceA,
    priceB,
    handleAmountAChange,
    handleAmountBChange,
    handleTokenAChange,
    handleTokenBChange
  } = useLiquidity();

  const importPair = usePair({ tokenA, tokenB });

  const { data: totalPoolTokens } = useReadContract({
    address: importPair?.liquidityToken.address as Address,
    abi: ERC20_ABI,
    functionName: "totalSupply"
  });

  const {data: reserves} = useReadContract({
    address: importPair?.liquidityToken.address as Address,
    abi: LP_TOKEN_ABI,
    functionName: "getReserves"
  })

  const liquidityMinted = useMemo(() => {
    if(!amountA || !amountB || !importPair || !reserves) {
      return null;
    }

    if(!totalPoolTokens) {
      return amountA * amountB / BigInt(1000);
    }

    const amount0 = Number(amountA * totalPoolTokens / reserves[0]);
    const amount1 = Number(amountB * totalPoolTokens / reserves[1]);

    return amount0 <= amount1 ? amount0 : amount1
  }, [amountA, amountB, importPair, reserves, totalPoolTokens]);

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalPoolTokens) {
      return 100 * Number(liquidityMinted) / (Number(totalPoolTokens) + Number(liquidityMinted))
    }
    return undefined
  }, [liquidityMinted, totalPoolTokens])

  const percentage = useMemo(() => {
    if(!poolTokenPercentage) {
      return ""
    }
    if(poolTokenPercentage < 0.01) {
      return "< 0.01"
    }

    return poolTokenPercentage?.toFixed(2);
  }, [poolTokenPercentage]);

  return <div>
    <div className="flex justify-between items-center mb-4">
      <PageCardHeading title="Add liquidity"/>
      <div className="hidden lg:block">
        <ActionIconButton onClick={() => setSettingsOpened(true)} icon="filter"/>
      </div>

      <div className="flex lg:hidden items-center gap-1">
        <ActionIconButton onClick={() => setSwapHistoryOpened(true)} icon="history"/>
        <ActionIconButton onClick={() => setMobileChartOpened(true)} icon="trading"/>
        <ActionIconButton onClick={() => setSettingsOpened(true)} icon="filter"/>
      </div>
    </div>

    <TransactionSettingsDialog isOpen={isSettingsOpened} setIsOpen={setSettingsOpened}/>

    <div className="grid gap-2.5 xl:gap-5 mb-5">
      <TokenSelector label="Input" token={tokenA} onPick={() => {
        setPickOpened(true);
        setPickDialogContext("add-liquidity-tokenA")
      }} amount={amountAString} setAmount={(value) => {
        handleAmountAChange(value);
      }}/>
      <div className="flex justify-center">
        <RoundedIconButton icon="add-token" disabled/>
      </div>
      <TokenSelector label="Input" token={tokenB} onPick={() => {
        setPickOpened(true);
        setPickDialogContext("add-liquidity-tokenB")
      }} amount={amountBString} setAmount={(value) => {
        handleAmountBChange(value);
      }}/>
    </div>

    <PickTokenDialog
      pickToken={(token) => {
        if (pickDialogContext === "add-liquidity-tokenA") {
          handleTokenAChange(token);
        }

        if (pickDialogContext === "add-liquidity-tokenB") {
          handleTokenBChange(token);
        }

        setPickOpened(false);
      }}
      isOpen={isPickTokenOpened}
      setIsOpen={setPickOpened}
    />

    <div className="flex flex-col gap-2.5 mb-5">
      <InfoRow label="Current rate" value={
        <>
          {tokenA && tokenB && priceA && priceB ? <span className="flex items-center gap-1">
            1 {reversed ? tokenA.symbol : tokenB.symbol} = {reversed ? priceB?.toSignificant(6) : priceA?.toSignificant(6)} {reversed ? tokenB.symbol : tokenA.symbol}
            <InlineIconButton onClick={() => {
              setReversed(!reversed)
            }} icon="swap" className="rotate-90"/>
        </span> : <span className="flex items-center gap-1">
            —
        </span>}
        </>
      }/>
      <InfoRow label="Share of pool" value={percentage ? `${percentage}%` : "—"} />
    </div>

    <AddLiquidityAction />

    <Drawer isOpen={mobileChartOpened && isMobile} setIsOpen={setMobileChartOpened} placement="bottom">
      <LiquidityChart />
    </Drawer>
    <Drawer isOpen={swapHistoryOpened && isMobile} setIsOpen={setSwapHistoryOpened} placement="bottom">
      <LiquidityHistory />
    </Drawer>
  </div>
}
