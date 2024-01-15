import styles from "./MigratePage.module.scss";
import clsx from "clsx";
import Layout from "../../components/layout/Layout";
import Head from "next/head";
import InputWithUnits from "@/components/molecules/InputWithUnits";
import { useState } from "react";
import Button from "@/components/atoms/Button";

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

export default function MigratePage() {
  const [value, setValue] = useState("");
  const [valueCLOE, setValueCLOE] = useState("");

  return <>
    <Head>
      <title>Swap | Soy.Finance</title>
    </Head>
    <Layout>
      <main>
        <div className="container">
          <div className={clsx(styles.contentWrapper, "mb-20")}>
            <div className={styles.blocks}>
              <div className={styles.block}>
                <h2>Migrate SOY to SLOTH</h2>
                <InputWithUnits units="SOY" value={value} setValue={setValue} />
                <Button>Migrate SOY</Button>
              </div>
              <div className={styles.block}>
                <h2>Migrate CLOE to SLOTH</h2>
                <InputWithUnits units="CLOE" value={valueCLOE} setValue={setValueCLOE} />
                <Button>Migrate CLOE</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  </>
}
