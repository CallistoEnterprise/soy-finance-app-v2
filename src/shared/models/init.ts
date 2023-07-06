import "../../processes/web3/models/init";
import "../../pages/swap/models/init";
import "../../pages/liquidity/models/init";
import "../../pages/farms/models/init";
import "../web3/models/init";

import {$balances, $favoriteTokens, $isWalletDialogOpened, $recentTransactions} from "./stores";
import {
  addFavoriteToken,
  addRecentTransaction, editTransactionStatus,
  pushBalance, removeFavoriteToken,
  resetBalance, resetTransactions, setFavoriteTokens,
  setRecentTransactions,
  setWalletDialogOpened,
  updateBalance
} from "./index";

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

$isWalletDialogOpened.on(
  setWalletDialogOpened,
  (_, data) => {
    return data;
  }
)

$recentTransactions.on(
  setRecentTransactions,
  (_, data) => {
    return data;
  }
)

$recentTransactions.on(
  addRecentTransaction,
  (state, data) => {
    const transactionsForChain = state[data.chainId];

    if(transactionsForChain) {
      const newState = {...state};

      newState[data.chainId] = [...newState[data.chainId], {hash: data.hash, summary: data.summary, ts: Date.now(), status: "pending"}]

      localStorage.setItem("recentTransactions", JSON.stringify(newState));
      return newState;
    } else {
      const newState = {...state};

      newState[data.chainId] = [{hash: data.hash, summary: data.summary, ts: Date.now(), status: "pending"}]

      localStorage.setItem("recentTransactions", JSON.stringify(newState));
      return newState;
    }
  }
);

$recentTransactions.on(
  editTransactionStatus,
  (state, data) => {
    const newState = {...state};
    const index = newState[data.chainId].findIndex(t => t.hash === data.hash);

    newState[data.chainId][index].status = data.status;

    localStorage.setItem("recentTransactions", JSON.stringify(newState));

    return newState;
  }
)

$favoriteTokens.on(
  setFavoriteTokens,
  (_, data) => {
    return data;
  }
);

$favoriteTokens.on(
  addFavoriteToken,
  (state, data) => {
    if(!state[data.chainId]) {
      return {...state, [data.chainId]: [data.tokenAddress]}
    }

    const result = {...state, [data.chainId]: [...state[data.chainId], data.tokenAddress]};

    localStorage.setItem("favoriteTokens", JSON.stringify(result));

    return result;
  }
)

$favoriteTokens.on(
  removeFavoriteToken,
  (state, data) => {
    if(!state[data.chainId]) {
      return state;
    }

    const result = {...state, [data.chainId]: state[data.chainId].filter((address) => address !== data.tokenAddress)};

    localStorage.setItem("favoriteTokens", JSON.stringify(result));

    return result;
  }
)

// $recentTransactions.reset(resetTransactions);
