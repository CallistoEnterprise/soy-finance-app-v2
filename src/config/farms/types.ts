import { Address } from "viem";
import { TokenInfo } from "@/config/types/TokenInfo";

export interface Token {
  symbol: string
  address?: Address
  decimals?: number
  projectLink?: string
  usdcPrice?: any
}

export interface FarmConfig {
  pid: number
  lpSymbol: string
  lpAddress: Address
  token: TokenInfo
  quoteToken: TokenInfo
  localFarmAddress: Address
  multiplier?: BigInt
  isCommunity?: boolean
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
}
