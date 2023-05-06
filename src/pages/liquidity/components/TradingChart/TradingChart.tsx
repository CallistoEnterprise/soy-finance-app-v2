import React, {useRef, useState} from "react";
import styles from "./TradingChart.module.scss";
import Image from "next/image";
import IconButton from "../../../../components/atoms/IconButton";
import Svg from "../../../../components/atoms/Svg/Svg";
import TabTitle from "../../../../components/atoms/TabTitle";
import clsx from "clsx";
import {Chart, Line} from "react-chartjs-2";
import {Filler, Legend, LinearScale, LineElement, PointElement, ScriptableContext, Title, Tooltip} from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale
} from "chart.js";

const tooltipLine = {
  id: 'tooltipLine',
  afterDraw(chart: Chart) {
    if (chart.tooltip?.getActiveElements().length) {
      let x = chart.tooltip?.getActiveElements()[0].element.x;
      let yAxis = chart.scales.y;

      let y = chart.tooltip?.getActiveElements()[0].element.y;
      let xAxis = chart.scales.x;

      let ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.moveTo(xAxis.left, y);
      ctx.lineTo(xAxis.right, y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#4B564B';
      ctx.stroke();
      ctx.restore();
    }
  }
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  tooltipLine
)


const plugins = {
  tooltipLine: {}
}

export const options = {
  responsive: true,

  hover: {
    mode: "point",
    intersect: false
  },

  plugins: {
    tooltipLine: {},
    legend: {
      display: false
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        maxTicksLimit: 7
      }
    },
    y: {
      min: 0,
      grid: {
        display: false,
        color: (context) => {
          if(context.index === 0) {
            return ""
          }
        }
      }
    }
  }
};

const color = "#6DA316";


const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [320, 212, 150, 380, 202, 341, 422, 320, 212, 150, 380, 202, 341, 422, 320, 212, 150, 380, 202, 341, 422, 320, 212, 150, 380, 202, 341, 422, 320, 212, 150, 380, 202, 341, 422, 320, 212, 150, 380, 202, 341, 422],
      fill: "start",
      tension: 0.2,
      borderColor: color,
      backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          400
        );
        gradient.addColorStop(
          0,
          `#EDF5E7`
        );
        gradient.addColorStop(
          1,
          `rgba(237, 245, 231, 0.3)`
        );
        return gradient;
      },
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: "#fff",
      pointRadius: 4,
      pointHitRadius: 20,
      pointHoverRadius: 8
    }
  ],
};

export default function TradingChart() {
  const [selectedTab, setSelectedTab] = useState(1);

  const [firstToken, setFirstToken] = useState({
    img: "/images/tokens/eth.png",
    code: "ETH"
  })

  const [secondToken, setSecondToken] = useState({
    img: "/images/tokens/tether.png",
    code: "USDT"
  })

  return <div className={clsx(styles.tradingChart, "paper")}>
    <div className={styles.blockHeader}>
      <div className={styles.tokensInfo}>
        <div className={styles.pairLogos}>
          <div>
            <Image width={24} height={24} src={firstToken.img} alt={firstToken.code}/>
          </div>
          <div className={styles.secondToken}>
            <Image width={24} height={24} src={secondToken.img} alt={secondToken.code}/>
          </div>
        </div>
        <span className="font-20 bold">{firstToken.code} / {secondToken.code}</span>
        <IconButton onClick={() => {
          setFirstToken(secondToken);
          setSecondToken(firstToken);
        }}>
          <Svg iconName="swap"/>
        </IconButton>
      </div>
      <div className={styles.tabs}>
        <TabTitle title="1D" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={0}/>
        <TabTitle title="1W" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={1}/>
        <TabTitle title="1M" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={2}/>
        <TabTitle title="1Y" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={3}/>
      </div>
    </div>
    <p className="font-24 font-secondary font-300">1 {firstToken.code} = 1,655.2385 {secondToken.code} ($1,664.11)</p>
    <div>
      {selectedTab === 0 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 1 hour</div>}
      {selectedTab === 1 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 7 days</div>}
      {selectedTab === 2 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 30 days</div>}
      {selectedTab === 3 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 365 days</div>}
    </div>
    <Line options={options} data={data} type="line"/>
  </div>;
}
