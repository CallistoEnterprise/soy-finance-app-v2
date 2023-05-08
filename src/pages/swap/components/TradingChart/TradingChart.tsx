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
import {
  fetchTokenPriceData,
  getUnixTime,
  inter,
  startOfHour,
  startTimestamp,
  utcCurrentTime
} from "../../../../shared/fetcher";
import 'chartjs-adapter-date-fns';
import Svg from "../../../../components/atoms/Svg/Svg";
import {sub} from "../../../../shared/fetcher";
import Preloader from "../../../../components/atoms/Preloader/Preloader";
import Text from "../../../../components/atoms/Text";
import {isNativeToken} from "../../../../shared/utils";
import {WCLO_ADDRESS} from "../../hooks/useTrade";


const tooltipLine = {
  id: 'tooltipLine',
  afterDraw(chart: Chart) {
    // if (!chart.config.options.plugins.candlestick) {
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
    // }
  }
};

const candlestick = {
  id: "candlestick",
  beforeDatasetDraw(chart: Chart, args: { index: number; meta: ChartMeta }, options): boolean | void {
    if (chart.config.options.plugins.candlestick) {
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
          color = '#6DA316'
        } else {
          color = '#CD1515'
        }

        return color;
      }),
      borderColor: "rgba(0,0,0,1)",
      borderRadius: 2,
      borderSkipped: false,
      label: 'Financial Chart',
      data
    },
  ],
});

const financialOptions = (timeline): ChartOptions =>  ({
  responsive: true,
  animation: false,
  interaction: {
    mode: "nearest",
    intersect: false,
    axis: "x"
  },
  parsing: {
    xAxisKey: "x",
    yAxisKey: "s"
  },
  scales: {
    x: {
      type: "timeseries",
      time: {
        unit: timeline === "day" ? "hour" : 'day'
      },
      ticks: {
        maxTicksLimit: 6,
      },
      grid: {
        display: false,
        drawBorder: false
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        display: false,
        color: (context) => {
          if (context.index === 0) {
            return ""
          }
        }
      },
      ticks: {
        callback: function(value, index, values) {
          return '$' + Number(value).toFixed(8).replace(/\.?0+$/, '');
        }
      }
    }
  },
  plugins: {
    candlestick: {},
    tooltipLine: {},
    legend: {
      display: false
    },
    tooltip: {
      // Disable the on-canvas tooltip
      enabled: false,
      external: externalTooltipHandler,
      position: "nearest",
      mode: "index",
      intersect: false,
      yAlign: "bottom",
      padding: 16,
      caretPadding: 20,
      caretSize: 0,

      borderWidth: 1,
      cornerRadius: 4,
      titleAlign: "center",
      titleFont: {
        size: 14,
      },
      titleMarginBottom: 8,
      bodyFont: {
        size: 14,
      },
      bodyAlign: "center",
      footerAlign: "center",
      displayColors: false
    }
  }
});

const tooltipElementConfig = {
  background: "#fff",
  borderRadius: "4px",
  color: "#D4DDD8",
  opacity: 1,
  pointerEvents: "none",
  position: "absolute",
  transform: "translate(-50%, 0)",
  transition: "all .1s ease",
  minWidth: "132px",
  border: "1px solid #D4DDD8",
  textAlign: "center",
};

