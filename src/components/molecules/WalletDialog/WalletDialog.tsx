import React, {useEffect} from "react";
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
  }, [web3Provider, chainId, transaction]);

  return <div className={styles.transaction}>
    <span>{transaction.summary}</span>
    <div className={styles.status}>
      <Svg iconName="arrow-popup" />
      {transaction.status === "pending"
      ? <Preloader withLogo={false} size={20} />
      : transaction.status === "error"
          ? <Svg style={{color: "#CD1515"}} iconName="error" />
          : <Svg iconName="done" />}
    </div>
  </div>
}

export default function WalletDialog({defaultTab}) {
  const isWalletDialogOpened = useStore($isWalletDialogOpened);
  const setWalletDialogOpenedFn = useEvent(setWalletDialogOpened);

  const {chainId, disconnect} = useWeb3();

  const recentTransactions = useStore($recentTransactions);
  const setRecentTransactionsFn = useEvent(setRecentTransactions);

  useEffect(() => {
    const recentT = localStorage.getItem("recentTransactions");
    if (chainId && recentT) {
      setRecentTransactionsFn(JSON.parse(recentT));
    }
  }, [chainId]);

  return <DrawerDialog isOpen={isWalletDialogOpened} onClose={() => setWalletDialogOpenedFn(false)}>
    <div className={styles.dialogContainer}>
      <DialogHeader handleClose={() => setWalletDialogOpenedFn(false)} title="Your wallet"/>
      <div className={styles.dialogContent}>
        <Tabs defaultTab={defaultTab} view="separate">
          <Tab title="Wallet">
            <div className={styles.tabContent}>
              <h3 className="mt-20 font-500 font-primary font-16">Your address</h3>
              <div style={{marginTop: 8, marginBottom: 10}}>
                <CopyArea text="0x60A4ecfc8132482D026854a984bc1f40d2"/>
              </div>
              <div className={styles.balances}>
                <InfoRow label="CLO balance" value="0.001" />
                <InfoRow label="SOY balance" value="0.001" />
              </div>
              <div className={styles.explorerLinkContainer}>
                <a className={styles.explorerLink} href="#">
                  <span>View on CallistoScan</span>
                  <Svg iconName="arrow-right"/>
                </a>
              </div>
              <Button onClick={disconnect} fullWidth variant="outlined" endIcon="logout">Disconnect</Button>
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
