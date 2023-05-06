import React, {useEffect, useRef, useState} from "react";
import styles from "./TradingChart.module.scss";
import TabTitle from "../../../../components/atoms/TabTitle";
import clsx from "clsx";
import {Bar, Chart, Line} from "react-chartjs-2";
import {
  BarElement,
  ChartData, ChartMeta,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScriptableContext, TimeSeriesScale,
  Title,
  Tooltip
} from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale
} from "chart.js";
import {useColorMode} from "../../../../shared/providers/ThemeProvider";
import {useStore} from "effector-react";
import {$swapInputData} from "../../models/stores";
import {SwapToken} from "../../models/types";
import {fetchTokenPriceData, inter, startTimestamp} from "../../../../shared/fetcher";
import 'chartjs-adapter-date-fns';
import {data} from "../../../liquidity/components/TradingChart/TradingChart";

const tooltipLine = {
  id: 'tooltipLine',
  afterDraw(chart: Chart) {
    if (!chart.config.options.candlestick) {
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
        ctx.moveTo(x, y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#4B564B';
        ctx.stroke();
        ctx.restore();
      }
    }
  }
};

// const movingAverage = {
//   id: "movingAverage",
//   afterDatasetDraw(chart: Chart, args: { index: number; meta: ChartMeta }, options) {
//     if (chart.config.options.candlestick) {
//       const {ctx, data, scales: {x, y}} = chart;
//
//       ctx.save();
//
//       ctx.beginPath();
//       ctx.strokeStyle = "rgba(102, 102, 102, 1)";
//
//
//
//       ctx.moveTo(chart.getDatasetMeta(0).data[0].x, y.getPixelForValue(data.datasets[0].data[0].c));
//       for(let i = 1; i < data.datasets[0].data.length; i++) {
//         ctx.lineTo(chart.getDatasetMeta(0).data[i].x, y.getPixelForValue(data.datasets[0].data[i].c));
//       }
//
//       ctx.stroke();
//     }
//   }
// }

const candlestick = {
  id: "candlestick",
  beforeDatasetDraw(chart: Chart, args: { index: number; meta: ChartMeta }, options): boolean | void {
    if (chart.config.options.candlestick) {
      const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;

      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,1)";

      data.datasets[0].data.forEach((datapoint, index) => {
        ctx.beginPath();
        ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
        ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].h));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
        ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].l));
        ctx.stroke();
      });
    }
  }
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
  Tooltip,
  Legend,
  tooltipLine,
  candlestick,
  // movingAverage,
  TimeSeriesScale
);


const getCandleData = (data) => ({
  // labels: [1, 2, 3, 4, 5],
  datasets: [
    {
      backgroundColor: (ctx => {
        const {raw: {o, c}} = ctx;
        let color;
        if (c >= o) {
          color = 'rgba(75, 192, 192, 1)'
        } else {
          color = 'rgba(255, 26, 104, 1)'
        }

        return color;
      }),
      borderColor: "rgba(0,0,0,1)",
      label: 'Financial Chart',
      data
    },
  ],
});

const financialOptions = {
  candlestick: true,
  parsing: {
    xAxisKey: "x",
    yAxisKey: "s"
  },
  scales: {
    x: {
      type: "timeseries"
    },
    y: {
      beginAtZero: false,
      // grace: 1
    }
  },
  plugins: {
    candlestick: {},
    // movingAverage: {}
  }
}

export const options: ChartOptions = {
  responsive: true,

  interaction: {
    mode: "nearest",
    intersect: false,
    axis: "x"
  },
  hover: {
    mode: "nearest",
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
      grid: {
        display: false,
        color: (context) => {
          if (context.index === 0) {
            return ""
          }
        }
      }
    }
  }
};

const color = "#6DA316";


export const getData = (mode, data, labels) => ({
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data,
      fill: "start",
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
          mode === "dark" ? "#395805" : `#EDF5E7`
        );
        gradient.addColorStop(
          1,
          mode === "dark" ? "rgba(57, 88, 5, 0.05)" : `rgba(237, 245, 231, 0.3)`
        );
        return gradient;
      },
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: "#fff",
      pointRadius: 4,
      // cubicInterpolationMode: 'monotone'
      tension: 0.2
    }
  ],
});

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const options = {day: '2-digit', month: 'short', year: 'numeric'};
  return date.toLocaleDateString().toLowerCase();
}


