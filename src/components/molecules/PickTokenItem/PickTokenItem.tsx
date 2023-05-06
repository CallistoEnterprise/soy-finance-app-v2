import React from "react";
import styles from "./PickTokenItem.module.scss";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import {useEvent} from "effector-react";
import {addFavoriteToken, removeFavoriteToken, setFavoriteTokens} from "../../../shared/models";
import useNetworkSectionBalance from "../../../shared/hooks/useNetworkSectionBalance";
import clsx from "clsx";
import Svg from "../../atoms/Svg/Svg";
import {formatBalance, isNativeToken} from "../../../shared/utils";

export default function PickTokenItem({token, isFavorite, handlePick}) {
  const {chainId} = useWeb3();
  const addFavoriteTokenFn = useEvent(addFavoriteToken);
  const removeFavoriteTokenFn = useEvent(removeFavoriteToken);
  const setFavoriteTokenFn = useEvent(setFavoriteTokens);
  const {isLoading, contracts, network} = useNetworkSectionBalance({chainId});

  return <li className={styles.pickTokenListItem} key={token.token_address}>
    <button
      className={clsx(styles.favButton, isFavorite && styles.active)}
      onClick={() => {
        if (!token?.token_address || !chainId) {
          return;
        }

        if (isFavorite) {
          removeFavoriteTokenFn({chainId, tokenAddress: token.token_address});
        } else {
          console.log("TRIYON TO ADD");
          addFavoriteTokenFn({chainId, tokenAddress: token.token_address});
        }
      }}>
      <Svg iconName="star"/>
    </button>
    <button className={styles.pickTokenButton} onClick={handlePick}>
      <div className={styles.tokenButtonInfo}>
        <img height={40} width={40} src={token.imgUri} alt={token.original_name}/>
        {token.original_name}
      </div>

      <span className={styles.tokenBalance}>
                      {isNativeToken(token.token_address) ?
                        formatBalance(network?.balance) :
                        formatBalance(contracts?.find(c => c.symbol === token.original_name)?.balance) || "0.0"
                      }
                    </span>
    </button>
  </li>

}
