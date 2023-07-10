import React from "react";
import styles from "./LiquidityPage.module.scss";
import Layout from "../../components/layout/Layout";
import Liquidity from "./components/Liquidity";
import clsx from "clsx";
import LiquidityChart from "./components/LiquidityChart";
import LiquidityHistory from "./components/LiquidityHistory";
import Drawer from "../../components/atoms/Drawer/Drawer";
import {useEvent, useStore} from "effector-react";
import {$isLiquidityChartOpened, $isLiquidityHistoryOpened} from "./models/stores";
import {setLiquidityChartOpened, setLiquidityHistoryOpened} from "./models";

export default function LiquidityPage() {
  const isChartOpened = useStore($isLiquidityChartOpened);
  const setMobileChartOpenedFn = useEvent(setLiquidityChartOpened);

  const isSwapHistoryOpened = useStore($isLiquidityHistoryOpened);
  const setSwapHistoryOpenedFn = useEvent(setLiquidityHistoryOpened);

  return <Layout>
    <main className="container">
      <div className={clsx(styles.contentWrapper, "mb-20")}>
        <div className={styles.column}>
          <div className="desktop"><LiquidityChart /></div>
          <div className="desktop"><LiquidityHistory /></div>
          <div className="mobile">
            <Drawer isOpen={isChartOpened} onClose={() => {
              setMobileChartOpenedFn(false);
            }} position="bottom">
              <LiquidityChart />
            </Drawer>
          </div>
          <div className="mobile">
            <Drawer isOpen={isSwapHistoryOpened} onClose={() => {
              setSwapHistoryOpenedFn(false);
            }} position="bottom">
              <LiquidityHistory />
            </Drawer>
          </div>
        </div>
        <div className={clsx(styles.column, styles.liquidityColumn)}>
          <Liquidity />
        </div>
      </div>
    </main>
  </Layout>;
}
