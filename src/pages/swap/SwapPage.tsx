import styles from "./SwapPage.module.scss";
import TradingChart from "./components/TradingChart";
import TradeHistory from "./components/TradeHistory";
import Swap from "./components/Swap";
import SafeTrading from "./components/SafeTrading";
import clsx from "clsx";
import Layout from "../../components/layout/Layout";
import Head from "next/head";
import Drawer from "../../components/atoms/Drawer/Drawer";
import {useEvent, useStore} from "effector-react";
import {$isMobileChartOpened, $isSafeTradingOpened, $isSwapHistoryOpened} from "./models/stores";
import {setMobileChartOpened, setSafeTradingOpened, setSwapHistoryOpened} from "./models";

export default function SwapPage() {
  const isChartOpened = useStore($isMobileChartOpened);
  const isSafeTradingOpened = useStore($isSafeTradingOpened);
  const isSwapHistoryOpened = useStore($isSwapHistoryOpened);

  const setMobileChartOpenedFn = useEvent(setMobileChartOpened);
  const setSafeTradingOpenedFn = useEvent(setSafeTradingOpened);
  const setSwapHistoryOpenedFn = useEvent(setSwapHistoryOpened);

  return <>
    <Head>
      <title>Swap | Soy.Finance</title>
    </Head>
    <Layout>
      <main>
        <div className="container">
          <div className={clsx(styles.contentWrapper, "mb-20")}>
            <div className={styles.column}>
              <div className={styles.mobileNone}><TradingChart /></div>
              <div className={styles.mobileNone}><TradeHistory /></div>
              <div className="mobile">
                <Drawer isOpen={isChartOpened} onClose={() => {
                  setMobileChartOpenedFn(false);
                }} position="bottom">
                  <TradingChart />
                </Drawer>
              </div>
              <div className="mobile">
                <Drawer isOpen={isSwapHistoryOpened} onClose={() => {
                  setSwapHistoryOpenedFn(false);
                }} position="bottom">
                  <TradeHistory />
                </Drawer>
              </div>
            </div>
            <div className={clsx(styles.column, styles.swapColumn)}>
              <Swap />
              <div className={styles.mobileNone}><SafeTrading /></div>
              <div className="mobile">
                <Drawer isOpen={isSafeTradingOpened} onClose={() => {
                  setSafeTradingOpenedFn(false);
                }} position="bottom">
                  <SafeTrading />
                </Drawer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  </>
}
