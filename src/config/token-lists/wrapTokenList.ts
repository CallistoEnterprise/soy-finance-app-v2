import { TokenInfo } from "@/config/types/TokenInfo";
import { WrappedToken } from "@/config/types/WrappedToken";

export function wrapTokenList(tokenList: TokenInfo[]): WrappedToken[] {
  return tokenList.map(({ chainId, symbol, logoURI, decimals, name, address }) => {
    return new WrappedToken(
      chainId,
      address,
      decimals,
      symbol,
      name,
      logoURI
    )
  })
}
