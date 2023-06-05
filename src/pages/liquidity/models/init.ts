import {
  $importTokenA, $importTokenB,
  $isImportPoolDialogOpened,
  $isRemoveLiquidityDialogOpened,
  $liquidityInputData,
  $pairsWithLiquidity
} from "./stores";
import {
  closeImportPoolDialog,
  closeRemoveLiquidityDialog, openImportPoolDialog,
  openRemoveLiquidityDialog, setImportTokenA, setImportTokenB,
  setLiquidityAmountIn,
  setLiquidityAmountOut,
  setLiquidityFirstToken,
  setLiquiditySecondToken, setPairsWithLiquidity, setPairsWithLiquidityLoading
} from "./index";

$liquidityInputData.on(
  setLiquidityFirstToken,
  (_, data) => {
    return {
      ..._, tokenFrom: data
    }
  }
)

$liquidityInputData.on(
  setLiquiditySecondToken,
  (_, data) => {
    return {
      ..._, tokenTo: data
    }
  }
)


$liquidityInputData.on(
  setLiquidityAmountIn,
  (_, data) => {
    return {
      ..._,
      amountIn: data
    }
  }
);

$liquidityInputData.on(
  setLiquidityAmountOut,
  (_, data) => {
    return {
      ..._,
      amountOut: data
    }
  }
);

$isRemoveLiquidityDialogOpened.on(
  openRemoveLiquidityDialog,
  () => {
    return true;
  }
)

$isRemoveLiquidityDialogOpened.on(
  closeRemoveLiquidityDialog,
  () => {
    return false;
  }
)

$isImportPoolDialogOpened.on(
  openImportPoolDialog,
  () => {
    return true;
  }
)

$isImportPoolDialogOpened.on(
  closeImportPoolDialog,
  () => {
    return false;
  }
)

$pairsWithLiquidity.on(
  setPairsWithLiquidityLoading,
  (_, data) => {
    return {..._, loading: data}
  }
)

$pairsWithLiquidity.on(
  setPairsWithLiquidity,
  (_, data) => {
    return {..._, pairs: data}
  }
)

$importTokenA.on(
  setImportTokenA,
  (_, data) => {
    return data;
  }
);

$importTokenB.on(
  setImportTokenB,
  (_, data) => {
    return data;
  }
)
