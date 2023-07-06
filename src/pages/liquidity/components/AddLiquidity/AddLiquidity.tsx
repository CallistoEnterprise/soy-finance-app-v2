import React, {useEffect, useState} from "react";
import styles from "./AddLiquidity.module.scss";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import SwapSettingsDialog from "../../../swap/components/SwapSettingsDialog";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import Button from "../../../../components/atoms/Button";
import {useStore} from "effector-react";
import {$liquidityAmountA, $liquidityAmountB, $liquidityInputTokens} from "../../../../shared/web3/models/init";
import {useLiquidity} from "../../models/hooks/useLiquidity";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import {ApprovalState, useApproveCallback} from "../../models/hooks/useApprove";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import {useEnoughBalance} from "../../models/hooks/useEnoughBalance";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import ConnectWalletButton from "../../../../processes/web3/ui/ConnectWalletButton";

export default function AddLiquidity() {
  const {tokenA, tokenB} = useStore($liquidityInputTokens);
  const amountA = useStore($liquidityAmountA);
  const amountB = useStore($liquidityAmountB);

  const {
    addLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange
  } = useLiquidity();

  const [isFromTokenPickDialogOpened, setFromTokenPickDialogOpened] = useState(false);
  const [isToTokenPickDialogOpened, setToTokenPickDialogOpened] = useState(false);

  const approveStatusA = useApproveCallback(tokenA, amountA);
  const approveStatusB = useApproveCallback(tokenB, amountB);

  const balanceA = useBalanceOf(tokenA);
  const balanceB = useBalanceOf(tokenB);

  const isEnoughBalanceA = useEnoughBalance({token: tokenA, amount: amountA, balance: balanceA});
  const isEnoughBalanceB = useEnoughBalance({token: tokenB, amount: amountB, balance: balanceB});



  // console.log(balanceA?.toSignificant());
  // console.log(balanceB?.toSignificant());

  return <div>
      <div className={styles.settings}>
        <PageCardHeading title="Add liquidity" />
        <IconButton onClick={null}>
          <Svg iconName="filter"/>
        </IconButton>
      </div>
      <SwapSettingsDialog />

    <TokenSelector
      setDialogOpened={setFromTokenPickDialogOpened}
      isDialogOpened={isFromTokenPickDialogOpened}
      pickedToken={tokenA}
      inputValue={amountA || ""}
      label="From"
      balance={balanceA || null}
      handleInputChange={(amount) => {
        handleAmountAChange(amount);
      }}
      handleTokenChange={(token) => {
        handleTokenAChange(token);
      }}
    />

    <div className={styles.changeOrder}>
      <IconButton variant="action" onClick={null}>
        <Svg iconName="add-token"/>
      </IconButton>
    </div>

    <TokenSelector
      setDialogOpened={setToTokenPickDialogOpened}
      isDialogOpened={isToTokenPickDialogOpened}
      pickedToken={tokenB}
      inputValue={amountB || ""}
      label="To"
      balance={balanceB || null}
      handleInputChange={(amount) => {
        handleAmountBChange(amount);
      }}
      handleTokenChange={(token) => {
        handleTokenBChange(token);
      }}
    />

    <div className={styles.summary}>
      <div className={styles.infoRow}>
        <span>Current rate</span>
        <span className={styles.priceContent}>
            1 ETH = 1913.05 USDT
            <button className={styles.showInvertedButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.3498 10.8742C7.4998 11.0242 7.5748 11.1992 7.5748 11.3992C7.5748 11.5992 7.4998 11.7742 7.3498 11.9242L4.8498 14.4242L11.9998 14.4242C12.2165 14.4242 12.3956 14.4951 12.5373 14.6367C12.679 14.7784 12.7498 14.9576 12.7498 15.1742C12.7498 15.3909 12.679 15.5701 12.5373 15.7117C12.3956 15.8534 12.2165 15.9242 11.9998 15.9242L4.8498 15.9242L7.3748 18.4492C7.5248 18.5992 7.59563 18.7701 7.5873 18.9617C7.57897 19.1534 7.4998 19.3242 7.3498 19.4742C7.1998 19.6242 7.0248 19.6992 6.8248 19.6992C6.6248 19.6992 6.4498 19.6242 6.2998 19.4742L2.5248 15.6992C2.44146 15.6159 2.38313 15.5326 2.3498 15.4492C2.31647 15.3659 2.2998 15.2742 2.2998 15.1742C2.2998 15.0742 2.31647 14.9826 2.3498 14.8992C2.38313 14.8159 2.44146 14.7326 2.5248 14.6492L6.3248 10.8492C6.4748 10.6992 6.64563 10.6284 6.8373 10.6367C7.02897 10.6451 7.1998 10.7242 7.3498 10.8742ZM17.6998 4.52422L21.4748 8.29922C21.5581 8.38255 21.6165 8.46589 21.6498 8.54922C21.6831 8.63255 21.6998 8.72422 21.6998 8.82422C21.6998 8.92422 21.6831 9.01589 21.6498 9.09922C21.6165 9.18255 21.5581 9.26589 21.4748 9.34922L17.6748 13.1492C17.5248 13.2992 17.354 13.3701 17.1623 13.3617C16.9706 13.3534 16.7998 13.2742 16.6498 13.1242C16.4998 12.9742 16.4248 12.7992 16.4248 12.5992C16.4248 12.3992 16.4998 12.2242 16.6498 12.0742L19.1498 9.57422L11.9998 9.57422C11.7831 9.57422 11.604 9.50339 11.4623 9.36172C11.3206 9.22005 11.2498 9.04088 11.2498 8.82422C11.2498 8.60755 11.3206 8.42839 11.4623 8.28672C11.604 8.14505 11.7831 8.07422 11.9998 8.07422L19.1498 8.07422L16.6248 5.54922C16.4748 5.39922 16.404 5.22839 16.4123 5.03672C16.4206 4.84505 16.4998 4.67422 16.6498 4.52422C16.7998 4.37422 16.9748 4.29922 17.1748 4.29922C17.3748 4.29922 17.5498 4.37422 17.6998 4.52422Z"
                  fill="currentColor"/>
              </svg>
            </button>
        </span>
      </div>
      <div className={styles.infoRow}>
        <span>Share of pool</span>
        <span>{51}%</span>
      </div>
    </div>
    <Action />
  </div>;
}

function Action() {
  const {isActive} = useWeb3();
  const {tokenA, tokenB} = useStore($liquidityInputTokens);
  const amountA = useStore($liquidityAmountA);
  const amountB = useStore($liquidityAmountB);

  const approveStatusA = useApproveCallback(tokenA, amountA);
  const approveStatusB = useApproveCallback(tokenB, amountB);

  const balanceA = useBalanceOf(tokenA);
  const balanceB = useBalanceOf(tokenB);
  //
  // console.log(balanceA);

  const isEnoughBalanceA = useEnoughBalance({token: tokenA, amount: amountA, balance: balanceA});
  const isEnoughBalanceB = useEnoughBalance({token: tokenB, amount: amountB, balance: balanceB});

  const { addLiquidity } = useLiquidity();

  const [wasApprovingTokenA, setWasApprovingTokenA] = useState(false);
  const [wasApprovingTokenB, setWasApprovingTokenB] = useState(false);

  useEffect(() => {
    if(approveStatusA[0] === ApprovalState.PENDING) {
      setWasApprovingTokenA(true);
    }
  }, [approveStatusA]);

  useEffect(() => {
    if(approveStatusB[0] === ApprovalState.PENDING) {
      setWasApprovingTokenA(true);
    }
  }, [approveStatusB]);

  // console.log(approveStatusA);

  if(!isActive) {
    return <ConnectWalletButton fullWidth />
  }

  if(!tokenA || !tokenB) {
    return <Button disabled fullWidth>Choose tokens to proceed</Button>;
  }

  if(!amountA || !amountB) {
    return <Button disabled fullWidth>Enter an amount to proceed</Button>;
  }

  if(!isEnoughBalanceA && !isEnoughBalanceB) {
    return <Button disabled fullWidth>Insufficient tokens balance</Button>;
  } else {
    if(!isEnoughBalanceA) {
      return <Button disabled fullWidth>Insufficient {tokenA.symbol} balance</Button>;
    }

    if(!isEnoughBalanceB) {
      return <Button disabled fullWidth>Insufficient {tokenB.symbol} balance</Button>;
    }
  }

  if(approveStatusA[0] === ApprovalState.NOT_APPROVED &&
    approveStatusB[0] === ApprovalState.NOT_APPROVED
  ) {
    return <div>
      <div className={styles.buttonsRow}>
        <Button fullWidth onClick={approveStatusA[1]}>Approve {tokenA.symbol}</Button>
        <Button fullWidth onClick={approveStatusB[1]}>Approve {tokenB.symbol}</Button>
      </div>
      <Button fullWidth onClick={addLiquidity}>Supply liquidity</Button>
    </div>
  }

  if(approveStatusA[0] !== ApprovalState.APPROVED || wasApprovingTokenA &&
    approveStatusB[0] === ApprovalState.APPROVED
  ) {
    return <div className={styles.stepRows}>
      <div className={styles.stepRow}>
        <div className={styles.stepWrapper}>1</div>
        <div>
          {approveStatusA[0] === ApprovalState.NOT_APPROVED && <Button fullWidth onClick={approveStatusA[1]}>Approve {tokenA.symbol}</Button>}
          {approveStatusA[0] === ApprovalState.PENDING && <Button fullWidth disabled>Approving {tokenA.symbol}...</Button>}
          {approveStatusA[0] === ApprovalState.APPROVED && wasApprovingTokenA && <Button fullWidth disabled>Approve {tokenA.symbol}</Button>}
        </div>
      </div>

      <div className={styles.stepRow}>
        <div className={styles.stepWrapper}>2</div>

        <Button disabled={approveStatusA[0] === ApprovalState.PENDING || approveStatusA[0] === ApprovalState.NOT_APPROVED} fullWidth onClick={addLiquidity}>Supply liquidity</Button>
      </div>
    </div>
  }

  if(approveStatusA[0] === ApprovalState.APPROVED &&
    approveStatusB[0] === ApprovalState.NOT_APPROVED
  ) {
    return <div>
      <Button fullWidth onClick={() => approveStatusA[1]}>Approve {tokenB.symbol}</Button>
      <Button fullWidth onClick={addLiquidity}>Supply liquidity</Button>
    </div>
  }

  return <Button fullWidth onClick={addLiquidity}>Supply liquidity</Button>
}
