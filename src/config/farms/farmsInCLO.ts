import { FarmConfig } from "@/config/farms/types";
import { tokensInClo, wclo } from "@/config/token-lists/tokenListInCLO";
import { Address } from "viem";

const farms: FarmConfig[] = [
  /**
   * These 3 farms (PID 42, 43, 44) should always be at the top of the file.
   */
  {
    pid: 42,
    lpSymbol: 'SOY-CLO LP',
    lpAddress: '0x1ceE27d0627ce8A81dF9B4D7eEE0d753b8c2F613',
    localFarmAddress: '0x0CF951123B2d337eB52091bAbe61AfaDfff330b4',
    token: tokensInClo.soy,
    quoteToken: wclo,
  },
  {
    pid: 43,
    lpSymbol: 'BUSDT-CLO LP',
    lpAddress: '0xB852AD87329986EaC6e991954fe329231D1E4De1',
    localFarmAddress: '0x3A6B6E3e8f8cAdA392fD64A1a0527eacB1c187fe',
    token: tokensInClo.busdt,
    quoteToken: wclo,
  },
  {
    pid: 44,
    lpSymbol: 'SOY-BUSDT LP',
    lpAddress: '0x23288A0a9c7ac3bEC523aeED146E4F0bf04d6309',
    localFarmAddress: '0xe884efF699177acca9f362d24516FD3763C0489b',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.busdt,
  },
  {
    pid: 50,
    lpSymbol: 'CLOE-CLO LP',
    lpAddress: '0x6cC3F66d249D6bF299b226DEeB3E1c9Ed4dF60Da',
    localFarmAddress: '0xd3D623B5217634140A5Ab2852729aeA6bBeD2da4',
    token: tokensInClo.cloe,
    quoteToken: wclo,
  },
  {
    pid: 48,
    lpSymbol: 'ETC-SOY LP',
    lpAddress: '0xcE49b862ED38414C86914Df5E6d854AfBe203563',
    localFarmAddress: '0xE7DF85ABAB6505737713aC6eB53c8Ee03232cB14',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.etc,
  },
  {
    pid: 49,
    lpSymbol: 'ETC-CLO LP',
    lpAddress: '0x3493391e234834c93C0ED675A4872cF48D63AD1C',
    localFarmAddress: '0xf1308a20c8C30F0F64D5b870A5C17e2d91ee5950',
    token: tokensInClo.etc,
    quoteToken: wclo,
  },
  {
    pid: 45,
    lpSymbol: 'SOY-ETH LP',
    lpAddress: '0xE0A4D8356c0Ded2e0E7A4Af6DB2a164f7d1aD243',
    localFarmAddress: '0xe59c4537a901640dC3fC3c3b9Da7b18f9F589807',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.eth,
  },
  {
    pid: 47,
    lpSymbol: 'CLO-ETH LP',
    lpAddress: '0x162c8b62cDa2Ec98DafE8ccb0624bB2bc08d6a7b',
    localFarmAddress: '0x0556F967331e90b045870A0d59b74B50a659297e',
    token: tokensInClo.eth,
    quoteToken: wclo,
  },
  {
    pid: 46,
    lpSymbol: 'SOY-BNB LP',
    lpAddress: '0x3006b056eA9423804084D6bA9080d6356EC78c10',
    localFarmAddress: '0xA0412a0cd94Adb40E2d3c1dD95909Ff446fadE35',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.bnb,
  },
  {
    pid: 13,
    lpSymbol: 'CLO-BNB LP',
    lpAddress: '0x7543bf769903fEc667D73D58C602dEfFEcb2c9C2',
    localFarmAddress: '0xC58556bdA9A0083E3acF8fdDE838fd8941A423bF',
    token: wclo,
    quoteToken: tokensInClo.bnb,
  },
  {
    pid: 15,
    lpSymbol: 'SOY-CAKE LP',
    lpAddress: '0x4309b1FfF68E4C46abc9c92FB813cAFD1fC05A70',
    localFarmAddress: '0xa99E8864A727717F5C4c82031F99D360eb577738',
    token: tokensInClo.cake,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 16,
    lpSymbol: 'SOY-TWT LP',
    lpAddress: '0x7f342fEd3A80ea475631196709D2C6c4a94816C8',
    localFarmAddress: '0x6eFf6b17d4Ad50a25483Cc8d149fbfC275B05435',
    token: tokensInClo.twt,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 17,
    lpSymbol: 'SOY-WSG LP',
    lpAddress: '0xE92a69F2aCAad1480ec945A60fBFdFB921436F51',
    localFarmAddress: '0xDA979A3878AFF6cf6228740dfA75Da39c1aF141c',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.wsg,
  },
  {
    pid: 51,
    lpSymbol: 'SOY-CLOE LP',
    lpAddress: '0x9A95F9cf7Ea14264ef7AaC0798bbbE856246c0B2',
    localFarmAddress: '0x95547a1C6Fb6E89b7BD2bA3DE5097494cBE696Da',
    token: tokensInClo.cloe,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 19,
    lpSymbol: 'SOY-REEF LP',
    lpAddress: '0x15Bf7d259e0100247dEc1472686509B2Df458059',
    localFarmAddress: '0x5c70437Fd3a2CC1f328E33bccdC345E8bAe0afD2',
    token: tokensInClo.reef,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 20,
    lpSymbol: 'SOY-BAKE LP',
    lpAddress: '0xB48829bfd203eDa5C259f7609AB5c1d83a88a47b',
    localFarmAddress: '0x943c005eD3f77f44f17fF21a95E5043Bc04Bd3Fa',
    token: tokensInClo.bake,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 21,
    lpSymbol: 'SOY-SHIB LP',
    lpAddress: '0x4bf425f5b5bcb76e2b2e5e2A2EF0EF881D53a746',
    localFarmAddress: '0x23560EE7ccC3791e7Fb6D3371F4BB02Fa81F403c',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.shib,
  },
  {
    pid: 22,
    lpSymbol: 'SOY-RACA LP',
    lpAddress: '0x365F4B80C427EFDD6F2F1D06FF08bc2e2ffcA832',
    localFarmAddress: '0x9D8D90518e096e337Bd3f32C93579d8D270a2825',
    token: tokensInClo.raca,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 24,
    lpSymbol: 'SOY-LINA LP',
    lpAddress: '0xF344E4fc351b6BA97e6dF9DC03f6cCe824aE9FC2',
    localFarmAddress: '0xAEE5De40fB9d24006B1b02A51bED7D44eA544A98',
    token: tokensInClo.lina,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 25,
    lpSymbol: 'SOY-TON LP',
    lpAddress: '0x2831e574Fe43f0815091596d0e7982d2707A954A',
    localFarmAddress: '0x53aaFcf7B664DA84743730bc82CDb64F21694922',
    token: tokensInClo.ton,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 26,
    lpSymbol: 'SOY-XMS LP',
    lpAddress: '0x5Fc4Aa80cEDF18dFd1a1066fF0b02bB99DD09069',
    localFarmAddress: '0xcE6599adB4e51d2e4062E87f725461B90a81e636',
    token: tokensInClo.xms,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 27,
    lpSymbol: 'SOY-BTT LP',
    lpAddress: '0x7Bfbc45C60bFc6cdbf15aE3C79402dfD704124D8',
    localFarmAddress: '0x8967a2adc0E1B7B0422426e350Fe389a4745eC78',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.btt,
  },
  {
    pid: 28,
    lpSymbol: 'SOY-FTM LP',
    lpAddress: '0x6C1D9C58d5221dEdD8B5f4d1f53dEd75a34D8858',
    localFarmAddress: '0x755dACb811Bb64F3a1A9DF3dEdf12dAc7d14500B',
    token: tokensInClo.ftm,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 29,
    lpSymbol: 'SOY-BBT LP',
    lpAddress: '0x7698Aa8703623BB4bb149bb529e12Ab712952E26',
    localFarmAddress: '0xa11547041D82e4CcBCe8B9793c56964895fe471D',
    token: tokensInClo.bbt,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 30,
    lpSymbol: 'SOY-ANTEX LP',
    lpAddress: '0x03423DDB47730799c1250BFbd8A150E6d1D4BbBF',
    localFarmAddress: '0x542aB5a505fa2ba75836Ae87C6045EE03Ef8B41d',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.antex,
  },
  {
    pid: 31,
    lpSymbol: 'SOY-ZOO LP',
    lpAddress: '0x0F663DA289eD5E76C1CF7730A317F89D28A0B9E3',
    localFarmAddress: '0xDaD226E5c7A315946F938EA952b7D28548DF373d',
    token: tokensInClo.soy,
    quoteToken: tokensInClo.zoo,
  },
  {
    pid: 32,
    lpSymbol: 'SOY-BCOIN LP',
    lpAddress: '0x7c2DBd65342A472F053CeA6d7Ff46Cdc751Bc6B8',
    localFarmAddress: '0xf995d7628FEAF679A776f055c5E211D55Ef5D9Bd',
    token: tokensInClo.bcoin,
    quoteToken: tokensInClo.soy,
  },
  {
    pid: 38,
    lpSymbol: 'SOY-VVT LP',
    lpAddress: '0x7a314519C7F9dD5ca8018C3491e6E9aA97Cf67FC',
    localFarmAddress: '0xfa84594dBcF58951F538b6CEF1e07F6fa9362055',
    token: tokensInClo.vvt,
    quoteToken: tokensInClo.soy,
  }
];

const hexToString = (hex: Address) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexValue = hex.substr(i, 2);
    const decimalValue = parseInt(hexValue, 16);
    str += String.fromCharCode(decimalValue);
  }
  return str;
};

const preparedFarms = farms.map((farm) => {
  if(BigInt(farm.token.address) < BigInt(farm.quoteToken.address)) {
    return farm;
  } else {
    return {
      ...farm,
      quoteToken: farm.token,
      token: farm.quoteToken
    }
  }
});
export default preparedFarms;
