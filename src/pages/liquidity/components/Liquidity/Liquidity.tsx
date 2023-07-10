import React, {useState} from "react";
import styles from "./Liquidity.module.scss";
import Tabs from "../../../../components/molecules/Tabs";
import Tab from "../../../../components/atoms/Tab";
import RemoveLiquidity from "../RemoveLiquidity";
import YourLiquidity from "../YourLiquidity";
import AddLiquidity from "../AddLiquidity";
import clsx from "clsx";

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState(0);

  return <div className={styles.liquidity}>
    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} view="default">
      <Tab title="Add">
        <div className={clsx(styles.tabContent, styles.addLiquidityTab)}>
          <AddLiquidity />
        </div>
      </Tab>
      <Tab title="Remove">
        <div className={styles.tabContent}>
          <RemoveLiquidity />
        </div>
      </Tab>
      <Tab title="Active">
        <div className={styles.tabContent}>
          <YourLiquidity setActiveTab={setActiveTab} />
        </div>
      </Tab>
    </Tabs>
  </div>
}
