import styles from "./SwapPage.module.scss";
import TradingChart from "./components/TradingChart";
import TradeHistory from "./components/TradeHistory";
import Swap from "./components/Swap";
import SafeTrading from "./components/SafeTrading";
import GrowthPoll from "./components/GrowthPoll";
import clsx from "clsx";
import Layout from "../../shared/layouts/Layout";
import Head from "next/head";
import Drawer from "../../components/atoms/Drawer/Drawer";
import {useEvent, useStore} from "effector-react";
import {$isMobileChartOpened} from "./models/stores";
import {setMobileChartOpened} from "./models";

export default function SwapPage() {
  const isChartOpened = useStore($isMobileChartOpened);
  const setMobileChartOpenedFn = useEvent(setMobileChartOpened);

  return <>
    <Head>
      <title>Swap | Soy.Finance</title>
    </Head>
    <Layout>
      <main>
        <div className="container">
          <div className={clsx(styles.contentWrapper, "mb-20")}>
            <div className={styles.column}>
              <div className="desktop"><TradingChart /></div>
              <div className="desktop"><TradeHistory /></div>
              <div className="mobile">
                <Drawer isOpen={isChartOpened} onClose={() => {
                  setMobileChartOpenedFn(false);
                }} position="bottom">
                  <TradingChart />
                </Drawer>
              </div>
            </div>
            <div className={styles.column}>
              {/*<Swap />*/}
              <div className="desktop"><SafeTrading /></div>
              <GrowthPoll />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  </>
}
