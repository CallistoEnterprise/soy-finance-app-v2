import {
  soyToken,
  slofiToken, useIDOMigrateAmountsStore, useIDOMigrateTokensStore,
} from "@/app/[locale]/migrate/stores";
import { useAccount, useBalance, useBlockNumber, useReadContract } from "wagmi";
import { IDOMigrateContractAddress } from "@/config/addresses/migration";
import React, { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import TokenSelector from "@/components/TokenSelector";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { IDO_MIGRATE_ABI } from "@/config/abis/IDOMigrate";
import InfoRow from "@/components/InfoRow";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import useIDOMigration from "@/app/[locale]/migrate/hooks/useIDOMigration";
import { formatFloat } from "@/other/formatFloat";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";

function IDOActionButton() {
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useIDOMigrateAmountsStore();
  const { address, chainId } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data: IDOReserved, refetch } = useReadContract({
    address: IDOMigrateContractAddress,
    abi: IDO_MIGRATE_ABI,
    functionName: "reserved",
    args: [
      address!
    ],
    query: {
      enabled: Boolean(address)
    }
  });

  const { handleMigrateSOY } = useIDOMigration();

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  if (!amountIn) {
    return <PrimaryButton disabled fullWidth>Enter amount to migrate</PrimaryButton>
  }

  if (!IDOReserved || amountIn > IDOReserved) {
    return <PrimaryButton disabled fullWidth>Insufficient balance</PrimaryButton>
  }

  return <PrimaryButton fullWidth onClick={handleMigrateSOY}>Migrate from IDO</PrimaryButton>
}

const IDORate = 100;

export default function IDOMigration() {
  const { tokenTo, tokenFrom } = useIDOMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useIDOMigrateAmountsStore();
  const { address, chainId } = useAccount();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const { data: IDOReserved, refetch } = useReadContract({
    address: IDOMigrateContractAddress,
    abi: IDO_MIGRATE_ABI,
    functionName: "reserved",
    args: [
      address!
    ],
    query: {
      enabled: Boolean(address)
    }
  });

  const soyBalance = useBalance({
    address: address,
    token: tokensInClo.soy.address
  });


  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);


  useEffect(() => {
    if (amountIn) {
      const amountOut = amountIn / BigInt(IDORate);
      const parsedAmount = formatUnits(amountOut, 18);

      setAmountOut(parsedAmount, 18);
    }

    if (!amountIn) {
      setAmountOut("");
    }
  }, [amountIn, setAmountOut]);

  const [showInverted, setShowInverted] = useState(false);

  const ratioLabel = useMemo(() => {

    const reversedRatio = (1 / Number(IDORate)).toLocaleString("en-US", {
      maximumSignificantDigits: 2
    })

    return showInverted ? `${Number(IDORate)} SOY = 1 SLOFI` : `${reversedRatio} SLOFI = 1 SOY`
  }, [showInverted]);


  return <div className="p-5">
    <h2 className="mb-2.5 text-24 font-bold">IDO migration SOY to SLOFI</h2>
    <p className="text-secondary-text mb-5">
      You have {soyBalance.data ? formatFloat(formatUnits(soyBalance.data.value, 18)) : 0} SOY, you can migrate up to {IDOReserved ? formatFloat(formatUnits(IDOReserved, 18)) : 0} SOY by rate {IDORate} SOY per
      SLOFI.
    </p>

    <TokenSelector label={`From ${tokenFrom?.symbol}`} token={tokenFrom} onPick={() => {
    }} amount={amountInString} setAmount={(value) => {
      setAmountIn(value, soyToken.decimals);
    }} readonlyToken balance={IDOReserved}/>
    <div className="my-2.5 xl:my-5 flex justify-center">
      <RoundedIconButton disabled icon="low"/>
    </div>
    <TokenSelector readonly label={`To ${tokenTo?.symbol}`} token={slofiToken} onPick={() => null}
                   amount={amountOutString} setAmount={() => null}/>
    <div className="mb-5"/>
    <InfoRow label="IDO migration rate" value={
      <span className="flex items-center gap-1">
        {ratioLabel}
        <InlineIconButton onClick={() => setShowInverted(!showInverted)} icon="swap" className="rotate-90"/>
      </span>}/>
    <div className="mb-5"/>
    <IDOActionButton/>

  </div>
}
