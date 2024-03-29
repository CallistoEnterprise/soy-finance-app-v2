import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScriptableContext,
  TimeSeriesScale,
  Title,
  Tooltip
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { useAccount } from "wagmi";
import PageCard from "@/components/PageCard";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores";
import SmallOutlineTabButton from "@/components/buttons/SmallOutlineTabButton";
import SmallTabIconButton from "@/components/buttons/ChartViewButton";
import useTokenGraphData from "../hooks/useTokenGraphData";
import Preloader from "@/components/atoms/Preloader";
import { useTheme } from "next-themes";
import { WrappedToken } from "@/config/types/WrappedToken";
import getAllowedPairs from "@/app/[locale]/swap/hooks/useAllowedPairs";
import { IIFE } from "@/other/IIFE";
import { formatFloat } from "@/other/formatFloat";
import { tokensInClo } from "@/config/token-lists/tokenListInCLO";
import { isNativeToken } from "@/other/isNativeToken";
import { useTranslations } from "use-intl";
import { useLocale } from "next-intl";
import { getFNSLocale } from "@/other/getFNSLocale";


const tooltipLine = {
  id: 'tooltipLine',
  afterDraw(chart: ChartJS) {
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

// const candlestick = {
//   id: "candlestick",
//   beforeDatasetDraw(chart: ChartJS, args: { index: number; meta: ChartMeta }, options): boolean | void {
//     if (chart.config.options.plugins.candlestick) {
//       const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;
//
//       ctx.save();
//       ctx.lineWidth = 2;
//       ctx.strokeStyle = "rgba(0,0,0,1)";
//
//       data.datasets[0].data.forEach((datapoint, index) => {
//         ctx.beginPath();
//         ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
//         ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].h));
//         ctx.stroke();
//
//         ctx.beginPath();
//         ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
//         ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].l));
//         ctx.stroke();
//       });
//     }
//   }
// }

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
  // candlestick,
  TimeSeriesScale
);


const getCandleData = (data: any) => ({
  // labels: labels,
  datasets: [
    {
      backgroundColor: ((ctx: { raw: any; }) => {
        if (!ctx.raw) {
          return;
        }

        const { raw: { o, c } } = ctx;
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
      minBarLength: 2,
      data
    },
  ],
});

const financialOptions = (timeline: string, locale: string, openT: string, closedT: string): ChartOptions => ({
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
      adapters: {
        date: {
          locale: getFNSLocale(locale)
        }
      },
      ticks: {
        maxTicksLimit: 6,
      },
      grid: {
        display: false
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
        callback: function (value, index, values) {
          return '$' + Number(value).toFixed(8).replace(/\.?0+$/, '');
        }
      }
    }
  },
  plugins: {
    // candlestick: {},
    // tooltipLine: {},
    legend: {
      display: false
    },
    tooltip: {
      // Disable the on-canvas tooltip
      enabled: false,
      external: (ctx) => externalTooltipHandler(ctx, locale, openT, closedT),
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

const tooltipElementConfig: {
  [key: string]: string
} = {
  background: "#fff",
  borderRadius: "4px",
  color: "#D4DDD8",
  opacity: "1",
  pointerEvents: "none",
  position: "absolute",
  transform: "translate(-50%, 0)",
  transition: "all .1s ease",
  minWidth: "132px",
  border: "1px solid #D4DDD8",
  textAlign: "center",
};

const getOrCreateTooltip = (chart: ChartJS) => {
  let tooltipEl = document.getElementById('chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chartjs-tooltip";
    tooltipEl.style.position = "relative";
    for (const styleName in tooltipElementConfig) {
      // @ts-ignore
      tooltipEl.style[styleName] = tooltipElementConfig[styleName];
    }

    const table = document.createElement("div");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode?.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context: { tooltip: any; chart: ChartJS; }, locale: string, openT?: string, closedT?: string) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  const { x, y } = tooltip.dataPoints[0].parsed;

  if(!chart.tooltip) {
    return;
  }

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  const tableRoot = tooltipEl.querySelector("div");

  // Remove old children
  while (tableRoot?.firstChild) {
    tableRoot.firstChild.remove();
  }

  const dayBlock = document.createElement("div");
  dayBlock.innerText = new Date(x).toLocaleString(locale || 'en-US', { year: "numeric", day: "numeric", month: "short" });

  const timeBlock = document.createElement("div");
  timeBlock.innerText = new Date(x).toLocaleString(locale || 'en-US', { minute: "2-digit", second: "2-digit", hour: "2-digit" });

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
  tableRoot?.appendChild(dateRow);

  const cryptoSumRow = document.createElement("div");
  cryptoSumRow.style.fontSize = "16px";
  cryptoSumRow.style.lineHeight = "26px";
  cryptoSumRow.style.textAlign = "left";
  cryptoSumRow.style.fontWeight = "700";
  cryptoSumRow.style.color = "#122110";

  if (context.tooltip.dataPoints[0].raw.s) {
    const firstRow = document.createElement("span");
    const secondRow = document.createElement("span");


    firstRow.style.whiteSpace = secondRow.style.whiteSpace = "nowrap";

    cryptoSumRow.style.display = "flex";
    cryptoSumRow.style.flexDirection = "column";
    cryptoSumRow.style.gap = "4px";

    firstRow.innerText = `${openT}: $${context.tooltip.dataPoints[0].raw.s[0].toFixed(18)}`;
    secondRow.innerText = `${closedT}: $${context.tooltip.dataPoints[0].raw.s[1].toFixed(18)}`;

    cryptoSumRow.appendChild(firstRow);
    cryptoSumRow.appendChild(secondRow);
  } else {
    cryptoSumRow.innerText = `$${y.toFixed(18)}`;
  }

  tableRoot?.appendChild(cryptoSumRow);

  const arrow = document.createElement("div");
  arrow.style.position = "absolute";
  arrow.style.bottom = "1px";
  arrow.style.left = "50%";
  arrow.style.width = "8px";
  arrow.style.height = "8px";
  arrow.style.borderRight = "1px solid #D4DDD8";
  arrow.style.borderBottom = "1px solid #D4DDD8";
  arrow.style.transform = "rotate(45deg) translate(4px, 4px)";
  arrow.style.backgroundColor = "#fff";


  tableRoot?.appendChild(arrow);


  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  const pos = tooltipEl.getBoundingClientRect();

  tooltipEl.style.opacity = "1";
  tooltipEl.style.zIndex = "1000";

  const offset = tooltip.x + tooltip.width - chart.chartArea.width;
  // if (offset > 0) {
  //   tooltipEl.style.left = positionX + tooltip.caretX - offset + "px";
  // } else {
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  // }

  if (context.tooltip.dataPoints[0].raw.s) {
    tooltipEl.style.top = positionY + tooltip.caretY - 140 + "px";
  } else {
    tooltipEl.style.top = positionY + tooltip.caretY - 110 + "px";
  }

  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + "px " + tooltip.options.padding + "px";
};


export const options = (timeline: string, locale: string): ChartOptions => ({
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
    // tooltipLine: {},
    legend: {
      display: false
    },
    tooltip: {
      enabled: false,
      external: (ctx) => externalTooltipHandler(ctx, locale),
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
      adapters: {
        date: {
          locale: getFNSLocale(locale)
        }
      },
      grid: {
        tickColor: "black",
        drawTicks: true,
        display: false,
      },
      ticks: {
        maxTicksLimit: timeline === "year" ? 10 : 7,
        labelOffset: 10
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
        callback: function (value, index, values) {
          return '$' + Number(value).toFixed(8).replace(/\.?0+$/, '');
        }
      }
    }
  }
});

const color = "#6DA316";

export const getData = (mode: string, data: number[], labels: string[]): ChartData => ({
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
      pointRadius: 4
    }
  ],
});

const tabsTimeline = ["day", "week", "month", "year"];

const soy = new WrappedToken(
  820,
  "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",
  18,
  "SOY",
  "Soy-ERC223",
  "/images/all-tokens/SOY.svg"
);

enum Timeline {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year"
}

export default function TradingChart() {
  const { chainId } = useAccount();
  const [selectedTab, setSelectedTab] = useState(1);
  const {theme} = useTheme();
  const [view, setView] = useState<"line" | "candlestick">("line");

  // const swapInputData = useStore($swapInputData);
  const { tokenTo, tokenFrom } = useSwapTokensStore();
  const [currentGraph, setCurrentGraph] = useState<"first" | "second">("first");

  const [firstToken, setFirstToken] = useState<WrappedToken>(soy);
  const [timeline, setTimeline] = useState<Timeline>(Timeline.WEEK);
  const [secondToken, setSecondToken] = useState<WrappedToken | null>(null);

  const locale = useLocale();

  const {
    data,
    candleData,
    loading,
    labels
  } = useTokenGraphData({
    address: currentGraph === "first" ? firstToken.address : secondToken?.address || "",
    timeline,
    locale: locale || "en-US"
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (tokenFrom && chainId === 820) {
      if(Object.values(tokensInClo).map(t => t.address).includes(tokenFrom.address) || isNativeToken(tokenFrom.address)) {
        setFirstToken(tokenFrom);
      }
    }

    if (!tokenFrom) {
      setFirstToken(soy);
    }
  }, [chainId, tokenFrom]);

  useEffect(() => {
    if (chainId !== 820) {
      setCurrentGraph("first");
    }
  }, [chainId]);

  useEffect(() => {
    if (tokenTo && chainId === 820) {
      if(Object.values(tokensInClo).map(t => t.address).includes(tokenTo.address) || isNativeToken(tokenTo.address)) {
        setSecondToken(tokenTo);
      }
    }

    if (!tokenTo) {
      setSecondToken(null);
    }
  }, [tokenTo, chainId]);

  const [prices, setPrices] = useState<any>(null);

  useEffect(() => {
    IIFE(async () => {
      if(!secondToken) {
        return null;
      }

      const pairs = await getAllowedPairs(firstToken, secondToken, 820);

      if(!pairs) {
        return null;
      }

      const pair = pairs[0];

      if(!pair) {
        return null;
      }

      setPrices({first: pair.priceOf(firstToken), second: pair.priceOf(secondToken)});
    });
  }, [firstToken, secondToken]);


  const firstTokenPrice = useMemo(() => {
    if (!data) {
      return;
    }

    return data[data.length - 1];
  }, [data]);

  const priceChange = useMemo(() => {
    if (!data) {
      return 0;
    }

    const newValue = data[data.length - 1];
    const oldValue = data[0];

    const change = ((newValue - oldValue) / oldValue) * 100;
    return +change.toFixed(1);
  }, [data]);

  const t = useTranslations("Swap");

  return <PageCard>
    <>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2.5">
            <button onClick={() => {
              setCurrentGraph("first");
            }} className={clsx(
              "rounded-full w-10 h-10 flex items-center justify-center p-0 border-2 overflow-hidden duration-200 hover:opacity-100",
              currentGraph === "first" ? "opacity-100 border-green" : "opacity-70 border-primary-border hover:opacity-100"
            )}>
              <img width={36} height={36} src={firstToken.logoURI}/>
            </button>
            <button disabled={!secondToken}
                    onClick={() => {
                      setCurrentGraph("second");
                    }} className={clsx(
              "rounded-full w-10 h-10 flex items-center justify-center p-0 border-2 overflow-hidden duration-200 hover:opacity-100",
              currentGraph === "second" ? "opacity-100 border-green" : "opacity-70 border-primary-border hover:opacity-100"
            )}>

              {secondToken ? <img width={36} height={36} src={secondToken.logoURI}/>
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
        </div>
        <div className="flex items-center gap-[22px]">
          <div className="flex gap-1">
            <SmallOutlineTabButton isActive={selectedTab === 0} onClick={() => {
              setSelectedTab(0);
              setTimeline(Timeline.DAY);
            }}>{t("1D")}</SmallOutlineTabButton>
            <SmallOutlineTabButton isActive={selectedTab === 1} onClick={() => {
              setSelectedTab(1);
              setTimeline(Timeline.WEEK);
            }}>{t("1W")}</SmallOutlineTabButton>
            <SmallOutlineTabButton isActive={selectedTab === 2} onClick={() => {
              setSelectedTab(2);
              setTimeline(Timeline.MONTH);
            }}>{t("1M")}</SmallOutlineTabButton>
            <SmallOutlineTabButton isActive={selectedTab === 3} onClick={() => {
              setSelectedTab(3);
              setTimeline(Timeline.YEAR);
            }}>{t("1Y")}</SmallOutlineTabButton>
          </div>
          <div className="flex gap-0.5 p-0.5 border border-primary-border rounded-1">
            <SmallTabIconButton isActive={view === "line"} icon="line" onClick={() => {
              setView("line");
            }}/>
            <SmallTabIconButton isActive={view === "candlestick"} icon="candle" onClick={() => {
              setView("candlestick");
            }}/>
          </div>
        </div>
      </div>
      <div className="h-8">
        {firstTokenPrice && !prices && <>
          <p className="text-primary-text text-20 xl:text-24 ">1 {firstToken.symbol} (${formatFloat(firstTokenPrice)})</p>
        </>}
        {firstTokenPrice && prices && <>
          {currentGraph === "first" && <p
            className="text-primary-text text-24">1 {firstToken.symbol} = {formatFloat(prices.first.toSignificant(6))} {secondToken?.symbol} (${formatFloat(firstTokenPrice)})</p>}
          {currentGraph === "second" && <p
            className="text-primary-text text-24">1 {secondToken?.symbol} = {formatFloat(prices.second.toSignificant(6))} {firstToken?.symbol} (${formatFloat(firstTokenPrice)})</p>}
        </>}
      </div>
      <div className="min-h-[56px]">
        {!loading && isMounted &&
          <div className={clsx("text-16 text-secondary-text pt-1.5 pb-5 flex gap-2 items-center")}>
            <span className={clsx("rounded-2 h-[30px] py-0.5 px-2.5", priceChange >= 0 ? "text-green bg-green/10" : "text-red bg-red/10")}>{priceChange}%</span>
            <p>{[
              t("past_one_day"),
              t("past_multiple_days", {days: 7}),
              t("past_multiple_days", {days: 30}),
              t("past_multiple_days", {days: 365})
            ][selectedTab]}</p>
          </div>
        }
      </div>
      <div className="relative aspect-[2/1]">
        {(loading || !isMounted) &&
          <div className="absolute left-0 right-0 bottom-0 top-0 flex items-center justify-center bg-primary-bg">
            <span className="relative -top-[50px]">
              <Preloader size={100}/>
            </span>
          </div>}

        {view === "line" && !loading &&
          // @ts-ignore
          <Line options={options(tabsTimeline[selectedTab], locale)} data={getData(theme, data, labels)} type="line"/>}
        {view === "candlestick" && !loading &&
          // @ts-ignore
          <Bar options={financialOptions(tabsTimeline[selectedTab], locale, t("opened"), t("closed"))} data={getCandleData(candleData)} type="bar"/>}
      </div>
    </>
  </PageCard>
}
