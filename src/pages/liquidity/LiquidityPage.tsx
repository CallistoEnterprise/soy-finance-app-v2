import React from "react";
import styles from "./LiquidityPage.module.scss";
import Layout from "../../shared/layouts/Layout";
import Liquidity from "./components/Liquidity";
import TradingChart from "./components/TradingChart";
import Svg from "../../components/atoms/Svg/Svg";
import Button from "../../components/atoms/Button";

export default function LiquidityPage() {
  const liquidity = false;

  return <Layout>
    <main className="container">
      <div className={styles.liquidityPage}>
        <div>
          <TradingChart />
        </div>
        <div>
          <Liquidity />
        </div>
      </div>
      <div className="paper mb-20">
        {liquidity ? <div className={styles.userLiquidity}>

        </div> :
        <div className={styles.noLiquidity}>
          <div className={styles.svgWrapper}>
            <Svg iconName="no-transactions" size={84} />
          </div>

          <p className="font-24 font-700 mb-4 font-secondary">No liquidity yet</p>
          <p className="mb-16 font-16 font-400 font-secondary">Don't see a pool you joined?</p>
          <Button variant="outlined">Find other LP tokens</Button>
        </div>}
      </div>
    </main>
  </Layout>;
}
