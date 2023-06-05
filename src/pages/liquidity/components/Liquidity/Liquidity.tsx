import React, {useMemo, useState} from "react";
import styles from "./Liquidity.module.scss";
import {
  ChainId,
  WETH
} from "@callisto-enterprise/soy-sdk";
import {
  BUSDT,
  SOY,
  WCLO,
} from "../../../swap/hooks/useTrade";
import Tabs from "../../../../components/molecules/Tabs";
import Tab from "../../../../components/atoms/Tab";
import RemoveLiquidity from "../RemoveLiquidity";
import YourLiquidity from "../YourLiquidity";
import AddLiquidity from "../AddLiquidity";
import clsx from "clsx";

export const BASES_TO_TRACK_LIQUIDITY_FOR: any = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET], SOY[ChainId.MAINNET], BUSDT[ChainId.MAINNET]],
  [ChainId.CLOTESTNET]: [WETH[ChainId.CLOTESTNET], SOY[ChainId.CLOTESTNET], BUSDT[ChainId.CLOTESTNET]],
  [ChainId.ETCCLASSICMAINNET]: [WETH[ChainId.ETCCLASSICMAINNET], SOY[ChainId.ETCCLASSICMAINNET], BUSDT[ChainId.ETCCLASSICMAINNET]],
  [ChainId.BTTMAINNET]: [WETH[ChainId.BTTMAINNET], SOY[ChainId.BTTMAINNET], BUSDT[ChainId.BTTMAINNET], WCLO[ChainId.BTTMAINNET]],
  [ChainId.ETHEREUM]: [],
  [ChainId.BSC]: []
}

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
