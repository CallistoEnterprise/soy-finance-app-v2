import {ERC_20_INTERFACE, PAIR_INTERFACE} from "./interfaces";
import {FunctionFragment} from "ethers";

export function useErc20Fragment(method: string): FunctionFragment | null {
  return ERC_20_INTERFACE.getFunction(method);
}

export function usePairFragment(method: string): FunctionFragment | null {
  return PAIR_INTERFACE.getFunction(method)
}
