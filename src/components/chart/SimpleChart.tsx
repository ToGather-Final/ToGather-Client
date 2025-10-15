"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickSeries,
} from "lightweight-charts";
import { useRouter } from "next/navigation";

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
  stockCode?: string;
}
type PriceLineHandle = ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>;

export const SimpleChart: React.FC<ChartProps> = ({ dayData, stockCode }) => {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const minLineRef = useRef<PriceLineHandle | null>(null);
  const maxLineRef = useRef<PriceLineHandle | null>(null);

  const handleChartClick = useCallback(() => {
    if (stockCode) {
      router.push(`/stock/${stockCode}`);
    }
  }, [router, stockCode]);

  const setChartData = useCallback(() => {
    if (!dayData || dayData.length === 0) return;

    candleSeriesRef.current?.setData(
      dayData.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    let minimumPrice = dayData[0].low;
    let maximumPrice = dayData[0].high;
    for (let i = 1; i < dayData.length; i++) {
      const highPrice = dayData[i].high;
      if (highPrice > maximumPrice) {
        maximumPrice = highPrice;
      }
      const lowPrice = dayData[i].low;
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
      });

      maxLineRef.current = candleSeriesRef.current.createPriceLine({
        price: maximumPrice,
        color: "#ef5350",
        lineWidth: 1,
        lineStyle: 2, // LineStyle.Dashed
        axisLabelVisible: true,
      });
    }
  }, [dayData]);

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
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      barSpacing: 5,
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ff0000ff",
      downColor: "#2200ffff",
      borderVisible: false,
      wickUpColor: "#ADADAD",
      wickDownColor: "#ADADAD",
    });
    candleSeriesRef.current = candlestickSeries;

    setChartData();

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
      chartRef.current = null;
    };
  }, [setChartData]);

  useEffect(() => {
    if (!chartRef.current) return;
    setChartData();
  }, [setChartData]);

  return (
    <div>
      <div
        ref={chartContainerRef}
        className="w-full h-[calc(50dvh)] cursor-pointer"
        onClick={handleChartClick}
      />
    </div>
  );
};
