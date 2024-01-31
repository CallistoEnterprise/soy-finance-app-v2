import { FarmConfig } from "@/config/farms/types";
import {tokensInEtc, wetc} from "@/config/token-lists/tokenlistInETC";

const farms: FarmConfig[] = [
  {
    pid: 2,
    lpSymbol: 'SOY-ETC LP',
    lpAddress: '0x397F68cA220713d12d4Dcfd5c59938949EC0E486',
    localFarmAddress: '0x60C7712a3a390dce7B45d9B21De43Ba0eEa43FD1',
    token: wetc,
    quoteToken: tokensInEtc.soy,
  },
  {
    pid: 6,
    lpSymbol: 'BUSDT-ETC LP',
    lpAddress: '0xFb6414f689e93BaCd942919FBA7cD8aA7F5e5c64',
    localFarmAddress: '0xfD75e99f6EdbE847FF1119E73484ca32Ac8B3d77',
    token: tokensInEtc.busdt,
    quoteToken: wetc,
  },
  {
    pid: 5,
    lpSymbol: 'SOY-BUSDT LP',
    lpAddress:'0x2806a90e445D05012875357C132430fb1931e234',
    localFarmAddress:'0x1c97E8d41990d1DA7D96BD211d8BF4a3aE1D5C69',
    token: tokensInEtc.soy,
    quoteToken: tokensInEtc.busdt,
  },
  {
    pid: 1,
    lpSymbol: 'SOY-CLO LP',
    lpAddress:'0x715CE66eE2256663D375077cda6fE623e76Bde42',
    localFarmAddress:'0x82f8c39e53C3Fe695c28998529A1D226A32d6368',
    token: tokensInEtc.clo,
    quoteToken: tokensInEtc.soy,
  },
  {
    pid: 3,
    lpSymbol: 'SOY-BNB LP',
    lpAddress:'0xAa14e66384109A200Aad29CDB44aF3710633A491',
    localFarmAddress:'0x82f1419e6aB1e3A03B64A59Cfe1270E2Ff890344',
    token: tokensInEtc.bnb,
    quoteToken: tokensInEtc.soy,
  },
  {
    pid: 4,
    lpSymbol: 'SOY-ETH LP',
    lpAddress:'0xDcE9230213B7128cbA06Ff56408352201dcFa274',
    localFarmAddress:'0x40482830A0349dd8AD061936FDd1FF18F7900286',
    token: tokensInEtc.eth,
    quoteToken: tokensInEtc.soy,
  },
  {
    pid: 7,
    lpSymbol: 'CLO-ETC LP',
    lpAddress:'0xB81100597264D57e949d91a72c3f6a7d0B3Daec2',
    localFarmAddress:'0x88cEa92a8D2Ce64215e37dd540600B87Ccac4aD7',
    token: wetc,
    quoteToken: tokensInEtc.clo,
  },
  {
    pid: 8,
    lpSymbol: 'CLO-BNB LP',
    lpAddress:'0xAD9788198a7eA6DA2e6DA0bf20EB465d727F7b4a',
    localFarmAddress:'0xde2fE5985F1293356BC98D73Ef84521022d7f872',
    token: tokensInEtc.bnb,
    quoteToken: tokensInEtc.clo,
  },
  {
    pid: 9,
    lpSymbol: 'CLO-ETH LP',
    lpAddress:'0x4b2f3C8Fd465cF711E80Dd2BF7918E3d91d95384',
    localFarmAddress:'0x101e80A2838012dde964E8323031C4df7e21BDc6',
    token: wetc,
    quoteToken: tokensInEtc.clo,
  },
  {
    pid: 10,
    lpSymbol: 'ETC-CLOE LP',
    lpAddress:'0x87A3D667cA24B78F85A4EE3CCd8f285CC74A9C3f',
    localFarmAddress:'0x1adE101cCBE2aA6Db8D4c55DbdE6Ab594f99E4f9',
    token: tokensInEtc.cloe,
    quoteToken: wetc,
  },
]

export default farms
