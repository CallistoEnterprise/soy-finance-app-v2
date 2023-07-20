import React, {useState} from "react";
import styles from "./LiquidityCard.module.scss";
import {Currency, ETHERS, JSBI, Percent, Token, WETH} from "@callisto-enterprise/soy-sdk";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import {useBalanceOf} from "../../../../shared/web3/hooks/useBalanceOf";
import {useTotalSupply} from "../../../../shared/web3/hooks/useTotalSupply";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import Collapse from "../../../../components/atoms/Collapse";
import Divider from "../../../../components/atoms/Divider";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import clsx from "clsx";
import {useEvent} from "effector-react";
import {openRemoveLiquidityDialog} from "../../models";
import RemoveLiquidityDialog from "../RemoveLiquidityDialog";
import {
  setLiquidityTokenA, setLiquidityTokenB, setRemoveLiquidityLPToken,
  setRemoveLiquidityTokenA,
  setRemoveLiquidityTokenB
} from "../../../../shared/web3/models/init";

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.chainId])) return ETHERS[token.chainId]
  return token
}

export default function LiquidityCard({pair, setActiveTab}) {
  const { account } = useWeb3();

  const setRemoveLiquidityTokenAFn = useEvent(setRemoveLiquidityTokenA);
  const setRemoveLiquidityTokenBFn = useEvent(setRemoveLiquidityTokenB);
  const setRemoveLiquidityLPTokenFn = useEvent(setRemoveLiquidityLPToken);

  const setLiquidityTokenAFn = useEvent(setLiquidityTokenA);
  const setLiquidityTokenBFn = useEvent(setLiquidityTokenB);

  const [expanded, setExpanded] = useState<boolean>(false);

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const userPoolBalance = useBalanceOf(pair.liquidityToken);

  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
        pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
        pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
      ]
      : [undefined, undefined]

  return <div className={styles.liquidityCard}>
    <div className={styles.cardHeader}>
      <div className={styles.pairImages}>
        <div className={styles.imgWrapper}>
          <img src={pair.tokenAmounts[0].token.logoURI} alt={pair.tokenAmounts[0].token.name} />
        </div>
        <div className={styles.imgWrapper}>
          <img src={pair.tokenAmounts[1].token.logoURI} alt={pair.tokenAmounts[1].token.name} />
        </div>

        <Text weight={700} variant={20}>{currency0.symbol}/{currency1.symbol}</Text>
      </div>

      <IconButton onClick={() => setExpanded(!expanded)} variant="default">
        <Svg className={clsx(styles.expandArrow, expanded && styles.expanded)} iconName="arrow-bottom" />
      </IconButton>
    </div>
    <Collapse open={expanded}>
      <Divider />
      <div className={styles.hiddenInfo}>
        <div className={styles.hiddenInfoRow}>
          <Text>Pooled {currency0.symbol}:</Text>
          <Text>{token0Deposited?.toSignificant(6)}</Text>
        </div>
        <div className={styles.hiddenInfoRow}>
          <Text>Pooled {currency1.symbol}:</Text>
          <Text>{token1Deposited?.toSignificant(6)}</Text>
        </div>
        <div className={styles.hiddenInfoRow}>
          <Text>Your pool tokens:</Text>
          <Text>{userPoolBalance?.toSignificant(4)}</Text>
        </div>
        <div className={styles.hiddenInfoRow}>
          <Text>Your pool share:</Text>
          <Text>{poolTokenPercentage?.toSignificant(2)}</Text>
        </div>

        <div className={styles.actionButtons}>
          <Button variant="outlined" fullWidth mode="error" endIcon="delete" onClick={() => {
            setRemoveLiquidityTokenAFn(pair.tokenAmounts[0].token);
            setRemoveLiquidityTokenBFn(pair.tokenAmounts[1].token);
            setRemoveLiquidityLPTokenFn(pair.liquidityToken);
            setActiveTab(1);
          }}>Remove</Button>
          <Button variant="outlined" fullWidth endIcon="add-token" onClick={() => {
            setLiquidityTokenAFn(pair.tokenAmounts[0].token);
            setLiquidityTokenBFn(pair.tokenAmounts[1].token);
            setActiveTab(0);
          }}>Add</Button>
        </div>
      </div>
    </Collapse>
  </div>;
}
