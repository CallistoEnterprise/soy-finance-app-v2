import Image from "next/image";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";
import Svg from "@/components/atoms/Svg";
import {
  soyToken,
  cloeToken,
  slofiToken,
  useIDOMigrateAmountsStore,
  useIDOMigrateTokensStore, useStakingMigrateAmountsStore, useStakingMigrateTokensStore
} from "@/app/[locale]/migrate/stores";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Abi, Address, formatUnits } from "viem";
import { MIGRATE_ABI } from "@/config/abis/migrate";
import { migrateContractAddress } from "@/config/addresses/migration";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import useStakingMigration from "@/app/[locale]/migrate/hooks/useStakingMigration";
import TokenSelector from "@/components/TokenSelector";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import InfoRow from "@/components/InfoRow";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import { formatFloat } from "@/other/formatFloat";
import { useStakingMigrationDateStore } from "@/app/[locale]/migrate/stores/staking-migration-timer";
import { useCountdown } from "@/hooks/useCountdown";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Preloader from "@/components/atoms/Preloader";

function StakingMigrationAction() {
  const {handleMigrateStaking, loadingNoRate} = useStakingMigration();

  return <PrimaryButton fullWidth onClick={handleMigrateStaking} loading={loadingNoRate}>Migrate Staking</PrimaryButton>
}