export default function TradingChart() {
  const [selectedTab, setSelectedTab] = useState(1);
  const {mode} = useColorMode();

  const swapInputData = useStore($swapInputData);

  const [currentGraph, setCurrentGraph] = useState<"first" | "second">("first");

  const [firstToken, setFirstToken] = useState<SwapToken>({
    "token_address": "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
    "original_name": "SOY",
    "decimal_token": 18,
    "imgUri": "https://app.soy.finance/images/coins/0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65.png"
  });

  const [data, setData] = useState([]);
  const [candleData, setCandleData] = useState([]);
  const [labels, setLabels] = useState([]);

  console.log(firstToken);

  const [secondToken, setSecondToken] = useState<SwapToken>(null);

  useEffect(() => {
    if (swapInputData.tokenFrom) {
      setFirstToken(swapInputData.tokenFrom);
    }
  }, [swapInputData.tokenFrom]);

  useEffect(() => {
    setSecondToken(swapInputData.tokenTo);
  }, [swapInputData.tokenTo]);

  useEffect(() => {
    (async () => {
      const price = await fetchTokenPriceData(currentGraph === "first" ? firstToken.token_address.toLowerCase() : secondToken.token_address.toLowerCase(), inter, startTimestamp);

      const candlePrice = await fetchTokenPriceData(currentGraph === "first" ? firstToken.token_address.toLowerCase() : secondToken.token_address.toLowerCase(), inter * 4, startTimestamp);

      const dataResult = [];
      const labelsResult = [];
      const candleDataResult = [];

      if (price.data) {
        for (const priceObj of price.data) {
          dataResult.push(priceObj.close);
          labelsResult.push(formatTimestamp(priceObj.time));
        }
      }

      if (candlePrice.data) {
        for (const priceObj of candlePrice.data) {
          candleDataResult.push({
            x: new Date(priceObj.time),
            o: priceObj.open,
            h: priceObj.high,
            l: priceObj.low,
            c: priceObj.close,
            s: [priceObj.open, priceObj.close]
          });
        }
      }

      console.log(candleDataResult);
      setCandleData(candleDataResult);
      setLabels(labelsResult);
      setData(dataResult);
      console.log(price);
    })();

  }, [firstToken, currentGraph, secondToken]);


  return <div className="paper">

    <>
      <div className={styles.blockHeader}>
        <div className={styles.tokensInfo}>
          <div className={styles.pairLogos}>
            <button onClick={() => {
              setCurrentGraph("first");
            }} className={clsx(styles.firstImageToken, currentGraph === "first" && styles.active)}>
              <img width={34} height={34} src={firstToken.imgUri}/>
            </button>
            <button disabled={!secondToken}
                    onClick={() => {
                      setCurrentGraph("second");
                    }} className={clsx(styles.secondImageToken, currentGraph === "second" && styles.active)}>

              {secondToken ? <img width={34} height={34} src={secondToken.imgUri}/>
                :
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M39.3971 24.8381C36.726 35.5525 25.874 42.0731 15.1584 39.4012C4.44722 36.7301 -2.07335 25.8775 0.59897 15.1639C3.26894 4.44838 14.1209 -2.07268 24.8332 0.598468C35.5481 3.26961 42.0683 14.1234 39.3968 24.8383L39.397 24.8381H39.3971Z"
                    fill="#F1F1F1"/>
                  <path
                    d="M20 18.7044C23.4784 18.7044 26.2925 18.175 28.4422 17.1164C30.5919 16.0577 31.6667 14.8587 31.6667 13.5192C31.6667 12.1581 30.5919 10.9536 28.4422 9.90574C26.2925 8.8579 23.4784 8.33398 20 8.33398C16.5216 8.33398 13.7076 8.8579 11.5579 9.90574C9.40822 10.9536 8.33337 12.1581 8.33337 13.5192C8.33337 14.8587 9.40822 16.0577 11.5579 17.1164C13.7076 18.175 16.5216 18.7044 20 18.7044ZM20 21.9451C21.0803 21.9451 22.2902 21.8533 23.6297 21.6696C24.9692 21.486 26.2385 21.1997 27.4375 20.8108C28.6366 20.4219 29.6412 19.9196 30.4514 19.3039C31.2616 18.6882 31.6667 17.9482 31.6667 17.084V20.3247C31.6667 21.1889 31.2616 21.9289 30.4514 22.5446C29.6412 23.1604 28.6366 23.6627 27.4375 24.0516C26.2385 24.4405 24.9692 24.7267 23.6297 24.9104C22.2902 25.094 21.0803 25.1858 20 25.1858C18.9414 25.1858 17.7369 25.094 16.3866 24.9104C15.0363 24.7267 13.7616 24.4351 12.5625 24.0354C11.3635 23.6357 10.3588 23.128 9.54865 22.5122C8.73847 21.8965 8.33337 21.1673 8.33337 20.3247V17.084C8.33337 17.9266 8.73847 18.6557 9.54865 19.2715C10.3588 19.8872 11.3635 20.3949 12.5625 20.7946C13.7616 21.1943 15.0363 21.486 16.3866 21.6696C17.7369 21.8533 18.9414 21.9451 20 21.9451ZM20 28.4266C21.0803 28.4266 22.2902 28.3348 23.6297 28.1511C24.9692 27.9675 26.2385 27.6812 27.4375 27.2923C28.6366 26.9034 29.6412 26.4011 30.4514 25.7854C31.2616 25.1696 31.6667 24.4297 31.6667 23.5655V26.8062C31.6667 27.6704 31.2616 28.4104 30.4514 29.0261C29.6412 29.6419 28.6366 30.1442 27.4375 30.5331C26.2385 30.9219 24.9692 31.2082 23.6297 31.3919C22.2902 31.5755 21.0803 31.6673 20 31.6673C18.9414 31.6673 17.7369 31.5755 16.3866 31.3919C15.0363 31.2082 13.7616 30.9165 12.5625 30.5169C11.3635 30.1172 10.3588 29.6094 9.54865 28.9937C8.73847 28.378 8.33337 27.6488 8.33337 26.8062V23.5655C8.33337 24.4081 8.73847 25.1372 9.54865 25.753C10.3588 26.3687 11.3635 26.8764 12.5625 27.2761C13.7616 27.6758 15.0363 27.9675 16.3866 28.1511C17.7369 28.3348 18.9414 28.4266 20 28.4266Z"
                    fill="#AEAEAE"/>
                </svg>}

            </button>
          </div>
          {/*<Text variant={24} weight={700} color="primary">{firstToken.original_name}</Text>*/}
          {/*<IconButton onClick={() => {*/}
          {/*  setFirstToken(secondToken);*/}
          {/*  setSecondToken(firstToken);*/}
          {/*}}>*/}
          {/*  <Svg iconName="swap"/>*/}
          {/*</IconButton>*/}
        </div>
        <div className={styles.tabs}>
          <TabTitle title="1D" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={0}/>
          <TabTitle title="1W" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={1}/>
          <TabTitle title="1M" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={2}/>
          <TabTitle title="1Y" selectedTab={selectedTab} setSelectedTab={setSelectedTab} view="separate" index={3}/>
        </div>
      </div>
      <p className="font-24 font-secondary font-300">1 {firstToken.original_name} = 1,655.2385 USDT ($1,664.11)</p>
      <div>
        {selectedTab === 0 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 1 hour</div>}
        {selectedTab === 1 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 7 days</div>}
        {selectedTab === 2 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 30 days</div>}
        {selectedTab === 3 && <div className={clsx("font-20", "font-secondary", styles.tabContent)}>Past 365 days</div>}
      </div>
      {data.length && labels.length && <Line options={options} data={getData(mode, data, labels)} type="line"/>}
      {candleData.length && <Bar options={financialOptions} data={getCandleData(candleData)} type="bar"/>}
    </>
  </div>;
}
