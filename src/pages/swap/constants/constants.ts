import {WrappedTokenInfo} from "../functions";
import {nativeTokens} from "../../../shared/hooks/useAllTokens";

export const baseTokens: {[key: number]: Array<WrappedTokenInfo>} = {
  820: [
    nativeTokens["820"],
    new WrappedTokenInfo({
      chainId: 820,
      address: '0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65',
      symbol: "SOY",
      name: "Soy-ERC223",
      decimals: 18,
      logoURI: "/images/all-tokens/SOY.svg"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xbf6c50889d3a620eb42C0F188b65aDe90De958c4',
      symbol: "BUSDT",
      name: "Bulls USD",
      decimals: 18,
      logoURI: "/images/all-tokens/BUSDT.svg"
    }, [])
  ],
  199: [
    nativeTokens["199"],
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53',
      symbol: "ccCLO",
      name: "Wrapped CLO",
      decimals: 18,
      logoURI: "/images/all-tokens/CLO.svg"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xcC00860947035a26Ffe24EcB1301ffAd3a89f910',
      symbol: "SOY",
      name: "Wrapped SOY",
      decimals: 18,
      logoURI: "/images/all-tokens/SOY.svg"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xCC78D0A86B0c0a3b32DEBd773Ec815130F9527CF',
      symbol: "BUSDT",
      name: "Tether",
      decimals: 18,
      logoURI: "/images/all-tokens/BUSDT.svg"
    }, [])
  ],
  61: [
    nativeTokens["61"],
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xcC67D978Ddf07971D9050d2b424f36f6C1a15893',
      symbol: "SOY",
      name: "Wrapped SOY",
      decimals: 18,
      logoURI: "/images/all-tokens/SOY.svg"
    }, []),
    new WrappedTokenInfo({
      chainId: 820,
      address: '0xCC48CD0B4a6f50b8f8bf0f9b80eD7881fA547968',
      symbol: "BUSDT",
      name: "Bulls USD",
      decimals: 18,
      logoURI: "/images/all-tokens/BUSDT.svg"
    }, [])
  ]
}
