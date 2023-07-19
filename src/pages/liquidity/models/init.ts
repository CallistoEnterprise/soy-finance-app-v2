import {
  $importTokenA, $importTokenB, $isConfirmAddLiquidityDialogOpened, $isConfirmRemoveLiquidityDialogOpened,
  $isImportPoolDialogOpened, $isLiquidityChartOpened, $isLiquidityHistoryOpened,
  $isRemoveLiquidityDialogOpened,
  $liquidityInputData,
  $pairsWithLiquidity, $signatureData
} from "./stores";
import {
  closeImportPoolDialog,
  closeRemoveLiquidityDialog,
  openImportPoolDialog,
  openRemoveLiquidityDialog, resetSignatureData,
  setConfirmAddLiquidityDialogOpened,
  setConfirmRemoveLiquidityDialogOpened,
  setImportTokenA,
  setImportTokenB,
  setLiquidityAmountIn,
  setLiquidityAmountOut,
  setLiquidityChartOpened,
  setLiquidityFirstToken,
  setLiquidityHistoryOpened,
  setLiquiditySecondToken,
  setPairsWithLiquidity,
  setPairsWithLiquidityLoading, setSignatureData
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

$isConfirmAddLiquidityDialogOpened.on(setConfirmAddLiquidityDialogOpened, (_, data) => data);
$isConfirmRemoveLiquidityDialogOpened.on(setConfirmRemoveLiquidityDialogOpened, (_, data) => data);

$signatureData.on(setSignatureData, (_, data) => data);
$signatureData.reset(resetSignatureData);