const getOrCreateTooltip = (chart) => {
  let tooltipEl = document.getElementById('chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chartjs-tooltip";
    tooltipEl.style.position = "relative";
    for (const styleName in tooltipElementConfig) {
      tooltipEl.style[styleName] = tooltipElementConfig[styleName];
    }

    const table = document.createElement("div");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  const {x, y} = context.tooltip.dataPoints[0].parsed;

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  const tableRoot = tooltipEl.querySelector("div");

  // Remove old children
  while (tableRoot.firstChild) {
    tableRoot.firstChild.remove();
  }

  const dayBlock = document.createElement("div");
  dayBlock.innerText = new Date(x).toLocaleString('en-US', {year: "numeric", day: "numeric", month: "short"});

  const timeBlock = document.createElement("div");
  timeBlock.innerText = new Date(x).toLocaleString('en-US', {minute: "2-digit", second: "2-digit", hour: "2-digit"});

  const dateRow = document.createElement("div");
  dateRow.style.display = "flex";
  dateRow.style.justifyContent = "space-between";
  dateRow.style.gap = "40px";
  dateRow.style.fontSize = "14px";
  dateRow.style.marginBottom = "10px";
  dateRow.style.whiteSpace = "nowrap";
  dateRow.style.color = "#4B564B";

  dateRow.appendChild(dayBlock);
  dateRow.appendChild(timeBlock);
  tableRoot.appendChild(dateRow);

  const cryptoSumRow = document.createElement("div");
  cryptoSumRow.style.fontSize = "16px";
  cryptoSumRow.style.lineHeight = "26px";
  cryptoSumRow.style.textAlign = "left";
  cryptoSumRow.style.fontWeight = "700";
  cryptoSumRow.style.color = "#122110";

  if(context.tooltip.dataPoints[0].raw.s) {
    const firstRow = document.createElement("span");
    const secondRow = document.createElement("span");


    firstRow.style.whiteSpace = secondRow.style.whiteSpace = "nowrap";

    cryptoSumRow.style.display = "flex";
    cryptoSumRow.style.flexDirection = "column";
    cryptoSumRow.style.gap = "4px";

    firstRow.innerText = `Open: $${context.tooltip.dataPoints[0].raw.s[0].toFixed(18)}`;
    secondRow.innerText = `Closed: $${context.tooltip.dataPoints[0].raw.s[1].toFixed(18)}`;

    cryptoSumRow.appendChild(firstRow);
    cryptoSumRow.appendChild(secondRow);
  } else {
    cryptoSumRow.innerText = `$${y.toFixed(18)}`;
  }

  tableRoot.appendChild(cryptoSumRow);

  const arrow = document.createElement("div");
  arrow.style.position = "absolute";
  arrow.style.bottom = "0";
  arrow.style.left = "50%";
  arrow.style.width = "8px";
  arrow.style.height = "8px";
  arrow.style.borderRight = "1px solid #D4DDD8";
  arrow.style.borderBottom = "1px solid #D4DDD8";
  arrow.style.transform = "rotate(45deg) translate(4px, 4px)";
  arrow.style.backgroundColor = "#fff";


  tableRoot.appendChild(arrow);


  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  tooltipEl.style.opacity = "1";

  const offset = tooltip.x + tooltip.width - chart.chartArea.width;
  if (offset > 0) {
    tooltipEl.style.left = positionX + tooltip.caretX - offset + "px";
  } else {
    tooltipEl.style.left = positionX + tooltip.caretX + "px";
  }

  if(context.tooltip.dataPoints[0].raw.s) {
    tooltipEl.style.top = positionY + tooltip.caretY - 140 + "px";
  } else {
    tooltipEl.style.top = positionY + tooltip.caretY - 110 + "px";
  }


  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + "px " + tooltip.options.padding + "px";
};

export const options = (timeline): ChartOptions => ({
  responsive: true,
  animation: false,
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
    tooltip: {
      // Disable the on-canvas tooltip
      enabled: false,
      external: externalTooltipHandler,
      position: "nearest",
      mode: "index",
      intersect: false,
      yAlign: "bottom",
      padding: 16,
      caretPadding: 20,
      caretSize: 0,

      borderWidth: 1,
      cornerRadius: 4,
      titleAlign: "center",
      titleFont: {
        size: 14,
      },
      titleMarginBottom: 8,
      bodyFont: {
        size: 14,
      },
      bodyAlign: "center",
      footerAlign: "center",
      displayColors: false
    }
  },
  scales: {
    x: {
      type: "timeseries",
      time: {
        unit: timeline === "day" ? "hour" : 'day'
      },
      grid: {
        // color: "transparent",
        tickColor: "black",
        drawTicks: true,

        display: false,
        // display: false,
        // drawBorder: false
        // offset: true
      },
      // type: "timeseries",
      ticks: {
        // padding: 30,
        // stepSize: 44440000
        maxTicksLimit: timeline === "year" ? 10 : 7,
        labelOffset: 10
        // autoSkip: false,
        // autoSkipPadding: 50,
        // align: "inner"
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
      },
      ticks: {
        callback: function(value, index, values) {
          return '$' + Number(value).toFixed(8).replace(/\.?0+$/, '');
        }
      }
    }
  }
});

