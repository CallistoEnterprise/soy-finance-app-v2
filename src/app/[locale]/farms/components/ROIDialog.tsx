import { useMemo } from "react";
import DialogHeader from "@/components/DialogHeader";
import Dialog from "@/components/atoms/Dialog";
import DrawerDialog from "@/components/atoms/DrawerDialog";

export const tokenEarnedPerThousandDollarsCompounding = ({
                                                           numberOfDays,
                                                           farmApr,
                                                           tokenPrice,
                                                           roundingDecimals = 2,
                                                           compoundFrequency = 1,
                                                           performanceFee = 0,
                                                         }: any) => {
  // Everything here is worked out relative to a year, with the asset compounding at the compoundFrequency rate. 1 = once per day
  const timesCompounded = 365 * compoundFrequency
  // We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
  let aprAsDecimal = farmApr / 100

  if (performanceFee) {
    // Reduce the APR by the % performance fee
    const feeRelativeToApr = (farmApr / 100) * performanceFee
    const aprAfterFee = farmApr - feeRelativeToApr

    aprAsDecimal = aprAfterFee / 100
  }

  const daysAsDecimalOfYear = numberOfDays / 365
  // Calculate the starting TOKEN balance with a dollar balance of $1000.
  const principal = 1000 / tokenPrice
  // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
  const finalAmount = principal * (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)
  // To get the TOKEN amount earned, deduct the amount after compounding (finalAmount) from the starting TOKEN balance (principal)
  const interestEarned = finalAmount - principal


  if(isNaN(interestEarned)) {
    return 0;
  }
  // return parseFloat((interestEarned * 10).toFixed(roundingDecimals))
  return parseFloat(interestEarned.toFixed(roundingDecimals))
}

export const getRoi = ({amountEarned, amountInvested}: any) => {
  if(isNaN(amountEarned) || isNaN(amountInvested)) {
    return 0;
  }

  return (amountEarned / amountInvested) * 100
}

export const getDisplayApr = (cakeRewardsApr: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2})
  }

  if (cakeRewardsApr) {
    return (+cakeRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2})
  }

  return 0;
}

interface Props {
  setIsOpen: (isOpen: boolean) => void,
  isOpen: boolean,
  tokenPrice: number,
  farmApr: number,
  lpApr: number,
  roundingDecimals?: number,
  compoundFrequency?: number
}
export default function ROIDialog({
                                    setIsOpen, isOpen,
                                    tokenPrice,
                                    farmApr,
                                    lpApr,
                                    roundingDecimals = 2,
                                    compoundFrequency = 1
                                  }: Props) {
  const oneThousandDollarsWorthOfToken = 1000 / tokenPrice;

  const apr = useMemo(() => {
    if (farmApr && lpApr) {
      return farmApr + lpApr;
    }

    if (farmApr) {
      return farmApr;
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

  return <DrawerDialog setIsOpen={setIsOpen} isOpen={isOpen}>
    <div className="w-full xl:w-[480px]">
      <DialogHeader title="ROI" handleClose={() => setIsOpen(false)}/>
      <div className="p-10">
        <div className="grid gap-3 mb-5 text-14">
          <div className="flex justify-between items-center">
            <p className="text-secondary-text">APR (incl. LP rewards)</p>
            <p>{getDisplayApr(apr)}%</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-secondary-text">Base APR (yield only)</p>
            <p>{getDisplayApr(farmApr, 0)}%</p>
          </div>
        </div>

        <div className="border border-primary-border rounded-2 mb-5">
          <div className="grid grid-cols-roi bg-green/20 rounded-t-2 h-10 px-5">
            <div className="flex items-center"><p>Timeframe</p></div>
            <div className="flex items-center justify-end"><p>ROI</p></div>
            <div className="flex items-center justify-end"><p>SOY per $1,000</p></div>
          </div>
          <div className="grid gap-2.5 p-5">
            <div className="grid grid-cols-roi">
              <div className="flex items-center"><p>1d</p></div>
              <div className="flex items-center justify-end"><p>{getRoi({amountEarned: tokenEarnedPerThousand1D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</p></div>
              <div className="flex items-center justify-end">
                <p>{tokenEarnedPerThousand1D}</p>
              </div>
            </div>
            <div className="grid grid-cols-roi">
              <div className="flex items-center"><p>7d</p></div>
              <div className="flex items-center justify-end"><p>{getRoi({amountEarned: tokenEarnedPerThousand7D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</p></div>
              <div className="flex items-center justify-end">
                <p>{tokenEarnedPerThousand7D}</p>
              </div>
            </div>
            <div className="grid grid-cols-roi">
              <div className="flex items-center"><p>30d</p></div>
              <div className="flex items-center justify-end"><p>{getRoi({amountEarned: tokenEarnedPerThousand30D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</p></div>
              <div className="flex items-center justify-end">
                <p>{tokenEarnedPerThousand30D}</p>
              </div>
            </div>
            <div className="grid grid-cols-roi">
              <div className="flex items-center"><p>365d (APY)</p></div>
              <div className="flex items-center justify-end"><p>{getRoi({amountEarned: tokenEarnedPerThousand365D, amountInvested: oneThousandDollarsWorthOfToken}).toFixed(
                roundingDecimals,
              )}
                %</p></div>
              <div className="flex items-center justify-end">
                <p>{tokenEarnedPerThousand365D}</p>
              </div>
            </div>
          </div>
        </div>
        <ul className="grid gap-3 text-14 -tracking-[0.28px]">
          <li className="relative pl-4 before:w-2 before:h-2 before:rounded-2 before:bg-green before:absolute before:left-0 before:top-1.5"><p>Calculated based on current rates.</p></li>
          <li className="relative pl-4 before:w-2 before:h-2 before:rounded-2 before:bg-green before:absolute before:left-0 before:top-1.5"><p>Compounding 1x daily.</p></li>
          <li className="relative pl-4 before:w-2 before:h-2 before:rounded-2 before:bg-green before:absolute before:left-0 before:top-1.5"><p>LP rewards: 0.2% trading fees, distributed proportionally among LP token holders.</p></li>
          <li className="relative pl-4 before:w-2 before:h-2 before:rounded-2 before:bg-green before:absolute before:left-0 before:top-1.5"><p>All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.</p></li>
        </ul>
      </div>
    </div>
  </DrawerDialog>;
}
