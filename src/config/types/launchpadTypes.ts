export type ChainDetails = {
  tokenAddress: `0x${string}`;
  icoContract: `0x${string}`;
  vestingContract: `0x${string}`;
  currencies: {useNativeAsPayment: boolean, nativePrice: number, tokens: object[]}
}

export type Launchpad = {
  chains: {[key: string]: ChainDetails};
  saleType: string;
  logo: string;
  description: string;
  supply: string;
  softCap: string;
  hardCap: string;
  endDate: string;
  website: string;
  twitter: string;
  telegram: string;
  minDescription: string;
};