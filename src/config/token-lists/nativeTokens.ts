import { WrappedToken } from "@/config/types/WrappedToken";

export const nativeTokens: {
  [key: string]: WrappedToken
} = {
  820: new WrappedToken(
    820,
    "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a",
    18,
    "CLO",
    "Callisto Network",
    "/images/all-tokens/CLO.svg"
  ),
  61: new WrappedToken(
    61,
    "0x35e9A89e43e45904684325970B2E2d258463e072",
    18,
    "ETC",
    "Ethereum Classic",
    "/images/all-tokens/ETC.svg"
  ),
  199: new WrappedToken(
    199,
    "0x33e85f0e26600a6644b6c910639B0bc7a99fd34e",
    18,
    "BTT",
    "Bittorrent",
    "/images/all-tokens/BTT.svg"
  )
}
