"use client";
import Container from "@/components/atoms/Container";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageCard from "@/components/PageCard";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import useUSDPrices from "@/hooks/useUSDPrices";
import clsx from "clsx";
import Svg from "@/components/atoms/Svg";
import DirectMigration from "@/app/[locale]/migrate/components/DirectMigration";
import StakingMigration from "@/app/[locale]/migrate/components/StakingMigration";
import IDOMigration from "@/app/[locale]/migrate/components/IDOMigration";
import { useAccount, useBlockNumber, usePublicClient, useReadContract, useSwitchChain, useWalletClient } from "wagmi";
import { SLOTH_VESTING_ABI } from "@/config/abis/slothVesting";
import { Abi, Address, formatUnits } from "viem";
import { formatFloat } from "@/other/formatFloat";
import addToast from "@/other/toast";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { slothVestingContract } from "@/config/addresses/migration";
import { useTranslations } from "use-intl";


const sixtyDaysInMillis = 5184000000;
const ninetyDaysInMillis = 7776000000;
export default function MigratePage() {
  useUSDPrices();
  const [activeTab, setActiveTab] = useState(0);
  const {address, isConnected, chainId} = useAccount();
  const navT = useTranslations("Navigation");

  const {data: walletClient} = useWalletClient();
  const publicClient = usePublicClient();
  const {addTransaction} = useRecentTransactionsStore();
  const {switchChain} = useSwitchChain();
  const {data: blockNumber} = useBlockNumber({watch: true});

  const {data: beneficiaries, refetch: refetchBeneficiaries} = useReadContract({
    abi: SLOTH_VESTING_ABI,
    functionName: "beneficiaries",
    address: slothVestingContract,
    args: [
      address!
    ],
    query: {
      enabled: Boolean(address)
    }
  });

  const {data: unlockedAmountData, refetch: refetchUnlockedAmount} = useReadContract({
    abi: SLOTH_VESTING_ABI,
    functionName: "getUnlockedAmount",
    address: slothVestingContract,
    args: [
      address!
    ],
    query: {
      enabled: Boolean(address)
    }
  });

  useEffect(() => {
    refetchBeneficiaries();
    refetchUnlockedAmount();
  }, [refetchBeneficiaries, refetchUnlockedAmount, blockNumber]);

  const [amount, startVesting, lastClaimed, alreadyClaimed] = useMemo(() => {
    if(beneficiaries) {
      return beneficiaries;
    }

    return [undefined, undefined, undefined, undefined]
  }, [beneficiaries]);

  const [unlockedAmount, reward] = useMemo(() => {
    if(unlockedAmountData) {
      return unlockedAmountData;
    }

    return [BigInt(0), BigInt(0)]
  }, [unlockedAmountData]);

  const {setIsOpened: setConnectWalletOpened} = useConnectWalletDialogStateStore();
  const {setOpened, setClose, setSubmitted} = useAwaitingDialogStore();


  const handleClaim = useCallback(async () => {
    if(!walletClient || !address || !chainId) {
      return;
    }

    setOpened(`Claim ${formatFloat(formatUnits(unlockedAmount + reward, 18))} SLOFI`);

    const params: {
      address: Address,
      account: Address,
      abi: Abi,
      functionName: "claim"
    } = {
      address: slothVestingContract,
      account: address,
      abi: SLOTH_VESTING_ABI,
      functionName: "claim"
    }

    try {
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      })
      const hash = await walletClient.writeContract(request);
      if(hash) {
        addTransaction({
          account: address,
          hash,
          chainId,
          title: `Claimed ${formatFloat(formatUnits(unlockedAmount + reward, 18))} SLOFI`,
        }, address);
        setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({hash});
      }
    } catch (e) {
      console.log(e);
      setClose();
      addToast("Unexpected error, please contact support", "error");
    }
  }, [addTransaction, address, chainId, publicClient, reward, setClose, setOpened, setSubmitted, unlockedAmount, walletClient]);

  if(!isConnected) {
    return <Container>
      <div className="w-full md:w-[640px] mx-auto my-5">
        <PageCard>
          <div className="min-h-[400px] flex flex-col justify-center items-center gap-5">
            <EmptyStateIcon iconName="wallet" />
            <h2 className="bold text-16 lg:text-20">Connect your wallet to proceed</h2>
            <PrimaryButton onClick={() => setConnectWalletOpened(true)}>{navT("connect_wallet")}</PrimaryButton>
          </div>
        </PageCard>
      </div>
    </Container>
  }

  if(chainId !== 820) {
    return <Container>
      <div className="w-full md:w-[640px] mx-auto my-5">
        <PageCard>
          <div className="min-h-[400px] flex flex-col justify-center items-center gap-5">
            <EmptyStateIcon iconName="network" />
            <h2 className="bold text-16 lg:text-20">Migration is not supported via this chain</h2>
            <PrimaryButton onClick={() => switchChain({ chainId: 820 })}>Switch to Callisto</PrimaryButton>
          </div>
        </PageCard>
      </div>
    </Container>
  }

  return <Container>
    <div className="w-full md:w-[640px] mx-auto sm:mt-5">
      <PageCard>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center border border-l-orange border-primary-border border-l-4 px-5 py-2 gap-2 rounded-2 flex-wrap">
            <Svg className="text-orange" iconName="lock"/>
            <span className="text-secondary-text">Locked:</span>
            {" "}
            <span className="font-bold">{amount ? formatFloat(formatUnits(amount - alreadyClaimed, 18)) : 0} SLOFI</span>
          </div>
          <div className="flex items-center justify-between border border-l-green border-primary-border border-l-4 px-5 py-2 rounded-2 gap-2 flex-wrap">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Svg className="text-green" iconName="coins"/>
                <span className="text-secondary-text">SLOFI available:</span>
                {" "}
                <span className="font-bold">{formatFloat(formatUnits(reward + unlockedAmount, 18)) || 0} SLOFI</span>
              </div>
              <div className="flex items-center gap-x-2 flex-wrap">
                <Svg className="text-green" iconName="calculate"/>
                <span className="text-secondary-text">Including rewards of APR:</span>
                {" "}
                <span className="font-bold">{formatFloat(formatUnits(reward, 18)) || 0} SLOFI</span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <PrimaryButton fullWidth onClick={handleClaim} disabled={reward + unlockedAmount === BigInt(0)} variant="outlined">Claim</PrimaryButton>
            </div>
          </div>
          <div className="flex items-center border border-l-blue border-primary-border border-l-4 px-5 py-2 gap-2 rounded-2 flex-wrap">
            <Svg className="text-blue" iconName="calendar"/>
            <span className="text-secondary-text">Next release date:</span>
            {" "}
            <span className="font-bold">{startVesting ? (new Date(Number(startVesting) * 1000 + ninetyDaysInMillis)).toLocaleString("en-US", {month: "long", day: "numeric", year: "numeric"}) : "—"}</span>
          </div>
        </div>
      </PageCard>
    </div>

    <div className="w-full md:w-[640px] mx-auto my-5">
      <div className="bg-primary-bg sm:rounded-5 border-y sm:border border-primary-border overflow-hidden">
        <div className="flex">
          <button className={clsx(
            "flex-1 h-10 w-full text-primary-text text-16 border-primary-border border-r",
            activeTab === 0 ? "bg-primary-bg" : "bg-secondary-bg border-b"
          )}
                  onClick={() => setActiveTab(0)}>Direct <span className="hidden md:inline">migration</span>
          </button>
          <button className={clsx(
            "flex-1 h-10 w-full text-primary-text text-16 border-primary-border border-r",
            activeTab === 1 ? "bg-primary-bg" : "bg-secondary-bg border-b"
          )}
                  onClick={() => setActiveTab(1)}>Staking <span className="hidden md:inline">migration</span>
          </button>
          <button className={clsx(
            "flex-1 h-10 w-full text-primary-text text-16 border-primary-border",
            activeTab === 2 ? "bg-primary-bg" : "bg-secondary-bg border-b"
          )}
                  onClick={() => setActiveTab(2)}>IDO <span className="hidden md:inline">migration</span>
          </button>
        </div>
        {activeTab === 0 && <DirectMigration />}
        {activeTab === 1 && <StakingMigration />}
        {activeTab === 2 && <IDOMigration />}
      </div>
    </div>
  </Container>
}
