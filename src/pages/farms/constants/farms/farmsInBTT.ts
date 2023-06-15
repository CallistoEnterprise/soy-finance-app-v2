import {FarmConfig} from "../../types";
import {tokens} from "../tokens";

const farms: FarmConfig[] = [
  {
    pid: 10,
    lpSymbol: 'SOY-BTT LP',
    lpAddresses: {
      199: '0xbB7f3891d68dB2bbb1FE798Caa4ebae655861a9D',
    },
    localFarmAddresses: {
      199: '0xF9A65D050323Ec4981ad9c2a43c1E624D71d6bB8',
    },
    token: tokens.wbtt,
    quoteToken: tokens.soy,
  },
  {
    pid: 14,
    lpSymbol: 'BUSDT-BTT LP',
    lpAddresses: {
      199: '0x8d41B1B6bF0Dd2FaFf25B48D1D36B94f41353124',
    },
    localFarmAddresses: {
      199: '0x71Db9B83562b2242787D43871848Fe10AA5a7d46',
    },
    token: tokens.busdt,
    quoteToken: tokens.wbtt,
  },
  {
    pid: 19,
    lpSymbol: 'SOY-BUSDT LP',
    lpAddresses: {
      199: '0x81e8168e9EC44c490E843E69b20ac0A080b3c4cD',
    },
    localFarmAddresses: {
      199: '0x97BfcF06464e77B56C22F3Db4a76899d19826DC7',
    },
    token: tokens.soy,
    quoteToken: tokens.busdt,
  },
  {
    pid: 9,
    lpSymbol: 'SOY-CLO LP',
    lpAddresses: {
      199: '0x594dE10db81BFcA5206c3ABc1aA8b9Df141acaFF',
    },
    localFarmAddresses: {
      199: '0x79D65F4F1E44FEa4E77687a72122Bb2fCFEaD6af',
    },
    token: tokens.ccclo,
    quoteToken: tokens.soy,
  },
  {
    pid: 11,
    lpSymbol: 'SOY-ETC LP',
    lpAddresses: {
      199: '0xeB063E88dA5509ea3901e324cb80634a341aa1a7',
    },
    localFarmAddresses: {
      199: '0xaE133aABA0AA4cfa60cd30a29da0149038D01f38',
    },
    token: tokens.ccetc,
    quoteToken: tokens.soy,
  },
  {
    pid: 12,
    lpSymbol: 'SOY-BNB LP',
    lpAddresses: {
      199: '0xb65E99554d840EE7bac1ECDc39e4f112C47dc39c',
    },
    localFarmAddresses: {
      199: '0x87ff8941A94c13Ac707d4ADc41a71Ed6458580F8',
    },
    token: tokens.ccbnb_erc223,
    quoteToken: tokens.soy,
  },
  {
    pid: 13,
    lpSymbol: 'SOY-ETH LP',
    lpAddresses: {
      199: '0xb812Bf355bEC388390E24B34936a440fc25EaD01',
    },
    localFarmAddresses: {
      199: '0x1019314024B8B0c5D2ee733A7Aee7Ed7D4A655fB',
    },
    token: tokens.cceth_erc223,
    quoteToken: tokens.soy,
  },
  {
    pid: 15,
    lpSymbol: 'CLO-BTT LP',
    lpAddresses: {
      199: '0x535c3B730a28Da2a45496C8fD0c561711c2DC6D4',
    },
    localFarmAddresses: {
      199: '0x6b5e2f20eEC0C5682F7E5a60A7444B7ab3B36558',
    },
    token: tokens.wbtt,
    quoteToken: tokens.ccclo,
  },
  {
    pid: 16,
    lpSymbol: 'CLO-ETC LP',
    lpAddresses: {
      199: '0x82983fA0E59172b4A5650c5FaE057faCeD5F22Aa',
    },
    localFarmAddresses: {
      199: '0xf89778306E83e13D00644044b10bBe3470a8EaC1',
    },
    token: tokens.ccetc,
    quoteToken: tokens.ccclo,
  },
  {
    pid: 17,
    lpSymbol: 'CLO-BNB LP',
    lpAddresses: {
      199: '0x3c0c86714e1bE0e0ad9BB2c7541d6a07CFF9C6Cd',
    },
    localFarmAddresses: {
      199: '0xd6aE8C78aa9cd32b9B50828cb2Bf36E2e28b7E91',
    },
    token: tokens.ccbnb_erc223,
    quoteToken: tokens.ccclo,
  },
  {
    pid: 18,
    lpSymbol: 'CLO-ETH LP',
    lpAddresses: {
      199: '0x22778d7f404cf6Ea9220D551ef045971897D7D9a',
    },
    localFarmAddresses: {
      199: '0x3f7B6dAfD37941520A8056eB22D26876ad22a8e7',
    },
    token: tokens.cceth_erc223,
    quoteToken: tokens.ccclo,
  },
  {
    pid: 20,
    lpSymbol: 'BTT-CLOE LP',
    lpAddresses: {
      199: '0x4107B98925140896dB8Da756a5d216f503580E1E',
    },
    localFarmAddresses: {
      199: '0x183e0d3FD5b10d26a506dbF14254C912c3a70c5A',
    },
    token: tokens.cloe,
    quoteToken: tokens.wbtt,
  },
]

export default farms
