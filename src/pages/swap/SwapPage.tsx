import styles from "./SwapPage.module.scss";
import TradingChart from "./components/TradingChart";
import TradeHistory from "./components/TradeHistory";
import Swap from "./components/Swap";
import SafeTrading from "./components/SafeTrading";
import GrowthPoll from "./components/GrowthPoll";
import clsx from "clsx";
import Layout from "../../shared/layouts/Layout";
import Head from "next/head";

export default function SwapPage() {
  return <>
    <Head>
      <title>Swap | Soy.Finance</title>
    </Head>
    <Layout>
      <main>
        <div className="container">
          <div className={clsx(styles.contentWrapper, "mb-20", "mt-20")}>
            <div className={styles.column}>
              <TradingChart />
              <TradeHistory />
            </div>
            <div className={styles.column}>
              <Swap />
              <SafeTrading />
              <GrowthPoll />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  </>
}
