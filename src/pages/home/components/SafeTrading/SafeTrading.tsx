import React from "react";
import styles from "./SafeTrading.module.scss";
import clsx from "clsx";
import Button from "../../../../shared/components/Button";
import Divider from "../../../../shared/components/Divider";

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


  return <div className={styles.semiCircleProgressContainer}>
    <svg width="320" height="160" viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" stroke="#F1F1F1" strokeWidth="10" fill="transparent" d="M10,155 A 150 150 0 0 1 310 155" />
      <path strokeLinecap="round" stroke="#6DA316" strokeWidth="10" fill="transparent" d={`M10,155 A 150 150 0 0 1 ${XEnd} ${YEnd}`} />
    </svg>
    <div className={styles.progressText}>
      <span className={clsx("font-20", "bold", styles.pointsText)}>{percentage / 10} / 10</span>
      <span className="font-secondary font-16 ">Overall score</span>
    </div>
  </div>

}

export default function SafeTrading() {
  return <div className="paper">
    <h3 className="font-20 bold mb-20">Safe trading</h3>

    <SemiCircleProgress percentage={66} />
    <p className="font-16 mb-10 mt-20">Security audit score</p>
    <Progress percents={90} color="green" />
    <p className="font-16 mb-10 mt-20">Decentralized insurance fund</p>
    <Progress percents={70} color="purple" />
    <p className="font-16 mb-10 mt-20">Community trust</p>
    <Progress percents={60} color="pink" />
    <div className="center mt-20">
      <Button variant="outlined">Learn more</Button>
    </div>
  </div>;
}
