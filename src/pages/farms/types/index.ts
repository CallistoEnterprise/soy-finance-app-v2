import {FixedNumber} from "ethers";

export interface Address {
  20729?: string
  820?: string
  199?: string
  61?: string
}

export interface Token {
  symbol: string
  address?: Address
  decimals?: number
  projectLink?: string
  usdcPrice?: FixedNumber
}

export interface FarmConfig {
  pid: number
  lpSymbol: string
  lpAddresses: Address
  token: Token
  quoteToken: Token
  localFarmAddresses?: Address
  multiplier?: BigInt
  isCommunity?: boolean
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
}
