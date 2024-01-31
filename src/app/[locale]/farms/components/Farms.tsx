import React, {useCallback, useMemo, useState} from "react";
import clsx from "clsx";
import Collapse from "../../../../components/atoms/Collapse";
import Preloader from "../../../../components/atoms/Preloader";
import Image from "next/image";
import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getExpLink } from "@/components/RecentTransaction";
import ExternalLink from "@/components/atoms/ExternalLink";
import { Abi, Address, formatUnits } from "viem";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import ROIDialog from "./ROIDialog";
import { useStakeLPTokensStore, useUnstakeLPTokensStore } from "@/app/[locale]/farms/stores/stake";
import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { LP_TOKEN_ABI } from "@/config/abis/lpToken";
import addToast from "@/other/toast";
import { useMediaQuery } from "react-responsive";
import ExpandButton from "@/components/buttons/ExpandButton";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { useFarmsUserDataStore } from "@/app/[locale]/farms/stores";

type LabelType = "supreme" | "select" | "standard" | "new";

const iconsMap: {
  [key: string]: IconName
} = {
  standard: "done",
  supreme: "supreme",
  select: "select",
  new: "supreme"
}

function Label({type}: { type: LabelType }) {
  const isMobile = useMediaQuery({ query: '(max-width: 449px)' });

  if (!type) {
    return <div/>;
  }

  return <div className={clsx("h-[34px] px-2 xs:px-2.5 inline-flex items-center justify-center gap-1 rounded-1 text-14 xs:text-16",
      type === "supreme" && "text-green bg-green/10",
      type === "select" && "text-blue bg-blue/10",
      type === "standard" && "text-orange bg-orange/10",
      type === "new" && "text-blue bg-blue/10",
    )}>
    <Svg size={isMobile ? 20 : 24} iconName={iconsMap[type]}/>
    {type.replace(/^\w/, (c) => c.toUpperCase())}
  </div>
}

