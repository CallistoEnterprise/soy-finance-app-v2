import {Interface} from "ethers";
import {PAIR_ABI, ERC_20_ABI} from "../abis";

export const ERC_20_INTERFACE = new Interface(ERC_20_ABI);
export const PAIR_INTERFACE = new Interface(PAIR_ABI);


