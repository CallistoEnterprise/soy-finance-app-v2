import {
  soyToken,
  cloeToken,
  slofiToken,
  useMigrateAmountsStore,
  useMigrateTokensStore
} from "@/app/[locale]/migrate/stores";
import Image from "next/image";
import TokenSelector from "@/components/TokenSelector";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import React, { useEffect, useMemo, useState } from "react";
import Radio from "@/components/atoms/Radio";
import { formatUnits } from "viem";
import { MIGRATE_ABI } from "@/config/abis/migrate";
import useAllowance from "@/hooks/useAllowance";
import { useAccount, useBalance, useBlockNumber, useReadContract } from "wagmi";
import { migrateContractAddress } from "@/config/addresses/migration";
import useDirectMigration from "@/app/[locale]/migrate/hooks/useDirectMigration";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import InfoRow from "@/components/InfoRow";
import addToast from "@/other/toast";

function DirectMigrationActionButton({isOpened}: {isOpened: boolean}) {
  const { amountIn } = useMigrateAmountsStore();
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { tokenFrom } = useMigrateTokensStore();
  const { address, chainId } = useAccount();

  const { data: amountInBalance, refetch } = useBalance({
    address: tokenFrom ? address : undefined,
    token: tokenFrom.address as `0x${string}`
  });

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  const { isAllowed: isAllowed, writeTokenApprove: approve } = useAllowance({
    token: cloeToken,
    contractAddress: migrateContractAddress,
    amountToCheck: amountIn
  });

  const { handleMigrateSOY, handleMigrateCLOE } = useDirectMigration();

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  if (!amountIn) {
    return <PrimaryButton fullWidth disabled>Enter amount to migrate</PrimaryButton>
  }

  if (!amountInBalance) {
    return <PrimaryButton fullWidth disabled>Loading...</PrimaryButton>
  }

  if (amountIn > amountInBalance.value) {
    return <PrimaryButton fullWidth disabled>Insufficient amount</PrimaryButton>
  }

  if (tokenFrom.symbol === soyToken.symbol) {
    return <PrimaryButton fullWidth onClick={() => {
      if(!isOpened) {
        addToast("Migration is currently closed", "info");
        return;
      }
      handleMigrateSOY();
    }}>Migrate</PrimaryButton>
  }

  if (tokenFrom.symbol === cloeToken.symbol) {
    if (isAllowed) {
      return <PrimaryButton fullWidth onClick={handleMigrateCLOE}>Migrate {tokenFrom.symbol}</PrimaryButton>
    }
    return <PrimaryButton fullWidth onClick={approve}>Approve {tokenFrom.symbol}</PrimaryButton>
  }
}


export default function DirectMigration() {
  const { tokenTo, tokenFrom, setTokenFrom } = useMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useMigrateAmountsStore();


  const { data, refetch } = useReadContract({
    address: migrateContractAddress,
    abi: MIGRATE_ABI,
    functionName: "getRates"
  });

  const {data: blockNumber} = useBlockNumber({watch: !data || !Boolean(data[0]) || !Boolean(data[1])});


  useEffect(() => {
    console.log("Rates: " + data);
    refetch();
  }, [refetch, blockNumber, data]);

  const [soyRatio, cloeRatio] = useMemo(() => {
    return data || [undefined, undefined]
  }, [data]);

  useEffect(() => {
    if (data && amountIn && soyRatio && cloeRatio) {
      const [soyRatio, cloeRatio] = data;

      if (tokenFrom.symbol === soyToken.symbol) {
        const amountOut = amountIn / soyRatio;
        const parsedAmount = formatUnits(amountOut, 18);
        setAmountOut(parsedAmount, 18);
      }

      if (tokenFrom.symbol === cloeToken.symbol) {
        const amountOut = amountIn / cloeRatio;
        const parsedAmount = formatUnits(amountOut, 18);
        setAmountOut(parsedAmount, 18);
      }
    }

    if (!amountIn) {
      setAmountOut("");
    }
  }, [amountIn, cloeRatio, data, setAmountOut, soyRatio, tokenFrom.symbol]);


  const [showInverted, setShowInverted] = useState(false);

  const ratioLabel = useMemo(() => {
    if (tokenFrom.symbol === soyToken.symbol && !soyRatio) {
      return "";
    }

    if (tokenFrom.symbol === cloeToken.symbol && !cloeRatio) {
      return "";
    }

    const ratio = tokenFrom.symbol === soyToken.symbol ? soyRatio : cloeRatio;

    const reversedRatio = (1 / Number(ratio)).toLocaleString("en-US", {
      maximumSignificantDigits: 2
    })

    return showInverted ? `${Number(ratio)} ${tokenFrom.symbol} = 1 SLOFI` : `${reversedRatio} SLOFI = 1 ${tokenFrom.symbol}`
  }, [cloeRatio, showInverted, soyRatio, tokenFrom.symbol]);

  return <div className="p-5">
    <h2 className="mb-2.5 text-24 font-bold">SLOTH Migration Portal</h2>
    <div className="text-secondary-text mb-5 flex flex-col gap-2.5">
      Migrated SLOFI tokens will be released at a rate of 5% per month after the 90-day lock-in period.
    </div>

    <h3 className="font-bold mb-2.5">Asset to migrate</h3>
    <div className="grid grid-cols-2 gap-2.5 mb-5">
      <Radio isActive={false} onClick = {()=>{}} disabled>
                <span className="flex items-center gap-2">
                  <Image width={24} height={24} src={soyToken.logoURI} alt={soyToken.name!}/>
                  {soyToken.symbol}
                </span>
      </Radio>     
      <Radio isActive={tokenFrom?.address === cloeToken.address} onClick={() => {
        setTokenFrom(cloeToken);
      }}>
                <span className="flex items-center gap-2">
                  <Image width={24} height={24} src={cloeToken.logoURI} alt={cloeToken.name!}/>
                  {cloeToken.symbol}
                </span>
      </Radio>
    </div>

    <TokenSelector label={`From ${tokenFrom?.symbol}`} token={tokenFrom} onPick={() => {
    }} amount={amountInString} setAmount={(value) => {
      setAmountIn(value, soyToken.decimals);
    }} readonlyToken/>
    <div className="my-2.5 xl:my-5 flex justify-center">
      <RoundedIconButton disabled icon="low"/>
    </div>
    <TokenSelector readonly label={`To ${tokenTo?.symbol}`} token={slofiToken} onPick={() => null}
                   amount={amountOutString} setAmount={(value) => {
      setAmountOut(value, cloeToken.decimals);
    }}/>
    <div className="mb-5"/>
    <InfoRow label="Current rate" value={
      <span className="flex items-center gap-1">
        {ratioLabel}
        <InlineIconButton onClick={() => setShowInverted(!showInverted)} icon="swap" className="rotate-90"/>
      </span>}/>
    <div className="mb-5"/>
    <DirectMigrationActionButton isOpened={Boolean(soyRatio) && Boolean(cloeRatio)}/>
  </div>
}
