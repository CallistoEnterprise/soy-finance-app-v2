import React, {useMemo} from "react";
import styles from "./ROIDialog.module.scss";
import DialogHeader from "../../../../components/molecules/DialogHeader";
import {tokenEarnedPerThousandDollarsCompounding} from "../../../../shared/utils";
import Text from "../../../../components/atoms/Text";
import DrawerDialog from "../../../../components/atoms/DrawerDialog";
import {FixedNumber} from "ethers";

export const getDisplayApr = (cakeRewardsApr: number | FixedNumber, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2})
  }

  if (cakeRewardsApr) {
    return (+cakeRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2})
  }

  return 0;
}

export const getRoi = ({amountEarned, amountInvested}) => {
  if(isNaN(amountEarned) || isNaN(amountInvested)) {
    return 0;
  }

  return (amountEarned / amountInvested) * 100
}

export default function ROIDialog({
                                    onCLose, isOpen,
                                    onDismiss,
                                    tokenPrice,
                                    farmApr,
                                    lpApr,
                                    linkLabel,
                                    linkHref,
                                    earningTokenSymbol = 'SOY',
                                    roundingDecimals = 2,
                                    compoundFrequency = 1,
                                    isFarm = false
                                  }) {
  const oneThousandDollarsWorthOfToken = 1000 / tokenPrice;

  const apr = useMemo(() => {
    if (farmApr && lpApr) {
      return farmApr.toUnsafeFloat() + lpApr;
    }

    if (farmApr) {
      return farmApr.toUnsafeFloat();
    }

    return 0;
  }, [farmApr, lpApr])

  const tokenEarnedPerThousand1D = tokenEarnedPerThousandDollarsCompounding({
    numberOfDays: 1,
    farmApr: apr,
    tokenPrice,
    roundingDecimals,
    compoundFrequency,
  })
  const tokenEarnedPerThousand7D = tokenEarnedPerThousandDollarsCompounding({
    numberOfDays: 7,
    farmApr: apr,
    tokenPrice,
    roundingDecimals,
    compoundFrequency,
  })
  const tokenEarnedPerThousand30D = tokenEarnedPerThousandDollarsCompounding({
    numberOfDays: 30,
    farmApr: apr,
    tokenPrice,
    roundingDecimals,
    compoundFrequency,
  })
  const tokenEarnedPerThousand365D = tokenEarnedPerThousandDollarsCompounding({
    numberOfDays: 365,
    farmApr: apr,
    tokenPrice,
    roundingDecimals,
    compoundFrequency
  })

  return <DrawerDialog onClose={onCLose} isOpen={isOpen}>
    <div className={styles.roiDialog}>
      <DialogHeader title="ROI" handleClose={onCLose}/>
      <div className={styles.roiContent}>
        <div className={styles.topStatsContainer}>
          <div className={styles.topStats}>
            <Text variant={14} color="secondary">APR (incl. LP rewards)</Text>
            <Text variant={14}>{getDisplayApr(apr)}%</Text>
          </div>
          <div className={styles.topStats}>
            <Text variant={14} color="secondary">Base APR (yield only)</Text>
            <Text variant={14}>{getDisplayApr(farmApr, 0)}%</Text>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.gridHeader}>
            <div><Text>Timeframe</Text></div>
            <div className={styles.flexEnd}><Text>ROI</Text></div>
            <div className={styles.flexEnd}><Text>SOY per $1,000</Text></div>
          </div>
          <div className={styles.gridRows}>
            <div className={styles.gridRow}>
              <div><Text>1d</Text></div>
              <div className={styles.flexEnd}><Text>{getRoi({amountEarned: tokenEarnedPerThousand1D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</Text></div>
              <div className={styles.flexEnd}>
                <Text>{tokenEarnedPerThousand1D}</Text>
              </div>
            </div>
            <div className={styles.gridRow}>
              <div><Text>7d</Text></div>
              <div className={styles.flexEnd}><Text>{getRoi({amountEarned: tokenEarnedPerThousand7D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</Text></div>
              <div className={styles.flexEnd}>
                <Text>{tokenEarnedPerThousand7D}</Text>
              </div>
            </div>
            <div className={styles.gridRow}>
              <div><Text>30d</Text></div>
              <div className={styles.flexEnd}><Text>{getRoi({amountEarned: tokenEarnedPerThousand30D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</Text></div>
              <div className={styles.flexEnd}>
                <Text>{tokenEarnedPerThousand30D}</Text>
              </div>
            </div>
            <div className={styles.gridRow}>
              <div><Text>365d (APY)</Text></div>
              <div className={styles.flexEnd}><Text>{getRoi({amountEarned: tokenEarnedPerThousand365D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</Text></div>
              <div className={styles.flexEnd}>
                <Text>{tokenEarnedPerThousand365D}</Text>
              </div>
            </div>
          </div>
        </div>
        <ul className={styles.list}>
          <li><Text variant={14}>Calculated based on current rates.</Text></li>
          <li><Text variant={14}>Compounding 1x daily.</Text></li>
          <li><Text variant={14}>LP rewards: 0.2% trading fees, distributed proportionally among LP token holders.</Text></li>
          <li><Text variant={14}>All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.</Text></li>
        </ul>
      </div>
    </div>
  </DrawerDialog>;
}
