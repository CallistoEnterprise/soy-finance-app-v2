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
import {$isMobileChartOpened, $isSafeTradingOpened, $isSwapHistoryOpened, $swapInputData} from "./models/stores";
import {setMobileChartOpened, setSafeTradingOpened, setSwapHistoryOpened} from "./models";
import {useMemo} from "react";

const safeTradingMap = {
  SOY: {
    score: 10,
    link: "https://callisto.network/soy-finance-soy-security-audit/"
  },
  BUSDT: {
    score: 9,
    link: "https://callisto.network/bulls-usd-busdt-security-audit/"
  },
  CLOE: {
    score: 9,
    link: "https://docs.soy.finance/soy-products/safelistings/projects-safelisted/callisto-enterprise-token-cloe"
  },
  DOGE: {
    score: 7,
    link: "https://callisto.network/dogecoin-token-doge-security-audit/"
  },
  FTM: {
    score: 9,
    link: "https://callisto.network/fantom-token-security-audit-report/"
  },
  TWT: {
    score: 9,
    link: "https://callisto.network/trust-wallet-token-security-audit-report/"
  },
  LINA: {
    score: 7,
    link: "https://callisto.network/linear-token-security-audit-report/"
  },
  SHIB: {
    score: 9,
    link: "https://callisto.network/shiba-inu-token-security-audit-report/"
  },
  VVT: {
    score: 9,
    link: "https://callisto.network/vipwarz-v2-security-audit-report/"
  },
  ETC: {
    score: 9,
    link: ""
  },
  ETH: {
    score: 9,
    link: ""
  },
  BNB: {
    score: 9,
    link: ""
  }
};

export default function SwapPage() {
  const isChartOpened = useStore($isMobileChartOpened);
  const isSafeTradingOpened = useStore($isSafeTradingOpened);
  const isSwapHistoryOpened = useStore($isSwapHistoryOpened);

  const setMobileChartOpenedFn = useEvent(setMobileChartOpened);
  const setSafeTradingOpenedFn = useEvent(setSafeTradingOpened);
  const setSwapHistoryOpenedFn = useEvent(setSwapHistoryOpened);

  const swapInputData = useStore($swapInputData);

  const safeTradingSymbol = useMemo(() => {
    if(!swapInputData.tokenTo || !swapInputData.tokenTo.symbol) {
      return null;
    }

    const symbol = swapInputData.tokenTo.symbol?.replace(/^cc/, "");

    if(safeTradingMap[symbol]) {
      return symbol;
    }

    return null;
  }, [swapInputData.tokenTo]);

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
              {safeTradingSymbol &&
                <>
                  <div className={styles.mobileNone}><SafeTrading meta={safeTradingMap[safeTradingSymbol]} token={swapInputData.tokenTo} /></div>
                  <div className="mobile">
                    <Drawer isOpen={isSafeTradingOpened} onClose={() => {
                      setSafeTradingOpenedFn(false);
                    }} position="bottom">
                      <SafeTrading meta={safeTradingMap[safeTradingSymbol]} token={swapInputData.tokenTo} />
                    </Drawer>
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </main>
    </Layout>
  </>
}
