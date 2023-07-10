import React, {ReactNode, useCallback, useState} from "react";
import styles from "./Farms.module.scss";
import {Farm} from "../../FarmsPage";
import Svg from "../../../../components/atoms/Svg/Svg";
import clsx from "clsx";
import Collapse from "../../../../components/atoms/Collapse";
import IconButton from "../../../../components/atoms/IconButton";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import {Contract, EthersError, FixedNumber, parseUnits} from "ethers";
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
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import {useEthersError} from "../../../swap/hooks/useEthersError";

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

function Farm({farm, index, staked}: {farm: Farm, index: number, staked: any}) {
  const {isActive, account, web3Provider} = useWeb3();
  const [isOpen, setIsOpen] = useState(false);

  const {lpRewardsApr, apr}: { lpRewardApr: number, apr: FixedNumber } = farm;

  const totalApr = apr && lpRewardsApr ? apr.toUnsafeFloat() + lpRewardsApr : 0;


  const openStakeLPTokensDialogFn = useEvent(openStakeLPTokensDialog);
  const openUnStakeLPTokensDialogFn = useEvent(openUnStakeLPTokensDialog);

  const setLpTokenToStakeFn = useEvent(setLpTokenToStake);
  const setLpTokenToUnStakeFn = useEvent(setLpTokenToUnStake);
  const {handleError} = useEthersError();

  const handleHarvest = useCallback(async () => {
    if(!farm || !account) {
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

  return <div className={styles.farmWrapper} key={farm.pid}>
    <div key={farm.pid} className={styles.farm}>
      <div className={styles.meta}>
        <Image width={35} height={35} src={getLogo({address: farm.token.address?.[820]?.toLowerCase()})} alt=""/>
        <Image width={35} height={35} className={styles.secondImg} src={getLogo({address: farm.quoteToken.address?.[820]?.toLowerCase()})} alt=""/>
        {farm.token.symbol} - {farm.quoteToken.symbol}
      </div>
      {/*<div><Label type={["standard", "supreme", "select", ""][index % 4]}/></div>*/}
      <div className={styles.earnedCell}><span>Earned: </span><span>0</span></div>
      <div className={styles.aprCell}><span>APR: </span><span>{totalApr.toFixed(2).toString()}%</span></div>
      <div className={styles.liquidityCell}><span>Liquidity:</span> <span>{`$${farm.liquidity.round(2).toString()}`}</span></div>
      <div className={styles.multiplierCell}><span>Multiplier:</span> <span>{farm.multiplier?.toString()}X</span></div>
      <IconButton onClick={() => setIsOpen(!isOpen)}>
        <Svg iconName="arrow-bottom"/>
      </IconButton>
    </div>
    <div className={styles.mobileInternal}>
      <Divider />
      <div className={styles.internalCellsWrapper}>
        <div className={styles.earnedCellInternal}><span>Earned: </span><span>0</span></div>
        <div className={styles.aprCellInternal}><span>APR: </span><span>{totalApr.toFixed(2).toString()}%</span></div>
        <div className={styles.liquidityCellInternal}><span>Liquidity:</span> <span>{`$${farm.liquidity.round(2).toString()}`}</span></div>
        <div className={styles.multiplierCellInternal}><span>Multiplier:</span> <span>{farm.multiplier?.toString()}X</span></div>
      </div>
    </div>
    <Collapse open={isOpen}>
      <div className={styles.collapsed}>
        <div className={styles.links}>
          <Text color="secondary" tag="h5">Links:</Text>
          <div style={{height: 30}}/>
          <div className={styles.linksContainer}>
            <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`} text="Get SOY LP" />
            <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`} text="View contract" />
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
            <Button disabled={!staked} onClick={handleHarvest} fullWidth >
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
            {!isActive && <ConnectWalletButton fullWidth />}
            {isActive && !staked && <Button onClick={() => {
              setLpTokenToStakeFn(farm);
              openStakeLPTokensDialogFn();
            }} fullWidth>Stake LP</Button>}
            {isActive && staked && <Flex gap={10}>
              <Button onClick={() => {
                setLpTokenToUnStakeFn(farm);
                openUnStakeLPTokensDialogFn();
              }} fullWidth variant="outlined"><Svg iconName="minus" /></Button>
              <Button onClick={() => {
                setLpTokenToStakeFn(farm);
                openStakeLPTokensDialogFn();
              }} fullWidth variant="outlined"><Svg iconName="add-token" /></Button>
            </Flex>}
          </div>
        </div>
        <div className={styles.mobileFarmExternalLinks}>
          <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`} text="Get SOY LP" />
          <ExternalLink href={`https://explorer.callisto.network/address/${farm.lpAddresses?.["820"]}/transactions`} text="View contract" />
        </div>
      </div>
    </Collapse>
  </div>
}

export default function Farms({farms, userData, onlyStaked}: Props) {
  const {isActive} = useWeb3();

  if(!farms) {
    return <div className={styles.noStaked}>
      <Preloader size={100} />
    </div>
  }

  if(onlyStaked && !isActive) {
    return <div className={styles.noStaked}>
      <EmptyStateIcon iconName="wallet" />
      <Text variant={24}>Please, connect your wallet to see staked farms</Text>
      <Text color="secondary" variant={16}>You will see staked farms after your wallet will be connected</Text>
    </div>;
  }

  if(onlyStaked && !farms.length) {
    return <div className={styles.noStaked}>
      <EmptyStateIcon iconName="staked" />
      <Text variant={24}>No staked pairs</Text>
      <Text color="secondary" variant={16}>Stake the pair then it will be displayed here</Text>
    </div>
  }

  return <div className={styles.farmsContainer}>
    {farms.map((farm, index) => <Farm key={farm.pid} farm={farm} index={index} staked={userData ? userData[farm.pid][0] : null} />)}
  </div>
}
