import {tokens} from '../tokens'
import {FarmConfig} from "../../types";

const farms: FarmConfig[] = [
  /**
   * These 3 farms (PID 2, 4) should always be at the top of the file.
   */

  {
    pid: 2,
    lpSymbol: 'SOY-CLO LP',
    lpAddresses: {
      20729: '',
      820: '0x1ceE27d0627ce8A81dF9B4D7eEE0d753b8c2F613',
    },
    localFarmAddresses: {
      820: '0xf43Db9BeC8F8626Cb5ADD409C7EBc7272c8f5F8f',
      20729: '',
    },
    token: tokens.soy,
    quoteToken: tokens.wclo,
  },
  {
    pid: 4,
    lpSymbol: 'BUSDT-CLO LP',
    lpAddresses: {
      20729: '',
      820: '0xB852AD87329986EaC6e991954fe329231D1E4De1',
    },
    localFarmAddresses: {
      820: '0x3E5B906eE1Cb467E1511a2b1ad5a1bc4a3F9BF8B',
      20729: '',
    },
    token: tokens.busdt,
    quoteToken: tokens.wclo,
  },
  {
    pid: 5,
    lpSymbol: 'SOY-BUSDT LP',
    lpAddresses: {
      20729: '',
      820: '0x23288A0a9c7ac3bEC523aeED146E4F0bf04d6309',
    },
    localFarmAddresses: {
      820: '0xf16edf5Ba6bc116C17f6769deB470a190e272381',
      20729: '',
    },
    token: tokens.soy,
    quoteToken: tokens.busdt,
  },
  {
    pid: 3,
    lpSymbol: 'CLOE-CLO LP',
    lpAddresses: {
      20729: '',
      820: '0x6cC3F66d249D6bF299b226DEeB3E1c9Ed4dF60Da',
    },
    localFarmAddresses: {
      820: '0xfe61A8dc1458D013f31b7B5d0DDf82864Cf89035',
      20729: '',
    },
    token: tokens.cloe,
    quoteToken: tokens.wclo,
  },
  {
    pid: 8,
    lpSymbol: 'ETC-SOY LP',
    lpAddresses: {
      20729: '',
      820: '0xcE49b862ED38414C86914Df5E6d854AfBe203563',
    },
    localFarmAddresses: {
      820: '0xF257e70b0B4A5E75BD351ceA7499b54f29636b0c',
      20729: '',
    },
    token: tokens.ccetc,
    quoteToken: tokens.soy,
  },
  {
    pid: 9,
    lpSymbol: 'ETC-CLO LP',
    lpAddresses: {
      20729: '',
      820: '0x3493391e234834c93C0ED675A4872cF48D63AD1C',
    },
    localFarmAddresses: {
      820: '0x009B08c79aF977557513a71132fC1CcC582Be310',
      20729: '',
    },
    token: tokens.ccetc,
    quoteToken: tokens.wclo,
  },
  {
    pid: 10,
    lpSymbol: 'SOY-ETH LP',
    lpAddresses: {
      20729: '',
      820: '0xE0A4D8356c0Ded2e0E7A4Af6DB2a164f7d1aD243',
    },
    localFarmAddresses: {
      820: '0xC2d33425aD2A25d78252a31d6f2C51A2F4f31394',
      20729: '',
    },
    token: tokens.cceth_erc223,
    quoteToken: tokens.soy,
  },
  {
    pid: 11,
    lpSymbol: 'CLO-ETH LP',
    lpAddresses: {
      20729: '',
      820: '0x162c8b62cDa2Ec98DafE8ccb0624bB2bc08d6a7b',
    },
    localFarmAddresses: {
      820: '0xe32077c789f671A7Ef41D5706b6D7A411C7dB98f',
      20729: '',
    },
    token: tokens.cceth_erc223,
    quoteToken: tokens.wclo,
  },
  {
    pid: 12,
    lpSymbol: 'SOY-BNB LP',
    lpAddresses: {
      20729: '',
      820: '0x3006b056eA9423804084D6bA9080d6356EC78c10',
    },
    localFarmAddresses: {
      820: '0xF411Ff92CAcd87Ee7EcB4fD83A5e7AF5D2946c9e',
      20729: '',
    },
    token: tokens.ccbnb_erc223,
    quoteToken: tokens.soy,
  },
  {
    pid: 13,
    lpSymbol: 'CLO-BNB LP',
    lpAddresses: {
      20729: '',
      820: '0x7543bf769903fEc667D73D58C602dEfFEcb2c9C2',
    },
    localFarmAddresses: {
      820: '0xC58556bdA9A0083E3acF8fdDE838fd8941A423bF',
      20729: '',
    },
    token: tokens.ccbnb_erc223,
    quoteToken: tokens.wclo,
  },
  {
    pid: 15,
    lpSymbol: 'SOY-CAKE LP',
    lpAddresses: {
      20729: '',
      820: '0x4309b1FfF68E4C46abc9c92FB813cAFD1fC05A70',
    },
    localFarmAddresses: {
      820: '0xa99E8864A727717F5C4c82031F99D360eb577738',
      20729: '',
    },
    token: tokens.cake,
    quoteToken: tokens.soy,
  },
  {
    pid: 16,
    lpSymbol: 'SOY-TWT LP',
    lpAddresses: {
      20729: '',
      820: '0x7f342fEd3A80ea475631196709D2C6c4a94816C8',
    },
    localFarmAddresses: {
      820: '0x6eFf6b17d4Ad50a25483Cc8d149fbfC275B05435',
      20729: '',
    },
    token: tokens.twt,
    quoteToken: tokens.soy,
  },
  {
    pid: 17,
    lpSymbol: 'SOY-WSG LP',
    lpAddresses: {
      20729: '',
      820: '0xE92a69F2aCAad1480ec945A60fBFdFB921436F51',
    },
    localFarmAddresses: {
      820: '0xDA979A3878AFF6cf6228740dfA75Da39c1aF141c',
      20729: '',
    },
    token: tokens.wsg,
    quoteToken: tokens.soy,
  },
  {
    pid: 18,
    lpSymbol: 'SOY-CLOE LP',
    lpAddresses: {
      20729: '',
      820: '0x9A95F9cf7Ea14264ef7AaC0798bbbE856246c0B2',
    },
    localFarmAddresses: {
      820: '0x8c0A982A4193c6bF8Eea6637Db0CF9160dCF91fD',
      20729: '',
    },
    token: tokens.cloe,
    quoteToken: tokens.soy,
  },
  {
    pid: 19,
    lpSymbol: 'SOY-REEF LP',
    lpAddresses: {
      20729: '',
      820: '0x15Bf7d259e0100247dEc1472686509B2Df458059',
    },
    localFarmAddresses: {
      820: '0x5c70437Fd3a2CC1f328E33bccdC345E8bAe0afD2',
      20729: '',
    },
    token: tokens.reef,
    quoteToken: tokens.soy,
  },
  {
    pid: 20,
    lpSymbol: 'SOY-BAKE LP',
    lpAddresses: {
      20729: '',
      820: '0xB48829bfd203eDa5C259f7609AB5c1d83a88a47b',
    },
    localFarmAddresses: {
      820: '0x943c005eD3f77f44f17fF21a95E5043Bc04Bd3Fa',
      20729: '',
    },
    token: tokens.bake,
    quoteToken: tokens.soy,
  },
  {
    pid: 21,
    lpSymbol: 'SOY-SHIB LP',
    lpAddresses: {
      20729: '',
      820: '0x4bf425f5b5bcb76e2b2e5e2A2EF0EF881D53a746',
    },
    localFarmAddresses: {
      820: '0x23560EE7ccC3791e7Fb6D3371F4BB02Fa81F403c',
      20729: '',
    },
    token: tokens.shib,
    quoteToken: tokens.soy,
  },
  {
    pid: 22,
    lpSymbol: 'SOY-RACA LP',
    lpAddresses: {
      20729: '',
      820: '0x365F4B80C427EFDD6F2F1D06FF08bc2e2ffcA832',
    },
    localFarmAddresses: {
      820: '0x9D8D90518e096e337Bd3f32C93579d8D270a2825',
      20729: '',
    },
    token: tokens.raca,
    quoteToken: tokens.soy,
  },
  {
    pid: 24,
    lpSymbol: 'SOY-LINA LP',
    lpAddresses: {
      20729: '',
      820: '0xF344E4fc351b6BA97e6dF9DC03f6cCe824aE9FC2',
    },
    localFarmAddresses: {
      820: '0xAEE5De40fB9d24006B1b02A51bED7D44eA544A98',
      20729: '',
    },
    token: tokens.lina,
    quoteToken: tokens.soy,
  },
  {
    pid: 25,
    lpSymbol: 'SOY-TON LP',
    lpAddresses: {
      20729: '',
      820: '0x2831e574Fe43f0815091596d0e7982d2707A954A',
    },
    localFarmAddresses: {
      820: '0x53aaFcf7B664DA84743730bc82CDb64F21694922',
      20729: '',
    },
    token: tokens.ton,
    quoteToken: tokens.soy,
  },
  {
    pid: 26,
    lpSymbol: 'SOY-XMS LP',
    lpAddresses: {
      20729: '',
      820: '0x5Fc4Aa80cEDF18dFd1a1066fF0b02bB99DD09069',
    },
    localFarmAddresses: {
      820: '0xcE6599adB4e51d2e4062E87f725461B90a81e636',
      20729: '',
    },
    token: tokens.xms,
    quoteToken: tokens.soy,
  },
  {
    pid: 27,
    lpSymbol: 'SOY-BTT LP',
    lpAddresses: {
      20729: '',
      820: '0x7Bfbc45C60bFc6cdbf15aE3C79402dfD704124D8',
    },
    localFarmAddresses: {
      820: '0x8967a2adc0E1B7B0422426e350Fe389a4745eC78',
      20729: '',
    },
    token: tokens.btt,
    quoteToken: tokens.soy,
  },
  {
    pid: 28,
    lpSymbol: 'SOY-FTM LP',
    lpAddresses: {
      20729: '',
      820: '0x6C1D9C58d5221dEdD8B5f4d1f53dEd75a34D8858',
    },
    localFarmAddresses: {
      820: '0x755dACb811Bb64F3a1A9DF3dEdf12dAc7d14500B',
      20729: '',
    },
    token: tokens.ftm,
    quoteToken: tokens.soy,
  },
  {
    pid: 29,
    lpSymbol: 'SOY-BBT LP',
    lpAddresses: {
      20729: '',
      820: '0x7698Aa8703623BB4bb149bb529e12Ab712952E26',
    },
    localFarmAddresses: {
      820: '0xa11547041D82e4CcBCe8B9793c56964895fe471D',
      20729: '',
    },
    token: tokens.bbt,
    quoteToken: tokens.soy,
  },
  {
    pid: 30,
    lpSymbol: 'SOY-ANTEX LP',
    lpAddresses: {
      20729: '',
      820: '0x03423DDB47730799c1250BFbd8A150E6d1D4BbBF',
    },
    localFarmAddresses: {
      820: '0x542aB5a505fa2ba75836Ae87C6045EE03Ef8B41d',
      20729: '',
    },
    token: tokens.antex,
    quoteToken: tokens.soy,
  },
  {
    pid: 31,
    lpSymbol: 'SOY-ZOO LP',
    lpAddresses: {
      20729: '',
      820: '0x0F663DA289eD5E76C1CF7730A317F89D28A0B9E3',
    },
    localFarmAddresses: {
      820: '0xDaD226E5c7A315946F938EA952b7D28548DF373d',
      20729: '',
    },
    token: tokens.zoo,
    quoteToken: tokens.soy,
  },
  {
    pid: 32,
    lpSymbol: 'SOY-BCOIN LP',
    lpAddresses: {
      20729: '',
      820: '0x7c2DBd65342A472F053CeA6d7Ff46Cdc751Bc6B8',
    },
    localFarmAddresses: {
      820: '0xf995d7628FEAF679A776f055c5E211D55Ef5D9Bd',
      20729: '',
    },
    token: tokens.bcoin,
    quoteToken: tokens.soy,
  },
  {
    pid: 38,
    lpSymbol: 'SOY-VVT LP',
    lpAddresses: {
      20729: '',
      820: '0x7a314519C7F9dD5ca8018C3491e6E9aA97Cf67FC',
    },
    localFarmAddresses: {
      820: '0xfa84594dBcF58951F538b6CEF1e07F6fa9362055',
      20729: '',
    },
    token: tokens.vvt,
    quoteToken: tokens.soy,
  },
]

export default farms
