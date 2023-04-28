import React from "react";
import styles from "./WalletDialog.module.scss";
import DialogHeader from "../../../../shared/components/DialogHeader";
import {useEvent, useStore} from "effector-react";
import Dialog from "../../../../shared/components/Dialog";
import Tabs from "../../../../shared/components/Tabs";
import Tab from "../../../../shared/components/Tab";
import {$isWalletDialogOpened} from "../../../../shared/models/stores";
import {setWalletDialogOpened} from "../../../../shared/models";
import CopyArea from "../../../../shared/components/CopyArea";
import Svg from "../../../../shared/components/Svg/Svg";
import {useWeb3} from "../../../../processes/web3/hooks/useWeb3";
import Button from "../../../../shared/components/Button";

export default function WalletDialog() {
  const isWalletDialogOpened = useStore($isWalletDialogOpened);
  const setWalletDialogOpenedFn = useEvent(setWalletDialogOpened);

  const {disconnect} = useWeb3();

  return <Dialog isOpen={isWalletDialogOpened} onClose={() => setWalletDialogOpenedFn(false)}>
    <div className={styles.dialogContainer}>
      <DialogHeader handleClose={() => setWalletDialogOpenedFn(false)} title="Your wallet"/>
      <div className={styles.dialogContent}>
        <Tabs view="separate">
          <Tab title="Wallet">
            <div className={styles.tabContent}>
                <h3 className="mt-20 font-500 font-primary font-16">Your address</h3>
                <div style={{marginTop: 8, marginBottom: 10}}>
                  <CopyArea text="0x60A4ecfc8132482D026854a984bc1f40d2" />
                </div>
                <div className={styles.balances}>
                  <div className={styles.balanceRow}>
                    <span>CLO balance</span>
                    <span>0.001</span>
                  </div>
                  <div className={styles.balanceRow}>
                    <span>SOY balance</span>
                    <span>0.002</span>
                  </div>
                </div>
              <div className={styles.explorerLinkContainer}>
                <a className={styles.explorerLink} href="#">
                  <span>View on CallistoScan</span>
                  <Svg iconName="arrow-right" />
                </a>
              </div>
              <Button onClick={disconnect} fullWidth variant="outlined" endIcon="logout">Disconnect</Button>
            </div>
          </Tab>
          <Tab title="Transactions">
            <div className={styles.tabContent}>
              <div className={styles.noSearch}>
                <div className={styles.bigIconWrapper}>
                  <Svg size={84} iconName="no-transactions" />
                </div>
                <h4>No transactions yet</h4>
                <p>Initiate a transaction using your wallet. All transaction will be displayed here</p>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  </Dialog>;
}
