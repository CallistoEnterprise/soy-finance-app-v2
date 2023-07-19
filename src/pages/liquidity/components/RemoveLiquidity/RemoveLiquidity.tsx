import React, {useCallback, useState} from "react";
import styles from "./RemoveLiquidity.module.scss";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import Button from "../../../../components/atoms/Button";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import {useEvent, useStore} from "effector-react";
import {
  $removeLiquidityAmountA,
  $removeLiquidityAmountB, $removeLiquidityAmountLP, $removeLiquidityInputTokens,
} from "../../../../shared/web3/models/init";
import Text from "../../../../components/atoms/Text";
import {useRemoveLiquidity} from "../../models/hooks/useRemoveLiquidity";
import {useSnackbar} from "../../../../shared/providers/SnackbarProvider";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";
import clsx from "clsx";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import {setConfirmAddLiquidityDialogOpened, setConfirmRemoveLiquidityDialogOpened} from "../../models";

function ActionButtons({isEnough}) {
  const {isActive} = useWeb3();

  const {tokenA, tokenB, lpToken} = useStore($removeLiquidityInputTokens);

  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);

  const {
    onAttemptToApprove,
    readyToRemove,
    approving,
    removing,
  } = useRemoveLiquidity();

  const {showMessage} = useSnackbar();

  const setConfirmRemoveLiquidityDialogOpenedFn = useEvent(setConfirmRemoveLiquidityDialogOpened);

  const setConfirmDialogOpened = useCallback(() => {
    setConfirmRemoveLiquidityDialogOpenedFn(true);
  }, [setConfirmRemoveLiquidityDialogOpenedFn]);

  if(!isActive) {
    return <ConnectWalletButton fullWidth/>;
  }

  if(!tokenA || !tokenB) {
    return <Button fullWidth disabled>Select tokens to proceed</Button>
  }

  if(!amountA || !amountB) {
    return <Button fullWidth disabled>Enter an amount to proceed</Button>
  }

  if(!isEnough) {
    return <Button fullWidth disabled>Insufficient amount</Button>
  }

  return <div className={styles.actionButtons}>
      <div className={styles.buttonRow}>
        <div className={clsx(styles.step, readyToRemove && styles.passed)}>{readyToRemove ?
          <Svg iconName="check"/> : 1}</div>
        <Button loading={approving} fullWidth passed={readyToRemove} onClick={async () => {
          try {
            await onAttemptToApprove();
          } catch (e) {
            showMessage(e.message, "error");
          } finally {
          }
        }}>
          Approve
        </Button>
      </div>

      <div className={styles.buttonRow}>
        <div className={clsx(styles.step, !readyToRemove && styles.disabled)}>{2}</div>
        <Button loading={removing} fullWidth disabled={!readyToRemove} onClick={setConfirmDialogOpened}>Remove liquidity</Button>
      </div>
    </div>
}

export default function RemoveLiquidity() {

  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);
  const amountLP = useStore($removeLiquidityAmountLP);

  const {tokenA, tokenB, lpToken} = useStore($removeLiquidityInputTokens);

  console.log("Error here!x2");
  const balance = useBalanceOf(lpToken);

  const {
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange,
    pair,
    token1Deposited,
    token0Deposited
  } = useRemoveLiquidity();

  const [isFromTokenPickDialogOpened, setFromTokenPickDialogOpened] = useState(false);
  const [isToTokenPickDialogOpened, setToTokenPickDialogOpened] = useState(false);

  return <div>
    <PageCardHeading title="Remove liquidity"/>
    <div style={{marginBottom: 20}}/>
    <TokenSelector
      setDialogOpened={setFromTokenPickDialogOpened}
      isDialogOpened={isFromTokenPickDialogOpened}
      pickedToken={lpToken}
      pair={[tokenA, tokenB]}
      inputValue={amountLP}
      label="Input"
      handleInputChange={(amount) => {
        handleLiquidityAmountLPChange(amount);
      }}
      handleTokenChange={(token) => {
        // handleTokenAChange(token);
      }}
      balance={balance?.toSignificant(6)}
    />

    <div className={styles.changeOrder}>
      <IconButton readonly variant="action" onClick={null}>
        <Svg iconName="arrow-right"/>
      </IconButton>
    </div>

    <TokenSelector
      setDialogOpened={setFromTokenPickDialogOpened}
      isDialogOpened={isFromTokenPickDialogOpened}
      pickedToken={tokenA}
      inputValue={amountA}
      label="Output"
      handleInputChange={(amount) => {
        handleAmountAChange(amount);
      }}
      handleTokenChange={(token) => {
        handleTokenAChange(token);
      }}
      balance={token0Deposited?.toSignificant(6)}
    />

    <div className={styles.changeOrder}>
      <IconButton readonly variant="action" onClick={null}>
        <Svg iconName="add-token"/>
      </IconButton>
    </div>

    <TokenSelector
      setDialogOpened={setToTokenPickDialogOpened}
      isDialogOpened={isToTokenPickDialogOpened}
      pickedToken={tokenB}
      inputValue={amountB}
      label="Output"
      handleInputChange={(amount) => {
        handleAmountBChange(amount);
      }}
      handleTokenChange={(token) => {
        handleTokenBChange(token);
      }}
      balance={token1Deposited?.toSignificant(6)}
    />

    <div className={styles.pricesBlock}>
      <div className={styles.greyHeader}>
        <Text>Prices</Text>
      </div>
      <div className={styles.blockRows}>
        {tokenA && tokenB && pair ? <>
          <div className={styles.blockRow}>
            <Text color="secondary">1 {tokenA.symbol}</Text>
            <Text color="secondary">{pair.priceOf(tokenA).toSignificant(6)} {tokenB.symbol}</Text>
          </div>
          <div className={styles.blockRow}>
            <Text color="secondary">1 {tokenB.symbol}</Text>
            <Text color="secondary">{pair.priceOf(tokenB).toSignificant(6)} {tokenA.symbol}</Text>
          </div>
        </> : <>
          <div className={styles.blockRow}>
            <Text color="secondary">—</Text>
            <Text color="secondary">—</Text>
          </div>
          <div className={styles.blockRow}>
            <Text color="secondary">—</Text>
            <Text color="secondary">—</Text>
          </div>
        </>}
      </div>
    </div>
    <div className={styles.actionButtonsWrapper}>
      <ActionButtons isEnough={+balance?.toSignificant(6) >= +amountLP} />
    </div>
  </div>;
}
