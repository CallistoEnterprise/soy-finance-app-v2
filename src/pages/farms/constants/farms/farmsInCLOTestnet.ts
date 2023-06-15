import {tokens} from '../tokens';
import { FarmConfig } from '../../types';

const farms: FarmConfig[] = [
  {
    pid: 23,
    lpSymbol: 'SOY-CLO LP',
    lpAddresses: {
      20729: '0x8e58f4ddb28e1247bb868ca56909cae4379c3dd8',
      820: '',
    },
    localFarmAddresses: {
      820: '',
      20729: '0x11e826C2b7a9f3e956A25CE4990Adff631493C72',
    },
    token: tokens.soy,
    quoteToken: tokens.wclo,
  },
  {
    pid: 25,
    lpSymbol: 'CLO-BUSDT LP',
    lpAddresses: {
      20729: '0x427c92b6ee9c4885448708c725f909E9521b41AA',
      820: '',
    },
    localFarmAddresses: {
      820: '',
      20729: '0x3095564bD195B30C4D6d0ad034d3aB52ECC6523A',
    },
    token: tokens.busdt,
    quoteToken: tokens.wclo,
  },
  {
    pid: 24,
    lpSymbol: 'SOY-BUSDT LP',
    lpAddresses: {
      20729: '0x79601d78fdc16cd0fbbE79D54aE5a1A010EC16a2',
      820: '',
    },
    localFarmAddresses: {
      820: '',
      20729: '0x95626AE6260dA16463D0e9CA077cbE9b47c25Fa8',
    },
    token: tokens.soy,
    quoteToken: tokens.busdt,
  },
  {
    pid: 20,
    lpSymbol: 'CLO-TMT LP',
    lpAddresses: {
      20729: '0x28B4Ffce7BF5E9b984FeebC62c042E4Ee05E443f',
      820: '',
    },
    localFarmAddresses: {
      820: '',
      20729: '0xC14e256C295A1C873ae21E05cc88956Add15C293',
    },
    token: tokens.tmt,
    quoteToken: tokens.wclo,
  },
  {
    pid: 22,
    lpSymbol: 'SOY-TMT LP',
    lpAddresses: {
      20729: '0x8531a6fda1905e91ce6ab5d1b5f0dad158cd74e3',
      820: '',
    },
    localFarmAddresses: {
      820: '',
      20729: '0xe9d02a3fE2e7785Cd45d99a0F5F923e3E59CfC27',
    },
    token: tokens.tmt,
    quoteToken: tokens.soy,
  },
]

export default farms
