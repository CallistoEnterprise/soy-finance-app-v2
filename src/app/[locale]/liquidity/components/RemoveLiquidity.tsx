import TokenSelector from "@/components/TokenSelector";
import PageCardHeading from "@/components/PageCardHeading";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import React, { useEffect, useState } from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  useRemoveLiquidityAmountsStore,
  useRemoveLiquidityTokensStore
} from "@/app/[locale]/liquidity/stores/useRemoveLiquidityStore";
import { useRemoveLiquidity } from "@/app/[locale]/liquidity/hooks/useRemoveLiquidity";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import TransactionSettingsDialog from "@/components/dialogs/TransactionSettingsDialog";
import Svg from "@/components/atoms/Svg";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import {useTranslations} from "use-intl";

function RemoveLiquidityAction() {
  const t = useTranslations("Liquidity");

  const { amountLPString, amountLP } = useRemoveLiquidityAmountsStore();
  const { tokenLP } = useRemoveLiquidityTokensStore();
  const { address} = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })


  const {
    readyToRemove,
    onAttemptToApprove,
    removeLiquidity
  } = useRemoveLiquidity();

  const { data, refetch } = useBalance({
    address: tokenLP ? address : undefined,
    token: tokenLP ? tokenLP.address : undefined
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  if(!amountLPString) {
    return <PrimaryButton disabled fullWidth>{t("enter_amount")}</PrimaryButton>
  }

  if(amountLP && data && amountLP > data.value) {
    return <PrimaryButton disabled fullWidth>{t("insufficient_balance")}</PrimaryButton>
  }

  return <>
    {readyToRemove
      ? <PrimaryButton onClick={removeLiquidity} fullWidth>{t("remove_liquidity")}</PrimaryButton>
      : <PrimaryButton onClick={onAttemptToApprove} fullWidth>{t("approve")}</PrimaryButton>
    }
  </>
}
export default function RemoveLiquidity({setContent}: {setContent: any}) {
  const t = useTranslations("Liquidity");

  const { tokenA, tokenB, tokenLP } = useRemoveLiquidityTokensStore();
  const { amountAString, amountLPString, amountBString } = useRemoveLiquidityAmountsStore();

  const [pickDialogContext, setPickDialogContext] = useState<"remove-liquidity-tokenA" | "remove-liquidity-tokenB">("remove-liquidity-tokenA");
  const [isPickTokenOpened, setPickOpened] = useState(false);

  const {
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange,
    handleTokenAChange,
    handleTokenBChange,
    token0Deposited,
    token1Deposited,
    priceA,
    priceB
  } = useRemoveLiquidity();
  const [isSettingsOpened, setSettingsOpened] = useState(false);

  return <div>
    <div className="mb-4 flex justify-between items-center">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => {
          setContent("pools");
        }}>
          <Svg iconName="back" />
        </button>
        <PageCardHeading title={t("remove_liquidity")}/>
      </div>
      <ActionIconButton onClick={() => setSettingsOpened(true)} icon="filter"/>
    </div>

    <TransactionSettingsDialog isOpen={isSettingsOpened} setIsOpen={setSettingsOpened}/>

    <div className="flex flex-col gap-2.5 xl:gap-5">
      <TokenSelector label={t("input")} token={tokenLP} pair={tokenA && tokenB ? [tokenA, tokenB] : [undefined, undefined]} onPick={() => undefined} amount={amountLPString}
                     setAmount={(value) => {
                       handleLiquidityAmountLPChange(value);
                     }}/>
      <div className="flex justify-center">
        <RoundedIconButton icon="low" disabled/>
      </div>
      <TokenSelector label={t("output")} token={tokenA} onPick={() => {
        setPickOpened(true);
        setPickDialogContext("remove-liquidity-tokenA")
      }} amount={amountAString} setAmount={(value) => {
        handleAmountAChange(value);
      }} balance={token0Deposited}/>
      <div className="flex justify-center">
        <RoundedIconButton icon="add-token" disabled/>
      </div>
      <TokenSelector label={t("output")} token={tokenB} onPick={() => {
        setPickOpened(true);
        setPickDialogContext("remove-liquidity-tokenB")
      }} amount={amountBString} setAmount={(value) => {
        handleAmountBChange(value);
      }} balance={token1Deposited}/>

      <div className="rounded-2 overflow-hidden border border-primary-border">
        <div className="bg-secondary-bg h-10 flex items-center pl-5">
          <p>{t("prices")}</p>
        </div>
        <div className="p-5 flex flex-col gap-2.5">

          {tokenA && tokenB && priceA && priceB ? <>
            <div className="flex justify-between items-center">
              <p className="text-secondary-text">1 {tokenA.symbol}</p>
              <p className="text-secondary-text">{priceA.toSignificant(5)} {tokenB.symbol}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-secondary-text">1 {tokenB.symbol}</p>
              <p className="text-secondary-text">{priceA.toSignificant(5)} {tokenA.symbol}</p>
            </div>
          </> : <>
            <div className="flex justify-between items-center">
              <p className="text-secondary-text">—</p>
              <p className="text-secondary-text">—</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-secondary-text">—</p>
              <p className="text-secondary-text">—</p>
            </div>
          </>}
        </div>
      </div>

      <PickTokenDialog
        pickToken={(token) => {
          if (pickDialogContext === "remove-liquidity-tokenA") {
            handleTokenAChange(token);
          }

          if (pickDialogContext === "remove-liquidity-tokenB") {
            handleTokenBChange(token);
          }

          setPickOpened(false);
        }}
        isOpen={isPickTokenOpened}
        setIsOpen={setPickOpened}
      />

      <RemoveLiquidityAction />
    </div>
  </div>
}
