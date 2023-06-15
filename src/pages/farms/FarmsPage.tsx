import React, {useEffect, useMemo, useState} from "react";
import Layout from "../../shared/layouts/Layout";
import Farms from "./components/Farms";
import {IIFE} from "../../shared/web3/functions/iife";
import styles from "./FarmsPage.module.scss";
import farmsToFetch from "./constants/farms/farmsInCLO";
import {FarmConfig} from "./types";
import {BigNumber} from "@ethersproject/bignumber";
import {useMultiCallContract} from "../../shared/web3/hooks/useMultiCallContract";
import {useErc20Fragment, useLocalFarmFragment, useMasterChefFragment} from "../../shared/config/fragments";
import {ERC_20_INTERFACE, LOCAL_FARM_INTERFACE, MASTER_CHEF_INTERFACE} from "../../shared/config/interfaces";
import {FixedNumber, FunctionFragment} from "ethers";
import {fetchFarmsPrices} from "./utils";
import clsx from "clsx";
import Switch from "../../components/atoms/Switch";
import BannerSlider from "./components/BannerSlider";
import PageCardHeading from "../../components/molecules/PageCardHeading";

export type SerializedBigNumber = string

export interface Farm extends FarmConfig {
  tokenAmountMc: FixedNumber
  quoteTokenAmountMc: FixedNumber
  tokenAmountTotal: FixedNumber
  quoteTokenAmountTotal: FixedNumber
  lpTotalInQuoteToken: FixedNumber
  lpTotalSupply: FixedNumber
  tokenPriceVsQuote: FixedNumber
  liquidity: FixedNumber
  poolWeight?: SerializedBigNumber
  realmulti?: BigNumber
  userData?: {
    allowance: string
    tokenBalance: string
    stakedBalance: string
    earnings: string
  }
}

function compareMultiplier(a: Farm, b: Farm ) {
  if (a.multiplier < b.multiplier){
    return 1;
  }
  if (a.multiplier > b.multiplier){
    return -1;
  }
  return 0;
}

function compareLiquidity(a: Farm, b: Farm ) {
  console.log(a.liquidity);
  console.log(b.liquidity);
  console.log("LESS?");
  console.log(a.liquidity.lt(b.liquidity));

  if (a.liquidity.toUnsafeFloat() < b.liquidity.toUnsafeFloat()){
    return 1;
  }
  if (a.liquidity.toUnsafeFloat() > b.liquidity.toUnsafeFloat()){
    return -1;
  }

  return 0;
}

