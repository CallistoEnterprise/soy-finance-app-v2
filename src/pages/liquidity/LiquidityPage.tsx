import React from "react";
import styles from "./LiquidityPage.module.scss";
import Layout from "../../shared/layouts/Layout";
import Liquidity from "./components/Liquidity";
import clsx from "clsx";
import TradeHistory from "../swap/components/TradeHistory";
import LiquidityChart from "./components/LiquidityChart";
import LiquidityHistory from "./components/LiquidityHistory";

export default function LiquidityPage() {
  return <Layout>
    <main className="container">
      <div className={clsx(styles.contentWrapper, "mb-20")}>
        <div className={styles.column}>
          <div className="desktop"><LiquidityChart /></div>
          <div className="desktop"><LiquidityHistory /></div>
        </div>
        <div className={styles.column}>
          <Liquidity />
        </div>
      </div>
    </main>
  </Layout>;
}
