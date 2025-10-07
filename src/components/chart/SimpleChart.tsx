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
  AreaSeries,
} from "lightweight-charts";
import { useRouter } from "next/navigation";
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
  stockCode?: string;
}
type PriceLineHandle = ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>;
type Period = "일" | "주" | "월" | "년";

export const SimpleChart: React.FC<ChartProps> = ({
  dayData,
  weekData,
  monthData,
  yearData,
  stockCode,
}) => {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const minLineRef = useRef<PriceLineHandle | null>(null);
  const maxLineRef = useRef<PriceLineHandle | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("일");

  const handleChartClick = useCallback(() => {
    if (stockCode) {
      router.push(`/stock/${stockCode}`);
    }
  }, [router, stockCode]);

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

      areaSeriesRef.current?.setData(
        data.map((d) => ({ time: d.time as Time, value: d.trading_volume }))
      );

      let minimumPrice = data[0].trading_volume;
      let maximumPrice = data[0].trading_volume;
      for (let i = 1; i < data.length; i++) {
        const price = data[i].trading_volume;
        if (price > maximumPrice) {
          maximumPrice = price;
        }
        if (price < minimumPrice) {
          minimumPrice = price;
        }
      }
      if (areaSeriesRef.current) {
        if (minLineRef.current) {
          areaSeriesRef.current.removePriceLine(minLineRef.current);
          minLineRef.current = null;
        }
        if (maxLineRef.current) {
          areaSeriesRef.current.removePriceLine(maxLineRef.current);
          maxLineRef.current = null;
        }

        minLineRef.current = areaSeriesRef.current.createPriceLine({
          price: minimumPrice,
          color: "#2200ffff",
          lineWidth: 1,
          lineStyle: 2, // LineStyle.Dashed
          axisLabelVisible: true,
          //title: 'min price',
        });

        maxLineRef.current = areaSeriesRef.current.createPriceLine({
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
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      barSpacing: 5,
    });
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    areaSeriesRef.current = areaSeries;

    setChartInterval(selectedPeriod);

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (minLineRef.current) {
        areaSeries?.removePriceLine(minLineRef.current);
        minLineRef.current = null;
      }
      if (maxLineRef.current) {
        areaSeries?.removePriceLine(maxLineRef.current);
        maxLineRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
      chart.remove();
      areaSeriesRef.current = null;
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    setChartInterval(selectedPeriod);
  }, [selectedPeriod, seriesesData]);

  return (
    <div>
      <div ref={buttonsContainerRef} className="mt-2 flex justify-center" />
      <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      <div
        ref={chartContainerRef}
        className="w-full h-[calc(50dvh)] cursor-pointer"
        onClick={handleChartClick}
      />
    </div>
  );
};
