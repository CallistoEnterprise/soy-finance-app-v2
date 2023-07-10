import {
  $importTokenA, $importTokenB,
  $isImportPoolDialogOpened, $isLiquidityChartOpened, $isLiquidityHistoryOpened,
  $isRemoveLiquidityDialogOpened,
  $liquidityInputData,
  $pairsWithLiquidity
} from "./stores";
import {
  closeImportPoolDialog,
  closeRemoveLiquidityDialog, openImportPoolDialog,
  openRemoveLiquidityDialog, setImportTokenA, setImportTokenB,
  setLiquidityAmountIn,
  setLiquidityAmountOut, setLiquidityChartOpened,
  setLiquidityFirstToken, setLiquidityHistoryOpened,
  setLiquiditySecondToken, setPairsWithLiquidity, setPairsWithLiquidityLoading
} from "./index";

$liquidityInputData.on(setLiquidityFirstToken,
  (_, data) => ({ ..._, tokenFrom: data }));

$liquidityInputData.on(setLiquiditySecondToken,
  (_, data) => ({ ..._, tokenTo: data }));

$liquidityInputData.on(setLiquidityAmountIn,
  (_, data) => ({ ..._, amountIn: data }));

$liquidityInputData.on(setLiquidityAmountOut,
  (_, data) => ({ ..._, amountOut: data }));

$isRemoveLiquidityDialogOpened.on(openRemoveLiquidityDialog, () => true);
$isRemoveLiquidityDialogOpened.on(closeRemoveLiquidityDialog, () => false);

$isImportPoolDialogOpened.on(openImportPoolDialog, () => true);
$isImportPoolDialogOpened.on(closeImportPoolDialog, () => false);

$pairsWithLiquidity.on(setPairsWithLiquidityLoading,
  (_, data) => ({..._, loading: data}));
$pairsWithLiquidity.on(setPairsWithLiquidity,
  (_, data) => ({..._, pairs: data}));

$importTokenB.on(setImportTokenB, (_, data) => data);
$importTokenA.on(setImportTokenA, (_, data) => data);

$isLiquidityChartOpened.on(setLiquidityChartOpened, (_, data) => data);
$isLiquidityHistoryOpened.on(setLiquidityHistoryOpened, (_, data) => data);
