import React from "react";
import styles from "./PickTokenItem.module.scss";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEvent} from "effector-react";
import {addFavoriteToken, removeFavoriteToken, setFavoriteTokens} from "../../../shared/models";
import clsx from "clsx";
import Svg from "../../atoms/Svg/Svg";
import {formatBalance, isNativeToken} from "../../../shared/utils";
import {WrappedTokenInfo} from "../../../pages/swap/hooks/useTrade";
import {useTokenBalance} from "../../../stores/balance/useTokenBalance";
import Preloader from "../../atoms/Preloader";

export default function PickTokenItem({token, isFavorite, handlePick}: {token: WrappedTokenInfo, isFavorite: boolean, handlePick: any}) {
  const {chainId} = useWeb3();
  const addFavoriteTokenFn = useEvent(addFavoriteToken);
  const removeFavoriteTokenFn = useEvent(removeFavoriteToken);
  const setFavoriteTokenFn = useEvent(setFavoriteTokens);
  const {tokenBalance, loading} = useTokenBalance({address: token.address, chainId});

  return <li className={styles.pickTokenListItem} key={token.address}>
    <button
      className={clsx(styles.favButton, isFavorite && styles.active)}
      onClick={() => {
        if (!token?.address || !chainId) {
          return;
        }

        if (isFavorite) {
          removeFavoriteTokenFn({chainId, tokenAddress: token.address});
        } else {
          addFavoriteTokenFn({chainId, tokenAddress: token.address});
        }
      }}>
      <Svg iconName="star"/>
    </button>
    <button className={styles.pickTokenButton} onClick={handlePick}>
      <div className={styles.tokenButtonInfo}>
        <img height={40} width={40} src={token.logoURI} alt={token.name}/>
        {token.symbol}
      </div>

      <span className={styles.tokenBalance}>
        {loading ? <Preloader size={20} withLogo={false} /> : formatBalance(tokenBalance)}
      </span>
    </button>
  </li>

}
