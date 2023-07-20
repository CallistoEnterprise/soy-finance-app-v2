import React, {useEffect, useMemo} from "react";
import styles from "./WalletDialog.module.scss";
import DialogHeader from "../DialogHeader";
import {useEvent, useStore} from "effector-react";
import Tabs from "../Tabs";
import Tab from "../../atoms/Tab";
import {$isWalletDialogOpened, $recentTransactions} from "../../../shared/models/stores";
import {editTransactionStatus, setRecentTransactions, setWalletDialogOpened} from "../../../shared/models";
import CopyArea from "../CopyArea";
import Svg from "../../atoms/Svg/Svg";
import {useWeb3} from "../../../processes/web3/hooks/useWeb3";
import Button from "../../atoms/Button";
import Preloader from "../../atoms/Preloader";
import InfoRow from "../../atoms/InfoRow";
import DrawerDialog from "../../atoms/DrawerDialog";
import {useBalanceOf} from "../../../shared/web3/hooks/useBalanceOf";
import {formatBalance} from "../../../shared/utils";
import ExternalLink from "../../atoms/ExternalLink";
import {useTokenBalance} from "../../../stores/balance/useTokenBalance";
import {nativeTokens} from "../../../shared/hooks/useAllTokens";
import {WrappedTokenInfo} from "../../../pages/swap/functions";
import {getExpLink} from "../AwaitingApproveDialog/AwaitingApproveDialog";

function Transaction({transaction}) {
  const {web3Provider, chainId} = useWeb3();
  const editTransactionStatusFn = useEvent(editTransactionStatus);

  useEffect(() => {
    if (!web3Provider || !chainId) {
      return;
    }

    (async () => {
      if (transaction.status === "pending") {
        const receipt = await web3Provider?.getTransactionReceipt(transaction.hash);

        if (!receipt) {
          const transa = await web3Provider?.getTransaction(transaction.hash);

          const newReceipt = await transa.wait();

          if (newReceipt) {
            const status = newReceipt.status === 1 || typeof newReceipt.status === 'undefined' ? "succeed" : "error";

            editTransactionStatusFn({chainId, status, hash: transaction.hash});
          }
        } else {
          const status = receipt.status === 1 || typeof receipt.status === 'undefined' ? "succeed" : "error";

          editTransactionStatusFn({chainId, status, hash: transaction.hash});
        }

      }
    })();
  }, [web3Provider, chainId, transaction, editTransactionStatusFn]);

  return <div className={styles.transaction}>
    <ExternalLink href={getExpLink(transaction.hash, "transaction", chainId || 820)} text={transaction.summary} />
    <div className={styles.status}>
      {transaction.status === "pending"
      ? <Preloader withLogo={false} size={20} />
      : transaction.status === "error"
          ? <Svg style={{color: "#CD1515"}} iconName="error" />
          : <Svg style={{color: "#6DA316"}} iconName="done" />}
    </div>
  </div>
}

const soy = new WrappedTokenInfo({
  chainId: 820,
  address: '0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65',
  symbol: "SOY",
  name: "Soy-ERC223",
  decimals: 18,
  logoURI: "https://app.soy.finance/images/coins/0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65.png"
}, [])

const walletBalanceAddresses = {
  820: {
    soy: "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
    clo: "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a"
  },
  199: {
    soy: "0xcC00860947035a26Ffe24EcB1301ffAd3a89f910",
    clo: "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53"
  },
  61: {
    soy: "0xcC67D978Ddf07971D9050d2b424f36f6C1a15893",
    clo: "0xCcbf1C9E8b4f2cDF3Bfba1098b8f56f97d219D53"
  }
}

export default function WalletDialog({defaultTab}) {
  const isWalletDialogOpened = useStore($isWalletDialogOpened);
  const setWalletDialogOpenedFn = useEvent(setWalletDialogOpened);

  const {chainId, disconnect, account, web3Provider} = useWeb3();

  const recentTransactions = useStore($recentTransactions);
  const setRecentTransactionsFn = useEvent(setRecentTransactions);

  const {tokenBalance} = useTokenBalance({address: walletBalanceAddresses?.[chainId]?.clo, chainId})
  const {tokenBalance: soyBalance} = useTokenBalance({address: walletBalanceAddresses?.[chainId]?.soy, chainId})

  useEffect(() => {
    const recentT = localStorage.getItem("recentTransactions");
    if (chainId && recentT) {
      setRecentTransactionsFn(JSON.parse(recentT));
    }
  }, [chainId, setRecentTransactionsFn]);

  return <DrawerDialog isOpen={isWalletDialogOpened} onClose={() => setWalletDialogOpenedFn(false)}>
    <div className={styles.dialogContainer}>
      <DialogHeader handleClose={() => setWalletDialogOpenedFn(false)} title="Your wallet"/>
      <div className={styles.dialogContent}>
        <Tabs defaultTab={defaultTab} view="separate">
          <Tab title="Wallet">
            <div className={styles.tabContent}>
              <h3 className="mt-20 font-500 font-primary font-16">Your address</h3>
              <div style={{marginTop: 8, marginBottom: 10}}>
                <CopyArea text={account} />
              </div>
              <div className={styles.balances}>
                <InfoRow label="CLO balance" value={formatBalance(tokenBalance)} />
                <InfoRow label="SOY balance" value={formatBalance(soyBalance)} />
              </div>
              <div className={styles.explorerLinkContainer}>
                <ExternalLink href={`https://explorer.callisto.network/address/${account}/transactions`} text="View on CallistoScan" />
              </div>
              <Button onClick={() => {
                disconnect();
                setWalletDialogOpenedFn(false);
              }} fullWidth variant="outlined" endIcon="logout">Disconnect</Button>
            </div>
          </Tab>
          <Tab title="Transactions">
            <div className={styles.tabContent}>
              {chainId && recentTransactions[chainId]?.length ?
                <div className={styles.transactionsContainer}>{recentTransactions[chainId].slice(0).reverse().map(t => {
                  return <Transaction key={t.hash} transaction={t}/>
                })}</div>
                :
                <div className={styles.noSearch}>
                  <div className={styles.bigIconWrapper}>
                    <Svg size={84} iconName="no-transactions"/>
                  </div>
                  <h4>No transactions yet</h4>
                  <p>Initiate a transaction using your wallet. All transaction will be displayed here</p>
                </div>}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  </DrawerDialog>;
}
