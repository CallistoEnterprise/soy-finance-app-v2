import {
  $farmsUserData,
  $isStakeLPTokensDialogOpened,
  $isUnStakeLPTokensDialogOpened,
  $lpTokenToStake,
  $lpTokenToUnStake
} from "./stores";
import {
  closeStakeLPTokensDialog,
  closeUnStakeLPTokensDialog,
  openStakeLPTokensDialog,
  openUnStakeLPTokensDialog, setFarmsUserData, setLpTokenToStake, setLpTokenToUnStake
} from "./index";

$isStakeLPTokensDialogOpened.on(
  openStakeLPTokensDialog,
  () => {
    return true;
  }
)

$isStakeLPTokensDialogOpened.on(
  closeStakeLPTokensDialog,
  () => {
    return false;
  }
)

$isUnStakeLPTokensDialogOpened.on(
  openUnStakeLPTokensDialog,
  () => {
    return true;
  }
)

$isUnStakeLPTokensDialogOpened.on(
  closeUnStakeLPTokensDialog,
  () => {
    return false;
  }
)

$lpTokenToStake.on(
  setLpTokenToStake,
  (_, data) => {
    return data;
  }
)

$lpTokenToUnStake.on(
  setLpTokenToUnStake,
  (_, data) => {
    return data;
  }
)

$farmsUserData.on(setFarmsUserData, (_, data) => data);
