import {BrowserProvider, Contract, isAddress, Signer} from "ethers";
import {AddressZero} from "@ethersproject/constants";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import routerABI from "../abis/interfaces/router.json";

type ProviderOrSigner = BrowserProvider | Signer | undefined;

export const ROUTER_ADDRESS = {
  [ChainId.MAINNET]: '0xeB5B468fAacC6bBdc14c4aacF0eec38ABCCC13e7',
  [ChainId.CLOTESTNET]: '0xdbe46b17FFd35D6865b69F9398AC5454389BF38c',
  [ChainId.BTTMAINNET]: '0x8Cb2e43e5AEB329de592F7e49B6c454649b61929',
  [ChainId.ETCCLASSICMAINNET]: '0x8c5Bba04B2f5CCCe0f8F951D2DE9616BE190070D',
  [ChainId.ETHEREUM]: '0x8c5bba04b2f5ccce0f8f951d2de9616be190070d'
};

const DEFAULT_CHAIN_ID = 820;

export async function getSigner(library: BrowserProvider, account: string): Promise<Signer | undefined> {
  return library?.getSigner(account);
}

export async function getProviderOrSigner(library: BrowserProvider, account?: string): Promise<ProviderOrSigner> {
  return account ? getSigner(library, account) : library;
}

export function getContract(address: string, ABI: any, library: BrowserProvider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as ProviderOrSigner)
}

export async function getRouterContract(chainId: number, library: BrowserProvider, account?: string): Promise<Contract> {
  return getContract(ROUTER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID], routerABI, library, account);
}
