import {
  $isTradeInLoading,
  $isTradeOutLoading,
  $swapInputData,
  $swapRoute,
  $swapTokens,
  $tokenSpendApproved, $tokenSpendEnabling, $tokenSpendRequesting,
  $trade
} from "./stores";
import {
  changeOrder, resetInputData,
  setAmountIn,
  setAmountOut, setRoute,
  setTokenFrom, setTokenSpendApproved, setTokenSpendEnabling, setTokenSpendRequesting,
  setTokenTo, setTrade,
  setTradeInLoading,
  setTradeOutLoading
} from "./index";
import {SwapVariant} from "./types";


$swapTokens.on(
  setTokenFrom,
  (_, data) => {
    return {
      ..._, tokenFrom: data
    }
  }
)

$swapTokens.on(
  setTokenTo,
  (_, data) => {
    return {
      ..._, tokenTo: data
    }
  }
)

$isTradeInLoading.on(
  setTradeInLoading,
  (_, data) => {
    return data;
  }
);

$isTradeOutLoading.on(
  setTradeOutLoading,
  (_, data) => {
    return data;
  }
);

$swapInputData.reset(resetInputData);

$swapInputData.on(
  setTokenFrom,
  (_, data) => {
    return {
      ..._, tokenFrom: data
    }
  }
)

$swapInputData.on(
  setTokenTo,
  (_, data) => {
    return {
      ..._, tokenTo: data
    }
  }
)


$swapInputData.on(
  setAmountIn,
  (_, data) => {
    return {
      ..._,
      amountIn: data,
      swapType: SwapVariant.exactIn
    }
  }
);

$swapInputData.on(
  setAmountOut,
  (_, data) => {
    return {
      ..._,
      amountOut: data,
      swapType: SwapVariant.exactOut
    }
  }
);

$swapInputData.on(
  changeOrder,
  (_, data) => {
    return {
      ..._,
      tokenFrom: _.tokenTo,
      tokenTo: _.tokenFrom,
      amountIn: _.amountOut,
      swapType: SwapVariant.exactIn
    }
  }
)

$trade.on(
  setTrade,
  (_, data) => {
    return data;
  }
)

$swapRoute.on(
  setRoute,
  (_, data) => {
    return data;
  }
)

$tokenSpendApproved.on(
  setTokenSpendApproved,
  (_, data) => {
    return data;
  }
);

$tokenSpendEnabling.on(
  setTokenSpendEnabling,
  (_, data) => {
    return data;
  }
);

$tokenSpendRequesting.on(
  setTokenSpendRequesting,
  (_, data) => {
    return data;
  }
);
