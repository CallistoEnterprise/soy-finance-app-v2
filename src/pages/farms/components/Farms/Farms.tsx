import React, {useCallback, useMemo, useState} from "react";
import styles from "./Farms.module.scss";
import {Farm} from "../../FarmsPage";
import Svg from "../../../../components/atoms/Svg/Svg";
import clsx from "clsx";
import Collapse from "../../../../components/atoms/Collapse";
import IconButton from "../../../../components/atoms/IconButton";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import {Contract, EthersError, FixedNumber, formatUnits, parseUnits} from "ethers";
import {useEvent} from "effector-react";
import {openStakeLPTokensDialog, openUnStakeLPTokensDialog, setLpTokenToStake, setLpTokenToUnStake} from "../../models";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";
import Flex from "../../../../components/layout/Flex";
import ExternalLink from "../../../../components/atoms/ExternalLink";
import {LP_TOKEN_ABI} from "../../../../shared/constants/abis";
import EmptyStateIcon from "../../../../components/atoms/EmptyStateIcon";
import Preloader from "../../../../components/atoms/Preloader";
import {getLogo} from "../../../../shared/utils";
import Image from "next/image";
import Divider from "../../../../components/atoms/Divider";
import {useEthersError} from "../../../swap/hooks/useEthersError";
import ROIDialog from "../ROIDialog";

interface Props {
  farms: Farm[],
  userData: any
}

type LabelType = "supreme" | "select" | "standard";

const iconsMap = {
  standard: "done",
  supreme: "supreme",
  select: "select"
}

function Label({type}: { type: LabelType }) {
  if (!type) {
    return <div/>;
  }

  return <div className={clsx(styles.label, styles[type])}>
    <Svg iconName={iconsMap[type]}/>
    {type.replace(/^\w/, (c) => c.toUpperCase())}
  </div>
}