function Farm({farm, index, staked, fPrice, reward}: { farm: any, index: number, staked: any, fPrice: any, reward: any }) {
  const {address: account, isConnected: isActive} = useAccount();
  const { chainId } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const {lpRewardsApr, apr} = farm;

  const totalApr = useMemo(() => {
    if (apr && lpRewardsApr) {
      return apr + lpRewardsApr;
    }

    if (apr) {
      return apr;
    }

    return 0;
  }, [apr, lpRewardsApr])

  const [roiOpened, setRoiOpened] = useState(false);

  const [harvesting, setHarvesting] = useState(false);
  const {setOpened, setClose, setSubmitted} = useAwaitingDialogStore();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleHarvest = useCallback(async () => {
    if (!farm || !account || !walletClient) {
      return;
    }

    setOpened(`Harvesting farm`);

    const params: {
      address: Address,
      account: Address,
      abi: Abi,
      functionName: "transfer",
      args: [
        Address,
        bigint
      ]
    } = {
      address: farm.lpAddress,
      account,
      abi: LP_TOKEN_ABI,
      functionName: "transfer",
      args: [
        farm.localFarmAddress,
        BigInt(0)
      ]
    }

    setHarvesting(true);

    try {
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      })
      const hash = await walletClient.writeContract(request);

      setSubmitted(hash, chainId as any);

      setHarvesting(false);
    } catch (e) {
      setClose();
      addToast("Something went wrong, try again later", "error")
      setHarvesting(false);
    }
  }, [account, chainId, farm, publicClient, setClose, setOpened, setSubmitted, walletClient]);

  const [ROIFarmAPR, setROIFarmAPR] = useState<any>(0);
  const [ROILpAPR, setROILpAPR] = useState<any>(0);
  const [ROILinkHref, setROILinkHref] = useState<any>(0);

  const lpLabel = farm?.lpSymbol && farm?.lpSymbol?.toUpperCase().replace('SOYFINANCE', '');

  const {
    setIsStakeLPTokensDialogOpened,
    setLpTokenToStake
  } = useStakeLPTokensStore();

  const {
    setIsUnstakeLPTokensDialogOpened,
    setLpTokenToUnstake
  } = useUnstakeLPTokensStore();

  const isMobile = useMediaQuery({ query: '(max-width: 449px)' });

  const {setIsOpened: openWalletConnect} = useConnectWalletDialogStateStore()
  const { farmsUserData } = useFarmsUserDataStore();

  return <div className="rounded-2 border border-primary-border" key={farm.pid}>
    <div role={"button"} onClick={() => setIsOpen(!isOpen)}  key={farm.pid} className="flex justify-between lg:grid min-h-[60px] py-2 px-4 sm:px-5 lg:grid-cols-farm items-center gap-4 xl:gap-[30px]">
      <div className="flex items-center gap-2">
        <Image width={isMobile ? 28 : 35} height={isMobile ? 28 : 35} src={farm.token.logoURI} alt=""/>
        <Image width={isMobile ? 28 : 35} height={isMobile ? 28 : 35} className="relative -ml-[18px]"
               src={farm.quoteToken.logoURI} alt=""/>
        <p className="text-14 xs:text-16">{farm.token.symbol.replace("WCLO", "CLO")} - {farm.quoteToken.symbol.replace("WCLO", "CLO")}</p>
      </div>
      <div className="hidden lg:block" />
      <div className={clsx("hidden lg:flex flex-col xl:flex-row justify-start pl-[10%] items-center gap-1", !Boolean(reward) && "text-grey-light")}>
        <p>Earned: </p>
        <p>{reward ? Number(formatUnits(reward, 18)).toFixed(4) : 0}</p>
      </div>
      <div className="hidden lg:flex flex-col xl:flex-row items-center gap-1">
        <p>APR: </p>
        <div className="flex items-center gap-1">
          <p>{totalApr.toFixed(2).toString()}%</p>
          {+farm?.apr ? <span>
            <button onClick={(e) => {
              e.stopPropagation();
              setROILpAPR(farm?.lpRewardsApr);
              setROIFarmAPR(farm?.apr);

              setRoiOpened(true);
            }} className="flex items-center justify-center h-6 w-6 text-green p-0 peer">
              <Svg iconName="calculate" className="duration-200 peer-hover:scale-110 origin-center" />
            </button>
          </span> : null}
        </div>
      </div>
      <div className="hidden lg:flex flex-col xl:flex-row justify-start pl-[5%] items-center gap-1"><p>Liquidity:</p>
        <p>{`$${farm.liquidity.toLocaleString('en-US', {maximumFractionDigits: 2})}`}</p></div>
      <div className="hidden lg:flex flex-col xl:flex-row items-center gap-1"><p>Multiplier:</p> <p>{farm.multiplier?.toString()}X</p></div>
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden" />
        <ExpandButton isOpened={isOpen} />
      </div>
    </div>
    <div className="lg:hidden px-5 pb-4">
      <div className="border-b border-primary-border" />
      <div className="grid sm:hidden grid-cols-[1fr 1fr 1fr 100px] mt-4 gap-2.5">
        <div className="flex justify-between items-center"><p>Earned: </p><p>0</p></div>
        <div className="flex justify-between items-center">
          <p>APR: </p>
          <div className="flex gap-1 items-center">
            <p>{totalApr.toFixed(2).toString()}%</p>
            {+farm?.apr && <span>
            <button onClick={() => {
              setROILpAPR(farm?.lpRewardsApr);
              setROIFarmAPR(farm?.apr);

              setRoiOpened(true);
            }} className="flex items-center justify-center h-6 w-6 text-green p-0 peer">
              <Svg className="duration-200 peer-hover:scale-110 origin-center" iconName="calculate"/>
            </button>
          </span>}
          </div>
        </div>
        <div className="flex justify-between items-center"><p>Liquidity:</p>
          <p>{`$${farm.liquidity.toLocaleString('en-US', {maximumFractionDigits: 2})}`}</p></div>
        <div className="flex justify-between items-center"><p>Multiplier:</p>
          <p>{farm.multiplier?.toString()}X</p></div>
      </div>
      <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_100px] mt-4 gap-2.5">
        <div className=""><p>Earned: </p><p>0</p></div>
        <div className="">
          <p>APR: </p>
          <div className="flex gap-1 items-center">
            <p>{totalApr.toFixed(2).toString()}%</p>
            {+farm?.apr && <span>
            <button onClick={() => {
              setROILpAPR(farm?.lpRewardsApr);
              setROIFarmAPR(farm?.apr);

              setRoiOpened(true);
            }} className="flex items-center justify-center h-6 w-6 text-green p-0 peer">
              <Svg className="duration-200 peer-hover:scale-110 origin-center" iconName="calculate"/>
            </button>
          </span>}
          </div>
        </div>
        <div className=""><p>Liquidity:</p>
          <p>{`$${farm.liquidity.toLocaleString('en-US', {maximumFractionDigits: 2})}`}</p></div>
        <div className=""><p>Multiplier:</p>
          <p>{farm.multiplier?.toString()}X</p></div>
      </div>
    </div>


    <Collapse open={isOpen}>
      <div className="xl:px-5 xl:pb-5 grid xl:grid-rows-1 grid-rows-[1fr auto auto] md:grid-cols-2 md:gap-2.5 xl:grid-cols-3 gap-0 -mx-4 px-4 pb-4">
        <div className="bg-secondary-bg hidden xl:block rounded-2 min-h-[110px] py-3.5 px-5">
          <h5 className="text-secondary-text">Links:</h5>
          <div style={{height: 30}}/>
          <div className="flex justify-between">
            <ExternalLink href={`/liquidity`}
                          text="Get SOY LP" />
            <ExternalLink href={getExpLink(farm.lpAddress, "address", chainId as any || undefined)}
                          text="View contract"/>
          </div>
        </div>
        <div className="bg-secondary-bg xl:rounded-2 min-h-[110px] py-3.5 px-5 border-b border-primary-border xl:border-b-0 flex flex-col justify-between">
          <div className="flex justify-between mb-4">
            <h5 className="text-secondary-text">Earned: </h5>
            <div>
              <p>{reward ? Number(formatUnits(reward, 18)).toFixed(4) : 0}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <PrimaryButton disabled={!reward} onClick={handleHarvest} fullWidth>
              Harvest
            </PrimaryButton>
          </div>
        </div>
        <div className="bg-secondary-bg xl:rounded-2 min-h-[110px] py-3.5 px-5">
          {!staked
            ? <h5 className="text-secondary-text">Stake {farm.token.symbol} - {farm.quoteToken.symbol} LP</h5>
            :  <div className="flex justify-between">
              <h5 className="text-secondary-text">{farm.token.symbol} - {farm.quoteToken.symbol} LP STAKED</h5>
              <div>
                <p>{Number(formatUnits(staked, 18)).toFixed(4)}</p>
              </div>
            </div>}
          <div style={{height: 16}}/>
          <div className="flex justify-between w-full">
            {!isActive && <PrimaryButton fullWidth onClick={() => openWalletConnect(true)}>Connect wallet</PrimaryButton>}
            {isActive && !staked && <PrimaryButton disabled={!Boolean(farm.multiplier) || !Boolean(farmsUserData[farm.pid]?.lpBalance)} onClick={() => {
              setLpTokenToStake(farm);
              setIsStakeLPTokensDialogOpened(true);
            }} fullWidth>Stake LP</PrimaryButton>}
            {isActive && staked && <div className="grid grid-cols-2 gap-2.5 w-full">
              <PrimaryButton onClick={() => {
                setLpTokenToUnstake(farm);
                setIsUnstakeLPTokensDialogOpened(true);
              }} fullWidth variant="outlined"><Svg iconName="minus"/></PrimaryButton>
              <PrimaryButton onClick={() => {
                setLpTokenToStake(farm);
                setIsStakeLPTokensDialogOpened(true);
              }} fullWidth variant="outlined"><Svg iconName="add-token"/></PrimaryButton>
            </div>}
          </div>
        </div>
        <div className="xl:hidden flex justify-between pt-4 px-4 md:col-span-2">
          <ExternalLink href={`/liquidity`}
                        text="Get SOY LP"/>
          <ExternalLink href={getExpLink(farm.lpAddress, "address", chainId as any)}
                        text="View contract"/>
        </div>
      </div>
    </Collapse>
    <ROIDialog
      isOpen={roiOpened}
      setIsOpen={setRoiOpened}
      farmApr={ROIFarmAPR}
      tokenPrice={fPrice}
      lpApr={ROILpAPR}
    />
  </div>
}

