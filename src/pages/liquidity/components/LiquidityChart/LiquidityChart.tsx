import React, {useEffect, useState} from "react";
import styles from "./LiquidityChart.module.scss";
import {fetchChartData, getOverviewChartData} from "../../../../shared/fetcher";
import {Chart, Line} from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS, ChartData, ChartOptions,
  Filler, Legend,
  LinearScale,
  LineElement,
  PointElement, ScriptableContext, TimeSeriesScale,
  Title, Tooltip
} from "chart.js";
import 'chartjs-adapter-date-fns';
import PageCardHeading from "../../../../components/molecules/PageCardHeading";
import {data} from "../TradingChart/TradingChart";
import Text from "../../../../components/atoms/Text";

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
  TimeSeriesScale
);

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
      pointRadius: 4
    }
  ],
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
  arrow.style.bottom = "1px";
  arrow.style.left = "50%";
  arrow.style.width = "8px";
  arrow.style.height = "8px";
  arrow.style.borderRight = "1px solid #D4DDD8";
  arrow.style.borderBottom = "1px solid #D4DDD8";
  arrow.style.transform = "rotate(45deg) translate(4px, 4px)";
  arrow.style.backgroundColor = "#fff";


  tableRoot.appendChild(arrow);


  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  const pos = tooltipEl.getBoundingClientRect();

  tooltipEl.style.opacity = "1";

  const offset = tooltip.x + tooltip.width - chart.chartArea.width;
  // if (offset > 0) {
  //   tooltipEl.style.left = positionX + tooltip.caretX - offset + "px";
  // } else {
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  // }

  if(context.tooltip.dataPoints[0].raw.s) {
    tooltipEl.style.top = positionY + tooltip.caretY - 140 + "px";
  } else {
    tooltipEl.style.top = positionY + tooltip.caretY - 110 + "px";
  }


  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + "px " + tooltip.options.padding + "px";
};

const financialOptions = (): ChartOptions =>  ({
  responsive: true,
  animation: false,
  interaction: {
    mode: "nearest",
    intersect: false,
    axis: "x"
  },
  parsing: {
    xAxisKey: "date",
    yAxisKey: "liquidityUSD"
  },
  scales: {
    x: {
      type: "timeseries",
      time: {
        unit: "day"
      },
      ticks: {
        maxTicksLimit: 9,
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

export default function LiquidityChart() {
  const [overviewChartData, setOverviewChartData] = useState<string[]>([]);
  const [labels, setLabels] = useState<Date[]>([]);
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(getOverviewChartData)
      if (data) {
        const dataResult = [];
        const labelsResult = [];

        for(const item of data) {
          dataResult.push(item.liquidityUSD);
          labelsResult.push(new Date(item.date * 1000));
        }

        setOverviewChartData(dataResult);
        setLabels(labelsResult);
      } else {
        setError(true)
      }
    }
    if (!overviewChartData?.length && !error) {
      fetch()
    }
  }, [overviewChartData, error])

  return <div className="paper">
    <PageCardHeading title="Liquidity analytics" />
    <div className={styles.lastDayData}>
      {labels.length && overviewChartData.length && <Text variant={20} weight={500} color="secondary">
        {labels[labels.length - 1].toLocaleString('en-US', {year: "numeric", day: "numeric", month: "short"})} — {(overviewChartData[overviewChartData.length - 1] / 1000).toFixed(2)}K
      </Text>}
    </div>
    {overviewChartData.length && <Line options={financialOptions()} type="line" data={getData("light", overviewChartData, labels)} />}
  </div>;
}