function Farm({farm, index, staked, fPrice, reward}: { farm: Farm, index: number, staked: any, fPrice, reward: any }) {
  const {isActive, account, web3Provider, chainId, changeNetwork} = useWeb3();
  const [isOpen, setIsOpen] = useState(false);

  const {lpRewardsApr, apr}: { lpRewardApr: number, apr: FixedNumber } = farm;

  const totalApr = useMemo(() => {
    if (apr && lpRewardsApr) {
      return apr.toUnsafeFloat() + lpRewardsApr;
    }

    if (apr) {
      return apr.toUnsafeFloat();
    }

    return 0;
  }, [apr, lpRewardsApr])

  const [roiOpened, setRoiOpened] = useState(false);

  const openStakeLPTokensDialogFn = useEvent(openStakeLPTokensDialog);
  const openUnStakeLPTokensDialogFn = useEvent(openUnStakeLPTokensDialog);

  const setLpTokenToStakeFn = useEvent(setLpTokenToStake);
  const setLpTokenToUnStakeFn = useEvent(setLpTokenToUnStake);
  const {handleError} = useEthersError();

  const handleHarvest = useCallback(async () => {
    if (!farm || !account) {
      return;
    }

    const contract = new Contract(farm.lpAddresses[820]!, LP_TOKEN_ABI, await web3Provider?.getSigner(account));

    const _amount = parseUnits('0', 18);

    const args = [
      farm.localFarmAddresses?.["820"],
      _amount
    ];

    try {
      const gas = await contract["transfer"]["estimateGas"](...args);
      const tx = await contract["transfer"](...args, {gasLimit: gas});
      console.log(tx);
    } catch (e: EthersError) {
      handleError(e);
    }
  }, [account, farm, handleError, web3Provider]);

  const [ROIFarmAPR, setROIFarmAPR] = useState<any>(0);
  const [ROILpAPR, setROILpAPR] = useState<any>(0);
  const [ROILinkHref, setROILinkHref] = useState<any>(0);

  const lpLabel = farm?.lpSymbol && farm?.lpSymbol?.toUpperCase().replace('SOYFINANCE', '')

  return <div className={styles.farmWrapper} key={farm.pid}>
    <div role={"button"} onClick={() => setIsOpen(!isOpen)}  key={farm.pid} className={styles.farm}>
      <div className={styles.meta}>
        <Image width={35} height={35} src={getLogo({address: farm.token.address?.[820]?.toLowerCase()})} alt=""/>
        <Image width={35} height={35} className={styles.secondImg}
               src={getLogo({address: farm.quoteToken.address?.[820]?.toLowerCase()})} alt=""/>
        <Text>{farm.token.symbol} - {farm.quoteToken.symbol}</Text>
      </div>
      {/*<div><Label type={["standard", "supreme", "select", ""][index % 4]}/></div>*/}
      <div className={styles.earnedCell}>
        <Text>Earned: </Text><Text>{reward ? Number(formatUnits(reward, 18)).toFixed(4) : 0}</Text></div>
      <div className={styles.aprCell}>
        <Text>APR: </Text>
        <div className={styles.aprValue}>
          <Text>{totalApr.toFixed(2).toString()}%</Text>
          {farm.apr && <span>
            <button onClick={(e) => {
              e.stopPropagation();
              setROILpAPR(farm.lpRewardsApr);
              setROIFarmAPR(farm.apr);

              setRoiOpened(true);
            }} className={styles.roiButton}>
              <Svg iconName="calculate"/>
            </button>
          </span>}
        </div>
      </div>
      <div className={styles.liquidityCell}><Text>Liquidity:</Text>
        <Text>{`$${(+farm.liquidity.round(2)).toLocaleString('en-US')}`}</Text></div>
      <div className={styles.multiplierCell}><Text>Multiplier:</Text> <Text>{farm.multiplier?.toString()}X</Text></div>
      <IconButton>
        <Svg iconName="arrow-bottom"/>
      </IconButton>
    </div>
    <div className={styles.mobileInternal}>
      <Divider/>
      <div className={styles.internalCellsWrapper}>
        <div className={styles.earnedCellInternal}><Text>Earned: </Text><Text>0</Text></div>
        <div className={styles.aprCellInternal}>
          <Text>APR: </Text>
          <div className={styles.aprValue}>
            <Text>{totalApr.toFixed(2).toString()}%</Text>
            {farm.apr && <span>
            <button onClick={() => {
              setROILpAPR(farm.lpRewardsApr);
              setROIFarmAPR(farm.apr);

              setRoiOpened(true);
            }} className={styles.roiButton}>
              <Svg iconName="calculate"/>
            </button>
          </span>}
          </div>
        </div>
        <div className={styles.liquidityCellInternal}><Text>Liquidity:</Text>
          <Text>{`$${farm.liquidity.round(2).toString()}`}</Text></div>
        <div className={styles.multiplierCellInternal}><Text>Multiplier:</Text>
          <Text>{farm.multiplier?.toString()}X</Text></div>
      </div>
    </div>
    <Collapse open={isOpen}>
      <div className={styles.collapsed}>
        <div className={styles.links}>
          <Text color="secondary" tag="h5">Links:</Text>
          <div style={{height: 30}}/>
          <div className={styles.linksContainer}>
            <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`}
                          text="Get SOY LP"/>
            <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`}
                          text="View contract"/>
          </div>
        </div>
        <div className={styles.earned}>
          <div className={styles.linksContainer}>
            <Text color="secondary" tag="h5">Earned: </Text>
            <div>
              <Text>0.00</Text>
              {" "}
              <Text color="secondary">($0.00)</Text>
            </div>
          </div>
          <div style={{height: 16}}/>
          <div className={styles.linksContainer}>
            <Button disabled={!staked || chainId !== 820} onClick={handleHarvest} fullWidth>
              Harvest
            </Button>
          </div>
        </div>
        <div className={styles.stake}>
          {!staked
            ? <Text color="secondary" tag="h5">Stake SOY - CLO LP</Text>
            : <Text color="secondary" tag="h5">SOY-CLO LP STAKED</Text>}
          <div style={{height: 16}}/>
          <div className={styles.linksContainer}>
            {!isActive && <ConnectWalletButton fullWidth/>}
            {isActive && chainId !== 820 && <Button fullWidth onClick={() => changeNetwork(820)}>Switch to CLO</Button>}
            {isActive && !staked && chainId === 820 && <Button onClick={() => {
              setLpTokenToStakeFn(farm);
              openStakeLPTokensDialogFn();
            }} fullWidth>Stake LP</Button>}
            {isActive && staked && chainId === 820 && <Flex gap={10}>
              <Button onClick={() => {
                setLpTokenToUnStakeFn(farm);
                openUnStakeLPTokensDialogFn();
              }} fullWidth variant="outlined"><Svg iconName="minus"/></Button>
              <Button onClick={() => {
                setLpTokenToStakeFn(farm);
                openStakeLPTokensDialogFn();
              }} fullWidth variant="outlined"><Svg iconName="add-token"/></Button>
            </Flex>}
          </div>
        </div>
        <div className={styles.mobileFarmExternalLinks}>
          <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`}
                        text="Get SOY LP"/>
          <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`}
                        text="View contract"/>
        </div>
      </div>
    </Collapse>
    <ROIDialog
      isOpen={roiOpened}
      onCLose={() => setRoiOpened(false)}
      isFarm
      farmApr={ROIFarmAPR}
      lpLabel={`GET ${lpLabel}`}
      tokenPrice={fPrice}
      lpApr={ROILpAPR}
      linkHref={ROILinkHref}
    />
  </div>
}

export default function Farms({farms, userData, onlyStaked, fPrice, searchRequest}: Props) {
  const {isActive} = useWeb3();

  if (!farms) {
    return <div className={styles.noStaked}>
      <Preloader size={100}/>
    </div>
  }

  if (onlyStaked && !isActive) {
    return <div className={styles.noStaked}>
      <EmptyStateIcon iconName="wallet"/>
      <Text variant={24}>Please, connect your wallet to see staked farms</Text>
      <Text color="secondary" variant={16}>You will see staked farms after your wallet will be connected</Text>
    </div>;
  }

  if(searchRequest && !farms.length) {
    return <div className={styles.noStaked}>
      <EmptyStateIcon iconName="search"/>
      <Text variant={24}>No farms found</Text>
      <Text color="secondary" variant={16}>We did not found farms with this request</Text>
    </div>
  }

  if (onlyStaked && !farms.length) {
    return <div className={styles.noStaked}>
      <EmptyStateIcon iconName="staked"/>
      <Text variant={24}>No Active Farms Yet</Text>
      <Text color="secondary" variant={16}>Stake your LP tokens to start earning rewards. Your active farms will appear here.</Text>
    </div>
  }

  return <div className={styles.farmsContainer}>
    {farms.map((farm, index) => <Farm fPrice={fPrice} key={farm.pid} farm={farm} index={index}
                                      staked={userData ? userData[farm.pid].staked[0] : null}
                                      reward={userData ? userData[farm.pid].reward[0] : null}/>)}
  </div>
}