export default function Farms({farms, userData, onlyStaked, fPrice, searchRequest}: any) {
  const {isConnected: isActive} = useAccount();

  if (!farms) {
    return <div className="flex flex-col gap-1 p-10 items-center justify-center">
      <Preloader size={100}/>
    </div>
  }

  if (onlyStaked && !isActive) {
    return <div className="flex flex-col gap-1 p-10 items-center justify-center">
      <EmptyStateIcon iconName="wallet"/>
      <p className="text-24 mb-1.5">Please, connect your wallet to see staked farms</p>
      <p className="text-secondary-text text-16">You will see staked farms after your wallet will be connected</p>
    </div>;
  }

  if(searchRequest && !farms.length) {
    return <div className="flex flex-col gap-1 p-10 items-center justify-center">
      <EmptyStateIcon iconName="search"/>
      <p className="text-24 mb-1.5">No farms found</p>
      <p className="text-secondary-text text-16">We did not found farms with this request</p>
    </div>
  }

  if (onlyStaked && !farms.length) {
    return <div className="flex flex-col gap-1 p-10 items-center justify-center">
      <EmptyStateIcon iconName="staked"/>
      <p className="text-24 mb-1.5">No Active Farms Yet</p>
      <p className="text-secondary-text text-16">Stake your LP tokens to start earning rewards. Your active farms will appear here.</p>
    </div>
  }

  if (!farms.length) {
    return <div className="flex flex-col gap-1 p-10 items-center justify-center">
      <EmptyStateIcon iconName="staked"/>
      <p className="text-24 mb-1.5">No Farms Found</p>
      <p className="text-secondary-text text-16">We did not fount farms with this request</p>
    </div>
  }

  return <div className="flex flex-col gap-2.5">
    {farms.map((farm: any, index: any) => <Farm fPrice={fPrice} key={farm.pid} farm={farm} index={index}
                                      staked={userData ? userData[farm.pid]?.staked[0] : null}
                                      reward={userData ? userData[farm.pid]?.reward : null}/>)}
  </div>
}