export default function FarmsPage() {
  const multiCallContract = useMultiCallContract();

  const totalSupplyFragment = useErc20Fragment("totalSupply");
  const balanceOfFragment = useErc20Fragment("balanceOf");
  const decimalsFragment = useErc20Fragment("decimals");

  const localFarmsFragment = useMasterChefFragment("localFarms");

  const getAllocFragment = useLocalFarmFragment("getAllocationX1000");

  const [data, setData] = useState<Farm[] | null>(null);

  const [showActive, setShowActive] = useState(true);

  const [sorting, setSorting] = useState<"hot" | "liquidity" | "apr" | "multiplier">("hot");

  useEffect(() => {
    if (!multiCallContract
      || !totalSupplyFragment
      || !balanceOfFragment
      || !decimalsFragment
      || !localFarmsFragment
      || !getAllocFragment
    ) {
      return;
    }

    const results = [];
    const multiplierResults = [];
    const allocResults = [];

    IIFE(async () => {

      for (let i = 0; i < farmsToFetch.length; i++) {
        const {lpAddresses, token, quoteToken, localFarmAddresses, pid} = farmsToFetch[i];
        const lpAddress = lpAddresses["820"];

        const calls: Array<{ address: string | undefined, fragment: FunctionFragment, params?: any }> = [
          // Balance of token in the LP contract
          {
            address: token.address?.["820"],
            fragment: balanceOfFragment,
            params: [lpAddress],
          },
          // Balance of quote token on LP contract
          {
            address: quoteToken.address?.["820"],
            fragment: balanceOfFragment,
            params: [lpAddress],
          },
          // Balance of LP tokens in the master chef contract
          {
            address: lpAddress,
            fragment: balanceOfFragment,
            params: [localFarmAddresses?.["820"]],
          },
          // Total supply of LP tokens
          {
            address: lpAddress,
            fragment: totalSupplyFragment
          },
          // Token decimals
          {
            address: token.address?.["820"],
            fragment: decimalsFragment
          },
          // Quote token decimals
          {
            address: token.address?.["820"],
            fragment: decimalsFragment
          },
        ];

        const multiplierCall = {
          address: '0x64Fa36ACD0d13472FD786B03afC9C52aD5FCf023',
          fragment: localFarmsFragment,
          params: [pid],
        };

        const allocPointCall = {
          address: localFarmAddresses?.["820"],
          fragment: getAllocFragment,
          params: [],
        }

        const mCallData = [[multiplierCall.address, MASTER_CHEF_INTERFACE.encodeFunctionData(multiplierCall.fragment, multiplierCall.params)]];

        const aCallData = [[allocPointCall.address, LOCAL_FARM_INTERFACE.encodeFunctionData(allocPointCall.fragment)]];

        const callData = calls.map((call) => [
          call.address?.toLowerCase(),
          ERC_20_INTERFACE.encodeFunctionData(call.fragment, call.params ? call.params : undefined)
        ]);


        const {returnData: allReturnData} = await multiCallContract["aggregate"](callData);

        const {returnData: multiplierReturnData} = await multiCallContract["aggregate"](mCallData);

        const {returnData: allocReturnData} = await multiCallContract["aggregate"](aCallData);

        multiplierResults.push(multiplierReturnData.map((call, i) => MASTER_CHEF_INTERFACE.decodeFunctionResult(localFarmsFragment, call)));

        results.push(allReturnData.map((call, i) => ERC_20_INTERFACE.decodeFunctionResult(calls[i].fragment, call)));
        allocResults.push(allocReturnData.map((call, i) => LOCAL_FARM_INTERFACE.decodeFunctionResult(getAllocFragment, call)));
      }

      console.log(results);
      console.log(multiplierResults);
      console.log(allocResults);

      const serializedResults = results.map((result, i) => {
        const [
          { 0: tokenBalanceLP },
          { 0: quoteTokenBalanceLP },
          { 0: lpTokenBalanceMC },
          { 0: lpTotalSupply },
          { 0: tokenDecimals },
          { 0: quoteTokenDecimals }
        ] = result;

        const {0: multiplierData} = multiplierResults[i];
        const {0: allocData} = allocResults[i];

        const tokenBalanceLPFixed = FixedNumber.fromValue(tokenBalanceLP, 18);
        const quoteTokenBalanceLPFixed = FixedNumber.fromValue(quoteTokenBalanceLP, 18);
        const lpTokenBalanceMCFixed = FixedNumber.fromValue(lpTokenBalanceMC, 18);
        const lpTotalSupplyFixed = FixedNumber.fromValue(lpTotalSupply, 18);

        const lpTokenRatio = lpTokenBalanceMCFixed.div(lpTotalSupplyFixed);

        const tokenDecimalsMultiplier = FixedNumber.fromValue(10n ** tokenDecimals, 18);
        const quoteTokenDecimalsMultiplier = FixedNumber.fromValue(10n ** quoteTokenDecimals, 18);

        // Raw amount of token in the LP, including those not staked
        const tokenAmountTotal = tokenBalanceLPFixed.div(tokenDecimalsMultiplier);
        const quoteTokenAmountTotal = quoteTokenBalanceLPFixed.div(quoteTokenDecimalsMultiplier);

        // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
        const tokenAmountMc = tokenAmountTotal.mul(lpTokenRatio);
        const quoteTokenAmountMc = quoteTokenAmountTotal.mul(lpTokenRatio);

        // Total staked in LP, in quote token value
        const lpTotalInQuoteToken = quoteTokenAmountMc.mul(FixedNumber.fromValue(2n)); //wrong
        const tokenPriceVsQuote = quoteTokenAmountTotal.div(tokenAmountTotal);

        return {
          ...farmsToFetch[i],
          tokenAmountMc, // correct
          quoteTokenAmountMc, // wrong
          tokenAmountTotal, // correct
          quoteTokenAmountTotal, // wrong
          lpTotalSupply, // correct
          lpTotalInQuoteToken, // wrong
          multiplier: multiplierData[1],
          poolWeight: allocData[0] ? FixedNumber.fromValue(allocData[0]).div(FixedNumber.fromValue(1000n)) : FixedNumber.fromValue(0),
          tokenPriceVsQuote
        }
      });

      const farmsWithPrices = fetchFarmsPrices(serializedResults);

      setData(farmsWithPrices);
    });

  }, [balanceOfFragment, decimalsFragment, getAllocFragment, localFarmsFragment, multiCallContract, totalSupplyFragment]);

  const sortedFarms = useMemo(() => {
    if(!data) {
      return null;
    }

    switch (sorting) {
      case "multiplier":
        console.log("Case fired");
        const msorted = [...data];
        msorted.sort(compareMultiplier);

        return msorted;

      case "liquidity":
        console.log("Case fired 2");
        const lsorted = [...data];
        lsorted.sort(compareLiquidity);

        console.log(lsorted);
        return lsorted;

      default:
        console.log("return def");
        return data;
    }

  }, [data, sorting]);

  const activeFarms = useMemo(() => {
    if(!sortedFarms) {
      return null;
    }
    console.log("Fired change farms");

    return sortedFarms.filter((farm) => Boolean(farm.multiplier));
  }, [sortedFarms]);

  const inactiveFarms = useMemo(() => {
    if(!sortedFarms) {
      return null;
    }

    return sortedFarms.filter((farm) => !Boolean(farm.multiplier));
  }, [sortedFarms]);

  return <Layout>
    <div className="mb-20"/>
    <div className="container">
      <div className="paper">
        <PageCardHeading title="Soy Finance essentials" />
        <div className="mb-20" />
        <BannerSlider />
      </div>
    </div>
    <div className="mb-20" />
    <div className="container">
      <div className="paper">
        <h4 className="mb-20 font-700 font-24">All farms</h4>

        <div className={styles.farmsHeader}>
          <div className={styles.leftPart}>
            <div className={styles.staked}>
              Staked only
              <Switch checked={true} setChecked={null} />
            </div>

            <div className={styles.tabs}>
              <button className={clsx(styles.tab, showActive && styles.activeTab)} onClick={() => setShowActive(true)}>Active</button>
              <button className={clsx(styles.tab, !showActive && styles.activeTab)} onClick={() => setShowActive(false)}>Inactive</button>
            </div>
          </div>
          <div>
            <button className={sorting === "liquidity" && styles.activeSort} onClick={() => setSorting("liquidity")}>Liquidity</button>
            <button className={sorting === "multiplier" && styles.activeSort} onClick={() => setSorting("multiplier")}>Multiplier</button>
            <button className={sorting === "apr" && styles.activeSort} onClick={() => setSorting("apr")}>Apr</button>
          </div>
        </div>
        {activeFarms && showActive && <Farms farms={activeFarms} />}
        {inactiveFarms && !showActive && <Farms farms={inactiveFarms} />}
      </div>
    </div>
    <div className="mb-20"/>
  </Layout>;
}