const color = "#6DA316";


export const getData = (mode, data, labels): ChartData => ({
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
      // tension: 0.2
    }
  ],
});

const tabsTimeline = ["day", "week", "month", "year"];

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

  const [time, setTime] = useState({
    startTimestamp,
    interval: inter
  });

  const [loading, setIsLoading] = useState(true);

  console.log(firstToken);

  const [secondToken, setSecondToken] = useState<SwapToken>(null);

  useEffect(() => {
    if (swapInputData.tokenFrom) {
      if(isNativeToken(swapInputData.tokenFrom.token_address)) {
        return setFirstToken({...swapInputData.tokenFrom, token_address: WCLO_ADDRESS});
      }

      setFirstToken(swapInputData.tokenFrom);
    }
  }, [swapInputData.tokenFrom]);

  useEffect(() => {
    if (swapInputData.tokenTo) {
      if(isNativeToken(swapInputData.tokenTo.token_address)) {
        return setFirstToken({...swapInputData.tokenTo, token_address: WCLO_ADDRESS});
      }

      setFirstToken(swapInputData.tokenTo);
    }
  }, [swapInputData.tokenTo]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const price = await fetchTokenPriceData(currentGraph === "first" ? firstToken.token_address.toLowerCase() : secondToken.token_address.toLowerCase(), time.interval, time.startTimestamp);

      const candlePrice = await fetchTokenPriceData(currentGraph === "first" ? firstToken.token_address.toLowerCase() : secondToken.token_address.toLowerCase(), time.interval, time.startTimestamp);

      const dataResult = [];
      const labelsResult = [];
      const candleDataResult = [];

      if (price.data) {
        for (const priceObj of price.data) {
          dataResult.push(priceObj.close);
          labelsResult.push( new Date(priceObj.time * 1000));
        }
      }

      if (candlePrice.data) {
        for (const priceObj of candlePrice.data) {
          console.log(priceObj.time);
          candleDataResult.push({
            x: new Date(priceObj.time * 1000),
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

      const newValue = dataResult[dataResult.length - 1];
      const oldValue = dataResult[0];

      const change = ((newValue - oldValue) / oldValue) * 100;
      setPriceChange(+change.toFixed(1));

      // console.log(dataResult[0], dataResult[dataResult.length - 1]);
      //
      // console.log(price);
      setIsLoading(false);
    })();

  }, [firstToken, currentGraph, secondToken, time]);

  const [view, setView] = useState<"line" | "candlestick">("line");

  const [priceChange, setPriceChange] = useState(0);

  return <div className="paper">

    <>
      <div className={styles.blockHeader}>
        <div className={styles.tokensInfo}>
          <div className={styles.pairLogos}>
            <button onClick={() => {
              setCurrentGraph("first");
            }} className={clsx(styles.firstImageToken, currentGraph === "first" && styles.active)}>
              <img width={36} height={36} src={firstToken.imgUri}/>
            </button>
            <button disabled={!secondToken}
                    onClick={() => {
                      setCurrentGraph("second");
                    }} className={clsx(styles.secondImageToken, currentGraph === "second" && styles.active)}>

              {secondToken ? <img width={36} height={36} src={secondToken.imgUri}/>
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
          {/*<button onClick={() => {*/}
          {/*  setView(view === "candlestick" ? "line" : "candlestick");*/}
          {/*}}><Svg iconName="roadmap" /></button>*/}
          {/*<Text variant={24} weight={700} color="primary">{firstToken.original_name}</Text>*/}
          {/*<IconButton onClick={() => {*/}
          {/*  setFirstToken(secondToken);*/}
          {/*  setSecondToken(firstToken);*/}
          {/*}}>*/}
          {/*  <Svg iconName="swap"/>*/}
          {/*</IconButton>*/}
        </div>
        <div className={styles.chartSettings}>
          <div className={styles.tabs}>
            <TabTitle size="small" title="1D" selectedTab={selectedTab} setSelectedTab={(tab) => {
              setSelectedTab(tab);
              setTime({
                startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {days: 1}))),
                interval: 1800
              })
            }} view="separate" index={0}/>
            <TabTitle size="small" title="1W" selectedTab={selectedTab} setSelectedTab={(tab) => {
              setSelectedTab(tab);
              setTime({
                startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {weeks: 1}))),
                interval: 3600
              })
            }} view="separate" index={1}/>
            <TabTitle size="small" title="1M" selectedTab={selectedTab} setSelectedTab={(tab) => {
              setSelectedTab(tab);
              setTime({
                startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {months: 1}))),
                interval: 3600 * 4
              })
            }} view="separate" index={2}/>
            <TabTitle size="small" title="1Y" selectedTab={selectedTab} setSelectedTab={(tab) => {
              setSelectedTab(tab);
              setTime({
                startTimestamp: getUnixTime(startOfHour(sub(utcCurrentTime, {years: 1}))),
                interval: 3600 * 24
              })
            }} view="separate" index={3}/>
          </div>
          <div className={styles.viewButtons}>
            <button onClick={() => {
              setView("line");
            }} className={view === "line" && styles.active}><Svg size={18} iconName="trading" /></button>
            <button onClick={() => {
              setView("candlestick");
            }} className={view === "candlestick" && styles.active}><Svg size={18} iconName="candle" /></button>
          </div>
        </div>
      </div>
      <p className="font-24 font-secondary font-300">1 {firstToken.original_name} = 1,655.2385 USDT ($1,664.11)</p>

      <div className={styles.chartContainer}>
        {loading && <div className={styles.loading}><Preloader withLogo={false} size={100} /></div>}
        <div>
          {selectedTab === 0 && <div className={clsx("font-16", "font-secondary", styles.tabContent)}>
            <span className={clsx(styles.priceChange, priceChange >= 0 ? styles.green : styles.red)}>{priceChange}%</span>
            <Text color="secondary">Past 1 hour</Text>
          </div>}
          {selectedTab === 1 && <div className={clsx("font-16", "font-secondary", styles.tabContent)}>
            <span className={clsx(styles.priceChange, priceChange >= 0 ? styles.green : styles.red)}>{priceChange}%</span>
            <Text color="secondary">Past 7 days</Text>
          </div>}
          {selectedTab === 2 && <div className={clsx("font-16", "font-secondary", styles.tabContent)}>
            <span className={clsx(styles.priceChange, priceChange >= 0 ? styles.green : styles.red)}>{priceChange}%</span>
            <Text color="secondary">Past 30 days</Text>
          </div>}
          {selectedTab === 3 && <div className={clsx("font-16", "font-secondary", styles.tabContent)}>
            <span className={clsx(styles.priceChange, priceChange >= 0 ? styles.green : styles.red)}>{priceChange}%</span>
            <Text color="secondary">Past 365 days</Text>
          </div>}
        </div>
        {view==="line" && data.length && labels.length && <Line options={options(tabsTimeline[selectedTab])} data={getData(mode, data, labels)} type="line"/>}
        {view==="candlestick" && candleData.length && <Bar options={financialOptions(tabsTimeline[selectedTab])} data={getCandleData(candleData)} type="bar"/>}
      </div>

    </>
  </div>;
}
