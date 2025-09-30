"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";
import PeriodSelector from "./PeriodSelector";

import "./chart-style.css";

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ma_5: number;
  ma_20: number;
  ma_60: number;
  ma_120: number;
  trading_volume: number;
}

interface ChartProps {
  dayData: ChartData[];
  weekData: ChartData[];
  monthData: ChartData[];
  yearData: ChartData[];
}
type PriceLineHandle = ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>;
type Period = "일" | "주" | "월" | "년";

export const ChartComponent: React.FC<ChartProps> = ({
  dayData,
  weekData,
  monthData,
  yearData,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ma5SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma60SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma120SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const histogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const minLineRef = useRef<PriceLineHandle | null>(null);
  const maxLineRef = useRef<PriceLineHandle | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("일");

  const seriesesData = useMemo(
    () =>
      new Map<Period, ChartData[]>([
        ["일", dayData],
        ["주", weekData],
        ["월", monthData],
        ["년", yearData],
      ]),
    [dayData, weekData, monthData, yearData]
  );

  const setChartInterval = useCallback(
    (interval: Period) => {
      const data = seriesesData.get(interval);
      if (!data) return;
      ma5SeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.ma_5 }))
      );
      ma20SeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.ma_20 }))
      );
      ma60SeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.ma_60 }))
      );
      ma120SeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.ma_120 }))
      );

      candleSeriesRef.current?.setData(
        data.map((d) => ({
          time: d.time as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
      histogramSeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.trading_volume }))
      );

      //hover tooltip
      // const container = document.getElementById('container');

      // const toolTipWidth = 80;
      // const toolTipHeight = 80;
      // const toolTipMargin = 15;

      // // Create and style the tooltip html element
      // const toolTip = document.createElement('div');
      // toolTip.style = `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
      // toolTip.style.background = 'white';
      // toolTip.style.color = 'black';
      // toolTip.style.borderColor = '#2962FF';
      // container.appendChild(toolTip);
      // chart.subscribeCrosshairMove(param => {
      //     if (
      //         param.point === undefined ||
      //         !param.time ||
      //         param.point.x < 0 ||
      //         param.point.y < 0
      //     ) {
      //         toolTip.style.display = 'none';
      //     } else {
      //         toolTip.style.display = 'block';
      //         const data = param.seriesData.get(candlestickSeries);
      //         const price = candlestickSeries.value !== undefined ? data.value : data.close;
      //         toolTip.innerHTML = `<div>${price.toFixed(2)}</div>`;

      //         // Position tooltip according to mouse cursor position
      //         toolTip.style.left = param.point.x + 'px';
      //         toolTip.style.top = param.point.y + 'px';
      //     }
      // });

      let minimumPrice = data[0].low;
      let maximumPrice = data[0].high;
      for (let i = 1; i < data.length; i++) {
        const highPrice = data[i].high;
        if (highPrice > maximumPrice) {
          maximumPrice = highPrice;
        }
        const lowPrice = data[i].low;
        if (lowPrice < minimumPrice) {
          minimumPrice = lowPrice;
        }
      }
      if (candleSeriesRef.current) {
        if (minLineRef.current) {
          candleSeriesRef.current.removePriceLine(minLineRef.current);
          minLineRef.current = null;
        }
        if (maxLineRef.current) {
          candleSeriesRef.current.removePriceLine(maxLineRef.current);
          maxLineRef.current = null;
        }

        minLineRef.current = candleSeriesRef.current.createPriceLine({
          price: minimumPrice,
          color: "#2200ffff",
          lineWidth: 1,
          lineStyle: 2, // LineStyle.Dashed
          axisLabelVisible: true,
          //title: 'min price',
        });

        maxLineRef.current = candleSeriesRef.current.createPriceLine({
          price: maximumPrice,
          color: "#ef5350",
          lineWidth: 1,
          lineStyle: 2, // LineStyle.Dashed
          axisLabelVisible: true,
          //title: 'max price',
        });
      }
    },
    [seriesesData]
  );
  //lineSeries.applyOptions({ color: intervalColors[interval] });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "white" },
        textColor: "#686868",
        panes: {
          separatorColor: "#f22c3d",
          separatorHoverColor: "rgba(255, 0, 0, 0.1)",
          enableResize: false,
        },
      },
      //width: chartContainerRef.current.clientWidth,
      //height: chartContainerRef.current.clientHeight,
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      barSpacing: 5,
    });
    chartRef.current = chart;

    const ma5lineSeries = chart.addSeries(LineSeries, {
      color: "#ffd900ff",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma5SeriesRef.current = ma5lineSeries;
    const ma20lineSeries = chart.addSeries(LineSeries, {
      color: "#2200ffff",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma20SeriesRef.current = ma20lineSeries;
    const ma60lineSeries = chart.addSeries(LineSeries, {
      color: "#2d953bff",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma60SeriesRef.current = ma60lineSeries;
    const ma120lineSeries = chart.addSeries(LineSeries, {
      color: "#00ffe5ff",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    ma120SeriesRef.current = ma120lineSeries;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ff0000ff",
      downColor: "#2200ffff",
      borderVisible: false,
      wickUpColor: "#ff0000ff",
      wickDownColor: "#2200ffff",
    });
    candleSeriesRef.current = candlestickSeries;

    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      color: "#686868",
    });
    chart.addPane();
    histogramSeries.moveToPane(1);
    histogramSeriesRef.current = histogramSeries;

    chart.panes()[1].setHeight(chartContainerRef.current.clientHeight / 4);

    setChartInterval(selectedPeriod);

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (minLineRef.current) {
        candlestickSeries?.removePriceLine(minLineRef.current);
        minLineRef.current = null;
      }
      if (maxLineRef.current) {
        candlestickSeries?.removePriceLine(maxLineRef.current);
        maxLineRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
      chart.remove();
      candleSeriesRef.current = null;
      histogramSeriesRef.current = null;
      ma5SeriesRef.current = null;
      ma20SeriesRef.current = null;
      ma60SeriesRef.current = null;
      ma120SeriesRef.current = null;
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    setChartInterval(selectedPeriod);
  }, [selectedPeriod, seriesesData]);

  return (
    <div>
      <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      <div ref={chartContainerRef} className="w-full h-[calc(100dvh-280px)]" />
    </div>
  );
};
