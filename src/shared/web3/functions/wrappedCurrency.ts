import {ChainId, Currency, ETHERS, Token, WETH} from "@callisto-enterprise/soy-sdk";

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHERS[chainId]
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined;
}
