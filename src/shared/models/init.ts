import "../../processes/web3/models/init";
import "../../pages/home/components/Swap/models/init";
import {$balances} from "./stores";
import {pushBalance, resetBalance, updateBalance} from "./index";

$balances.on(
  pushBalance,
  (state, data) => {
    let result;
    if (state[data.account]) {
      result = [...state[data.account], data.value];
    } else {
      result = [data.value];
    }

    return {
      ...state,
      [data.account]: result
    };
  }
);

$balances.on(
  updateBalance,
  (state, data) => {
    let result;
    if (state[data.account]) {
      if (typeof data.chainId === "number") {
        result = state[data.account].filter(balance => {
          return balance.network.chainId !== data.chainId;
        });
      } else {
        result = state[data.account].filter(balance => {
          return !data.chainId.includes(balance.network.chainId);
        });
      }

      return {
        ...state,
        [data.account]: result
      };
    }

    return state;
  }
).reset(resetBalance);
