import { Token } from "@callisto-enterprise/soy-sdk";
import { ChainId } from "@callisto-enterprise/soy-sdk/dist/constants";

export class WrappedToken extends Token {
  public readonly logoURI: string;
  public readonly address: `0x${string}`;
  constructor(chainId: ChainId, address: `0x${string}`, decimals: number, symbol: string, name: string, logoURI: string) {
    super(chainId, address, decimals, symbol, name);
    this.logoURI = logoURI;
    this.address = address;
  }
}
