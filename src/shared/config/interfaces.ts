import {Interface} from "ethers";
import {PAIR_ABI, ERC_20_ABI, ROUTER_ABI, ERC_223_ABI, MASTERCHEF_ABI, LOCAL_FARM_ABI} from "../abis";

export const ERC_20_INTERFACE = new Interface(ERC_20_ABI);
export const PAIR_INTERFACE = new Interface(PAIR_ABI);
export const ROUTER_INTERFACE = new Interface(ROUTER_ABI);
export const ERC_223_INTERFACE = new Interface(ERC_223_ABI);
export const MASTER_CHEF_INTERFACE = new Interface(MASTERCHEF_ABI);
export const LOCAL_FARM_INTERFACE = new Interface(LOCAL_FARM_ABI);



