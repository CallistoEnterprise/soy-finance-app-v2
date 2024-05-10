import {
  ceToken, clo, cloeToken, useIDOMigrateAmountsStore, useCLOMigrateTokensStore,
} from "@/app/[locale]/migrate/stores";
import useAllowance from "@/hooks/useAllowance";
//import { useAccount, useBalance, useBlockNumber, useReadContract } from "wagmi";
import React, { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import TokenSelector from "@/components/TokenSelector";
import Image from "next/image";
import Radio from "@/components/atoms/Radio";
import RoundedIconButton from "@/components/buttons/RoundedIconButton";
import RegisterTokenButton from "@/components/buttons/RegisterTokenButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import InfoRow from "@/components/InfoRow";
import InlineIconButton from "@/components/buttons/InlineIconButton";
import useCLOMigration from "@/app/[locale]/migrate/hooks/useCLOMigration";
import { formatFloat } from "@/other/formatFloat";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";
import { migrationCEAddress } from "@/config/addresses/migration";

function CLOActionButton() {
  const { tokenFrom } = useCLOMigrateTokensStore();

  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useIDOMigrateAmountsStore();
  //const { address, chainId } = useAccount();
  //const { data: blockNumber } = useBlockNumber({ watch: true })
  const { isAllowed: isAllowed, writeTokenApprove: approve } = useAllowance({
    token: cloeToken,
    contractAddress: migrationCEAddress,
    amountToCheck: amountIn
  });

  const { handleMigrateCLO, handleMigrateCLOE} = useCLOMigration();

  if (!amountIn) {
    return <PrimaryButton disabled fullWidth>Enter amount to migrate</PrimaryButton>
  }

  if (tokenFrom.symbol === clo.symbol) {
    return <PrimaryButton fullWidth onClick={() => {
      handleMigrateCLO();
    }}>Migrate</PrimaryButton>
  }

  if (tokenFrom.symbol === cloeToken.symbol) {
    if (isAllowed) {
      return <PrimaryButton fullWidth onClick={handleMigrateCLOE}>Migrate {tokenFrom.symbol}</PrimaryButton>
    }
    return <PrimaryButton fullWidth onClick={approve}>Approve {tokenFrom.symbol}</PrimaryButton>
  }

  //return <PrimaryButton fullWidth onClick={handleMigrateCLO}>Migrate from CLO</PrimaryButton>
}

//var migrationRate = 10000;

export default function IDOMigration() {
  //const { tokenTo, tokenFrom, setTokenFrom } = useMigrateTokensStore();
  const { migrationRate, tokenTo, tokenFrom, setTokenFrom } = useCLOMigrateTokensStore();
  const { amountIn, amountInString, amountOutString, setAmountIn, setAmountOut } = useIDOMigrateAmountsStore();
  //const { address, chainId } = useAccount();


  useEffect(() => {
    if (amountIn) {
      const amountOut = amountIn * BigInt(migrationRate) / BigInt(10000);
      const parsedAmount = formatUnits(amountOut, 18);

      setAmountOut(parsedAmount, 18);
    }

    if (!amountIn) {
      setAmountOut("");
    }
  }, [amountIn, setAmountOut]);

  const [showInverted, setShowInverted] = useState(false);

  const ratioLabel = useMemo(() => {

    const reversedRatio = (Number(migrationRate)/10000).toLocaleString("en-US", {
      maximumSignificantDigits: 2
    })

    return showInverted ? `${10000 / Number(migrationRate)} ${tokenFrom.symbol} = 1 CE` : `${reversedRatio} CE = 1 ${tokenFrom.symbol}`
  }, [showInverted, migrationRate, tokenFrom.symbol]);


  return <div className="p-5">
    <h2 className="mb-2.5 text-24 font-bold">Migration to Callisto Evolution token (CE)</h2>
    <p className="text-secondary-text mb-5">
    Migrate CLO and CLOE tokens to Callisto Evolution token (CE), and be ready for Fushuma! Your migration date determines when you can access your tokens:<br/>
    <br/>
    <b>- Before Apr 2, 2024:</b> 1-month cliff, 6-month vesting.<br/>
    <b>- Apr 2 - Apr 30, 2024:</b> 3-month cliff, 12-month vesting.<br/>
    <b>- May 1 - Jun 30, 2024:</b> 6-month cliff, 15-month vesting.<br/>
    <b>- Jul 1 - Sep 1, 2024:</b> 6-month cliff, 18-month vesting.<br/>
    <br/>
    <b>Cliff:</b> The time before your tokens become accessible.<br/>
    <b>Vesting:</b> The time over which your tokens are released.<br/>
    <br/>
    Start your migration to join Callisto&#39;s evolution!
    </p>

    <h3 className="font-bold mb-2.5">Asset to migrate</h3>
    <div className="grid grid-cols-2 gap-2.5 mb-5">
      <Radio isActive={tokenFrom?.address === clo.address} onClick={() => {
        setTokenFrom(clo);
      }}>
                <span className="flex items-center gap-2">
                  <Image width={24} height={24} src={clo.logoURI} alt={clo.name!}/>
                  {clo.symbol}
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
      setAmountIn(value, 18);
    }} readonlyToken/>
    <div className="my-2.5 xl:my-5 flex justify-center">
      <RoundedIconButton disabled icon="low"/>
    </div>
    <TokenSelector readonly label={`To ${tokenTo?.symbol}`} token={ceToken} onPick={() => null}
                   amount={amountOutString} setAmount={() => null}/>
    <div className="mb-5"/>
    <InfoRow label="Migration rate" value={
      <span className="flex items-center gap-1">
        {ratioLabel}
        <InlineIconButton onClick={() => setShowInverted(!showInverted)} icon="swap" className="rotate-90"/>
      </span>}/>
    <div className="mb-5"/>
    <CLOActionButton/>
    <br/>
    <RegisterTokenButton token = {tokensInClo.ce3}/>
  </div>
}
