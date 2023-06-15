import {
  ERC_20_INTERFACE,
  ERC_223_INTERFACE, LOCAL_FARM_INTERFACE,
  MASTER_CHEF_INTERFACE,
  PAIR_INTERFACE,
  ROUTER_INTERFACE
} from "./interfaces";
import {FunctionFragment} from "ethers";

export function useErc20Fragment(method: string): FunctionFragment | null {
  return ERC_20_INTERFACE.getFunction(method);
}

export function usePairFragment(method: string): FunctionFragment | null {
  return PAIR_INTERFACE.getFunction(method)
}

export function useRouterFragment(method: string): FunctionFragment | null {
  return ROUTER_INTERFACE.getFunction(method)
}

export function useErc223Fragment(method: string): FunctionFragment | null {
  return ERC_223_INTERFACE.getFunction(method)
}

export function useMasterChefFragment(method: string): FunctionFragment | null {
  return MASTER_CHEF_INTERFACE.getFunction(method)
}

export function useLocalFarmFragment(method: string): FunctionFragment | null {
  return LOCAL_FARM_INTERFACE.getFunction(method);
}
