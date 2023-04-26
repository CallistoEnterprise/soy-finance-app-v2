import {$isTradeInLoading, $isTradeOutLoading, $swapInputData, $swapRoute, $swapTokens, $trade} from "./stores";
import {
  changeOrder,
  setAmountIn,
  setAmountOut, setRoute,
  setTokenFrom,
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
