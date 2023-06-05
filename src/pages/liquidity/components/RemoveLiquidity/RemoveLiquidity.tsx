import React, {useCallback, useMemo, useState} from "react";
import styles from "./RemoveLiquidity.module.scss";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import PageCard from "../../../../components/atoms/PageCard";
import Button from "../../../../components/atoms/Button";
import {useRouterContract} from "../../../../shared/web3/hooks/useRouterContract";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import useTransactionDeadline from "../../../swap/hooks/useTransactionDeadline";
import {WrappedTokenInfo} from "../../../swap/hooks/useTrade";
import {ChainId} from "@callisto-enterprise/soy-sdk";
import TokenSelector from "../../../../components/organisms/TokenSelector";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import {useEvent, useStore} from "effector-react";
import {
  $liquidityAmountA,
  $liquidityAmountB,
  $liquidityInputTokens,
  $removeLiquidityAmountA,
  $removeLiquidityAmountB, $removeLiquidityAmountLP, $removeLiquidityInputTokens,
  setRemoveLiquidityAmountA,
  setRemoveLiquidityAmountB,
  setRemoveLiquidityTokenA,
  setRemoveLiquidityTokenB
} from "../../../../shared/web3/models/init";
import {useLiquidity} from "../../models/hooks/useLiquidity";
import Text from "../../../../components/atoms/Text";
import ButtonStepper from "../../../../components/molecules/ButtonStepper";
import {useRemoveLiquidity} from "../../models/hooks/useRemoveLiquidity";

const methods = ['removeLiquidityCLOWithPermit', 'removeLiquidityCLOWithPermitSupportingFeeOnTransferTokens', "removeLiquidityWithPermit", 'removeLiquidity', 'removeLiquidityCLO', 'removeLiquidityCLOSupportingFeeOnTransferTokens'];

const tA = {
  "decimals": 18,
    "symbol": "ccBTT",
    "name": "Wrapped BTT",
    "chainId": 820,
    "address": "0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3",
    "tokenInfo": {
    "name": "Wrapped BTT",
      "symbol": "ccBTT",
      "address": "0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3",
      "chainId": 820,
      "decimals": 18,
      "logoURI": "images/coins/0xCc99C6635Fae4DAcF967a3fc2913ab9fa2b349C3.png"
  },
  "tags": []
};

const tB = {
  "decimals": 18,
  "symbol": "ccSHIB",
  "name": "Wrapped SHIB",
  "chainId": 820,
  "address": "0xccA4F2ED7Fc093461c13f7F5d79870625329549A",
  "tokenInfo": {
  "name": "Wrapped SHIB",
    "symbol": "ccSHIB",
    "address": "0xccA4F2ED7Fc093461c13f7F5d79870625329549A",
    "chainId": 820,
    "decimals": 18,
    "logoURI": "images/coins/0xccA4F2ED7Fc093461c13f7F5d79870625329549A.png"
},
  "tags": []
};

export default function RemoveLiquidity() {
  const amountA = useStore($removeLiquidityAmountA);
  const amountB = useStore($removeLiquidityAmountB);
  const amountLP = useStore($removeLiquidityAmountLP);

  const {tokenA, tokenB, lpToken} = useStore($removeLiquidityInputTokens);

  const [removeLiquidityStep, setRemoveLiquidityStep] = useState(0);

  const {
    removeLiquidity,
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleLiquidityAmountLPChange
  } = useRemoveLiquidity();

  const [isFromTokenPickDialogOpened, setFromTokenPickDialogOpened] = useState(false);
  const [isToTokenPickDialogOpened, setToTokenPickDialogOpened] = useState(false);

  return <div>
    <PageCardHeading title="Remove liquidity" />
    <div style={{marginBottom: 20}} />
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
    />

    <div className={styles.changeOrder}>
      <IconButton variant="action" onClick={null}>
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
      inputValue={amountB}
      label="Output"
      handleInputChange={(amount) => {
        handleAmountBChange(amount);
      }}
      handleTokenChange={(token) => {
        handleTokenBChange(token);
      }}
    />

    <div className={styles.pricesBlock}>
      <div className={styles.greyHeader}>
        <Text>Prices</Text>
      </div>
      <div className={styles.blockRows}>
        <div className={styles.blockRow}>
          <Text color="secondary">1 USDT</Text>
          <Text color="secondary">131.2 ETH</Text>
        </div>
        <div className={styles.blockRow}>
          <Text color="secondary">1 ETH</Text>
          <Text color="secondary">1.92 USDT</Text>
        </div>
      </div>
    </div>

    <div style={{marginBottom: 40}} />
    <ButtonStepper buttons={[{
      label: "Approve",
      onClick: () => {
        setRemoveLiquidityStep(1);
      }
    },
      {
        label: "Remove",
        onClick: () => {
          removeLiquidity();
        }
      }
    ]} step={removeLiquidityStep} />
  </div>;
}
