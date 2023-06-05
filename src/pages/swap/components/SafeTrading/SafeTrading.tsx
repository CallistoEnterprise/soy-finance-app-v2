import React from "react";
import styles from "./SafeTrading.module.scss";
import clsx from "clsx";
import Button from "../../../../components/atoms/Button";
import PageCard from "../../../../components/atoms/PageCard";
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import Text from "../../../../components/atoms/Text";
import {useColorMode} from "../../../../shared/providers/ThemeProvider";

function Progress({percents, color}: {percents: number, color: "green" | "purple" | "pink"}) {
  return <>
    <div className={styles.progressContainer}>
      <div className={clsx(styles.progressBar, styles[color])} style={{width: `${percents}%`}} />
    </div>
    <div className={styles.progressNumbers}>
      {[...Array(10)].map((item, index) =>{
        return <React.Fragment key={index}>
          <span className="font-secondary font-14">
            {index  + 1}
          </span>
        </React.Fragment>
      })}
    </div>
  </>
}

function SemiCircleProgress({percentage}: {percentage: number}) {
  const angle = (percentage / 100) * 180 * Math.PI / 180;
  const XEnd = 160 + Math.abs(150 * Math.cos(angle));
  const YEnd = 160 - Math.abs(150 * Math.sin(angle)) - 5;

  const {mode} = useColorMode();

  return <div className={styles.semiCircleProgressContainer}>
    <svg width="320" height="160" viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" stroke={mode === "light" ? "#F1F1F1" : "#353535"} strokeWidth="10" fill="transparent" d="M10,155 A 150 150 0 0 1 310 155" />
      <path strokeLinecap="round" stroke={mode === "light" ? "#6DA316" : "#7CB819"} strokeWidth="10" fill="transparent" d={`M10,155 A 150 150 0 0 1 ${XEnd} ${YEnd}`} />
    </svg>
    <div className={styles.progressText}>
      <div className={styles.dashArc}>
        <svg width="263" height="132" viewBox="0 0 263 132" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M261.5 131C261.5 96.5219 247.804 63.4559 223.424 39.0761C199.044 14.6964 165.978 1 131.5 1C97.0219 0.999997 63.9559 14.6964 39.5761 39.0761C15.1964 63.4558 1.50001 96.5218 1.5 131" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeDasharray="2 20"/>
        </svg>
      </div>
      <span className={clsx("font-20", "bold", styles.pointsText)}>{percentage / 10} / 10</span>
      <span className="font-secondary font-16 ">Overall score</span>
    </div>
  </div>

}

export default function SafeTrading() {
  return <PageCard>
    <PageCardHeading title="Safe trading" />
    <div className="mb-20" />
    <SemiCircleProgress percentage={66} />
    <div className="mb-20" />
    <Text tag="p">Security audit score</Text>
    <div className="mb-10" />
    <Progress percents={90} color="green" />
    <div className="mb-10" />
    <Text tag="p">Decentralized insurance fund</Text>
    <div className="mb-10" />
    <Progress percents={70} color="purple" />
    <div className="mb-10" />
    <Text tag="p">Community trust</Text>
    <div className="mb-10" />
    <Progress percents={60} color="pink" />
    <div className="center mt-20">
      <Button variant="outlined">Learn more</Button>
    </div>
  </PageCard>;
}
