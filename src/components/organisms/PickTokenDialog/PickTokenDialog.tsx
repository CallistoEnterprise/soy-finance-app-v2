import React, {ChangeEvent, useEffect, useMemo, useState} from "react";
import styles from "./PickTokenDialog.module.scss";
import Tabs from "../../molecules/Tabs";
import Tab from "../../atoms/Tab";
import {baseTokens, swapTokensList} from "../../../pages/swap/constants/constants";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import Svg from "../../atoms/Svg/Svg";
import {useEvent, useStore} from "effector-react";
import {$favoriteTokens} from "../../../shared/models/stores";
import { setFavoriteTokens } from "../../../shared/models";
import PickTokenItem from "../../molecules/PickTokenItem";
import DrawerDialog from "../../atoms/DrawerDialog";
import DialogHeader from "../../molecules/DialogHeader";
import {useAllTokens} from "../../../shared/hooks/useAllTokens";

interface Props {
  isOpened: boolean,
  handleClose: any,
  pickToken: any
}


export default function PickTokenDialog({isOpened, handleClose, pickToken}: Props) {
  const {chainId} = useWeb3();

  const [searchRequest, setSearchRequest] = useState("");

  const favoriteTokens = useStore($favoriteTokens);

  const favoriteTokensForChain = useMemo(() => {
    return favoriteTokens[chainId] || [];
  }, [chainId, favoriteTokens]);

  const setFavoriteTokenFn = useEvent(setFavoriteTokens);

  // const tokensForChain = useMemo(() => {
  //   return swapTokensList.flatMap((item) => {
  //     return item[chainId] || [];
  //   });
  // }, [chainId]);

  const tokensList = useAllTokens();
  // console.log(tokensList);

  const filteredList = useMemo(() => {
    return tokensList.filter((token) => {
      if (!searchRequest) {
        return true;
      }

      return token.address.toLowerCase() === searchRequest.toLowerCase()
        || token.symbol?.toLowerCase().startsWith(searchRequest.toLowerCase());

    })
  }, [searchRequest, tokensList]);

  const favoriteList = useMemo(() => {
    return filteredList.filter((token) => {
      return favoriteTokensForChain.includes(token.address);
    })
  }, [favoriteTokensForChain, filteredList]);

  useEffect(() => {
    const recentT = localStorage.getItem("favoriteTokens");
    if (chainId && recentT) {
      setFavoriteTokenFn(JSON.parse(recentT));
    }
  }, [chainId, setFavoriteTokenFn]);

  if (!chainId) {
    return;
  }
//TODO: Handle empty search fro favorites
  return <DrawerDialog isOpen={isOpened} onClose={handleClose}>
    <DialogHeader title="Select a token" handleClose={handleClose} />
    <div className={styles.pickTokenDialog}>
      <div className={styles.searchTokenWrapper}>
        <input onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchRequest(e.target.value)}
               className={styles.searchToken} placeholder="Name or address"/>
      </div>
      {Boolean(baseTokens[chainId]) && <div className={styles.baseTokens}>
        {baseTokens[chainId].map((token) => {
          return <button key={token.original_name} onClick={() => {
            pickToken(token);
            handleClose();
          }} className={styles.baseTokenButton}>
            <img src={token.imgUri} alt={token.original_name}/>
            {token.original_name}
          </button>
        })}
      </div>
      }
      <Tabs view="merged">
        <Tab title="All">
          <div className={styles.tokensList}>
            {!!searchRequest && !filteredList.length ? <div className={styles.noSearch}>
                <div className={styles.bigIconWrapper}>
                  <Svg size={84} iconName="search"/>
                </div>
                <h4>No tokens found</h4>
                <p>We did not find tokens with such a name</p>
              </div> :
              <ul>
                {filteredList.map(token => {
                  return <PickTokenItem
                    key={token.address}
                    token={token}
                    handlePick={() => {
                      pickToken(token);
                      handleClose();
                    }}
                    isFavorite={favoriteTokensForChain.includes(token.address)}
                  />
                })}
              </ul>}
          </div>
        </Tab>
        <Tab title="My list">
          <div className={styles.tokensList}>
            {favoriteList.length ? <ul>
              {favoriteList.map(token => {
                return <PickTokenItem
                  key={token.address}
                  token={token}
                  handlePick={() => {
                    pickToken(token);
                    handleClose();
                  }}
                  isFavorite={favoriteTokensForChain.includes(token.address)}
                />
              })}
            </ul> :<div className={styles.noSearch}>
              <div className={styles.bigIconWrapper}>
                <Svg size={84} iconName="search" />
              </div>
              <h4>No favorite tokens yet</h4>
              <p>We did not find tokens with such a name</p>
            </div>
            }
          </div>
        </Tab>
      </Tabs>


    </div>
  </DrawerDialog>;
}