function StakingMigrationWithRateAction() {
  const {handleMigrateRateStaking} = useStakingMigration();

  return <PrimaryButton fullWidth onClick={handleMigrateRateStaking}>Migrate Staking</PrimaryButton>
}
export default function StakingMigration() {
  const { address, chainId } = useAccount();
  const { tokenTo, tokenFrom } = useStakingMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useStakingMigrateAmountsStore();

  const {date: stakingMigrationDate} = useStakingMigrationDateStore();
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const {data: stakingRateReserved, isLoading, refetch} = useReadContract({
    abi: MIGRATE_ABI,
    functionName: "stakingRateReserved",
    address: migrateContractAddress,
    args: [
      address!
    ],
    query: {
      enabled: Boolean(address)
    }
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const targetDate = useMemo(() => {
    if(!stakingMigrationDate) {
      return new Date(Date.now());
    }

    const savedDate = new Date(stakingMigrationDate);

    const [day, month] = [savedDate.getDate(), savedDate.getMonth()];

    return new Date(2024, month, day, 23, 59,59, 0);
  }, [stakingMigrationDate]);

  const [seconds] = useCountdown(
    targetDate
  );

  const availableStaking = useMemo(() => {
    return +seconds < 0;
  }, [seconds])

  const [migratedAmount, reservedAmount, rate] = useMemo(() => {
    return stakingRateReserved || [undefined, undefined, undefined]
  }, [stakingRateReserved]);


  const [showInverted, setShowInverted] = useState(false);

  const ratioLabel = useMemo(() => {

    const reversedRatio = (1 / Number(rate)).toLocaleString("en-US", {
      maximumSignificantDigits: 2
    })

    return showInverted ? `${Number(rate)} ${tokenFrom.symbol} = 1 SLOFI` : `${reversedRatio} SLOFI = 1 ${tokenFrom.symbol}`
  }, [rate, showInverted, tokenFrom.symbol]);

  useEffect(() => {
    if (amountIn && rate) {
      const amountOut = amountIn / BigInt(rate);
      const parsedAmount = formatUnits(amountOut, 18);

      setAmountOut(parsedAmount, 18);
    }

    if (!amountIn) {
      setAmountOut("");
    }
  }, [amountIn, rate, setAmountOut]);

  if(isLoading) {
    return <div className="p-10 flex justify-center items-center">
      <Preloader size={100} />
    </div>
  }

  if(!rate) {
    return <div className="p-5">
      <h2 className="text-24 font-bold mb-2.5">Staking migration SOY to SLOFI</h2>
      <p>You can migrate SOY that are locked on staking</p>
      <div className="flex justify-center gap-5 my-5 items-center">
        <Image width={100} height={100} src={tokensInClo.soy.logoURI} alt=""/>
        <div className="bg-secondary-bg rounded-full w-10 h-10 flex justify-center items-center">
          <Svg iconName="arrow-right"/>
        </div>
        <Image width={100} height={100} src={slofiToken.logoURI} alt=""/>
      </div>
      <StakingMigrationAction />
    </div>
  }

  if(!Boolean(reservedAmount) && Boolean(migratedAmount)) {
    return <div className="p-5">
      <h2 className="text-24 font-bold mb-2.5">Staking migration SOY to SLOFI</h2>
      <div className="flex justify-center items-center my-5">
        <div className="bg-green/20 rounded-full flex justify-center items-center w-[120px] h-[120px]">
          <div className="text-white bg-green rounded-full flex justify-center items-center w-[87px] h-[87px]">
            <Svg iconName="check" size={64} />
          </div>
        </div>
      </div>
      <p className="text-secondary-text text-center">
        {formatFloat(formatUnits(migratedAmount, 18))} SOY have been migrated to {formatFloat(formatUnits(migratedAmount / BigInt(rate), 18))} SLOFI from staking.
      </p>
    </div>
  }

  if(!Boolean(migratedAmount) && !Boolean(reservedAmount)) {
    return <div className="p-5">
      <h2 className="text-24 font-bold mb-2.5">Staking migration SOY to SLOFI</h2>
      <div className="flex justify-center items-center my-5">
        <EmptyStateIcon iconName="soy" />
      </div>
      <p className="text-secondary-text text-center">You don&apos;t have SOY on staking. Use direct migration.</p>
    </div>
  }

  if(rate && !availableStaking) {
    return <div className="p-5">
      <h2 className="text-24 font-bold mb-2.5">Staking migration SOY to SLOFI</h2>
      <div className="flex justify-center items-center my-5">
        <div className="bg-green/20 rounded-full flex justify-center items-center w-[120px] h-[120px]">
          <div className="text-white bg-green rounded-full flex justify-center items-center w-[87px] h-[87px]">
            <Svg iconName="check" size={64} />
          </div>
        </div>
      </div>
      <p className="text-secondary-text text-center">
        <b>{formatFloat(formatUnits(migratedAmount, 18))} SOY</b> were migrated to <b>{formatFloat(formatUnits(migratedAmount / BigInt(rate), 18))} SLOFI</b>. {formatFloat(formatUnits(reservedAmount, 18))} SOY were reserved with rate {rate} SOY per SLOFI. You can migrate reserved tokens when you&apos;ll receive it from staking.
      </p>
    </div>
  }

  return <div className="p-5">
    <h2 className="mb-2.5 text-24 font-bold">Staking migration SOY to SLOFI</h2>
    <p className="text-secondary-text mb-5">
      Migrated SLOFI tokens will be released at a rate of 5% per month after the 90-day lock-in period.
    </p>

    <TokenSelector label={`From ${tokenFrom?.symbol}`} token={tokenFrom} onPick={() => {
    }} amount={amountInString} setAmount={(value) => {
      setAmountIn(value, soyToken.decimals);
    }} readonlyToken />
    <div className="my-2.5 xl:my-5 flex justify-center">
      <RoundedIconButton disabled icon="low"/>
    </div>
    <TokenSelector readonly label={`To ${tokenTo?.symbol}`} token={slofiToken} onPick={() => null}
                   amount={amountOutString} setAmount={() => null}/>
    <div className="mb-5"/>
    <InfoRow label="Locked rate" value={
      <span className="flex items-center gap-1">
        {ratioLabel}
        <InlineIconButton onClick={() => setShowInverted(!showInverted)} icon="swap" className="rotate-90"/>
      </span>}/>
    <div className="mb-5"/>
    <StakingMigrationWithRateAction />
  </div>
}
