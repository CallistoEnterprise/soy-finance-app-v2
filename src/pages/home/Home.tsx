import Header from "./components/Header";
import styles from "./Home.module.scss";
import TradingChart from "./components/TradingChart";
import TradeHistory from "./components/TradeHistory";
import Swap from "./components/Swap";
import SafeTrading from "./components/SafeTrading";
import GrowthPoll from "./components/GrowthPoll";
import clsx from "clsx";
import Footer from "./components/Footer";

export default function Home() {
  return <>
    <Header />
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
    <div className="container">
      <Footer />
    </div>

  </>
}
