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
import { ChartProps, StockChartData } from "@/types/api/stock";

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
  const ma10SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const histogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const minLineRef = useRef<PriceLineHandle | null>(null);
  const maxLineRef = useRef<PriceLineHandle | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("일");
  const [legendData, setLegendData] = useState({
    volume: "",
  });
  const [tooltipData, setTooltipData] = useState<
    (StockChartData & { prevClose?: number; prevVolume?: number }) | null
  >(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const seriesesData = useMemo(
    () =>
      new Map<Period, StockChartData[]>([
        ["일", dayData],
        ["주", weekData],
        ["월", monthData],
        ["년", yearData],
      ]),
    [dayData, weekData, monthData, yearData]
  );
  console.log(dayData);

  // 날짜 형식 변환 함수
  const formatTimeForChart = (timeStr: string): Time => {
    // yyyymmdd 형식인 경우 (API에서 오는 형식)
    if (/^\d{8}$/.test(timeStr)) {
      const year = timeStr.substring(0, 4);
      const month = timeStr.substring(4, 6);
      const day = timeStr.substring(6, 8);
      return `${year}-${month}-${day}` as Time;
    }
    // yyyy-mm 형식인 경우 (월 데이터)
    if (/^\d{4}-\d{2}$/.test(timeStr)) {
      return `${timeStr}-01` as Time; // yyyy-mm-01로 변환
    }
    // yyyy-mm-dd 형식인 경우 (일/주 데이터)
    if (/^\d{4}-\d{2}-\d{2}$/.test(timeStr)) {
      return timeStr as Time;
    }
    // yyyy 형식인 경우 (년 데이터)
    if (/^\d{4}$/.test(timeStr)) {
      return `${timeStr}-01-01` as Time; // yyyy-01-01로 변환
    }
    // 기본값
    return timeStr as Time;
  };

  // 날짜 포맷팅 함수
  const formatDate = (timeStr: string) => {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = days[date.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek})`;
  };

  // 변화율 계산 함수
  const calculateChange = (current: number, previous: number) => {
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(2);
    return { diff, percent };
  };

  const setChartInterval = useCallback(
    (interval: Period) => {
      const data = seriesesData.get(interval);
      if (!data) return;
      ma5SeriesRef.current?.setData(
        data.map((d) => ({ time: formatTimeForChart(d.time), value: d.ma_5 }))
      );
      ma20SeriesRef.current?.setData(
        data.map((d) => ({ time: formatTimeForChart(d.time), value: d.ma_20 }))
      );
      ma60SeriesRef.current?.setData(
        data.map((d) => ({ time: formatTimeForChart(d.time), value: d.ma_60 }))
      );
      ma10SeriesRef.current?.setData(
        data.map((d) => ({ time: formatTimeForChart(d.time), value: d.ma_10 }))
      );

      candleSeriesRef.current?.setData(
        data.map((d) => ({
          time: formatTimeForChart(d.time),
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
      histogramSeriesRef.current?.setData(
        data.map((d) => ({
          time: formatTimeForChart(d.time),
          value: d.trading_volume,
        }))
      );

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
          //title: "min price",
        });

        maxLineRef.current = candleSeriesRef.current.createPriceLine({
          price: maximumPrice,
          color: "#ff0000ff",
          lineWidth: 1,
          lineStyle: 2, // LineStyle.Dashed
          axisLabelVisible: true,
          //title: "max price",
        });
      }
    },
    [seriesesData]
  );

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

    chart.applyOptions({
      rightPriceScale: {
        scaleMargins: {
          top: 0.17, // leave some space for the legend
          bottom: 0,
        },
      },
    });

    chart.timeScale().fitContent();
    chart.timeScale().applyOptions({
      barSpacing: 5,
    });
    chartRef.current = chart;

    const ma5lineSeries = chart.addSeries(LineSeries, {
      color: "#545454",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });
    ma5SeriesRef.current = ma5lineSeries;
    const ma20lineSeries = chart.addSeries(LineSeries, {
      color: "#F1A626",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });
    ma20SeriesRef.current = ma20lineSeries;
    const ma60lineSeries = chart.addSeries(LineSeries, {
      color: "#40B27F",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });
    ma60SeriesRef.current = ma60lineSeries;
    const ma10lineSeries = chart.addSeries(LineSeries, {
      color: "#FF4868",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });
    ma10SeriesRef.current = ma10lineSeries;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ff0000ff",
      downColor: "#2200ffff",
      borderVisible: false,
      wickUpColor: "#ADADAD",
      wickDownColor: "#ADADAD",
      priceFormat: {
        type: "price",
        precision: 0,
        minMove: 1,
      },
    });
    candleSeriesRef.current = candlestickSeries;

    const histogramSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      color: "#ADADAD",
    });
    chart.addPane();
    histogramSeries.moveToPane(1);
    histogramSeriesRef.current = histogramSeries;

    chart.panes()[1].setHeight(chartContainerRef.current.clientHeight / 4);

    setChartInterval(selectedPeriod);

    // Crosshair move 이벤트 구독
    chart.subscribeCrosshairMove((param) => {
      let volumeText = "";

      if (param.time) {
        const data = param.seriesData.get(histogramSeries);
        const volume = data && "value" in data ? data.value : 0;
        volumeText = Math.round(volume).toLocaleString("ko-KR");
      }

      setLegendData({
        volume: volumeText,
      });

      if (
        !param.time ||
        param.point === undefined ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setTooltipVisible(false);
        return;
      }

      const candleData = param.seriesData.get(candlestickSeries);
      const volumeData = param.seriesData.get(histogramSeries);
      const ma5Data = param.seriesData.get(ma5lineSeries);
      const ma20Data = param.seriesData.get(ma20lineSeries);
      const ma60Data = param.seriesData.get(ma60lineSeries);
      const ma10Data = param.seriesData.get(ma10lineSeries);

      if (candleData && volumeData) {
        const tooltipWidth = 200; // 툴팁 예상 너비
        const tooltipHeight = 400; // 툴팁 예상 높이
        const margin = 10;

        // x 위치 계산: 오른쪽 공간이 부족하면 왼쪽에 표시
        let x = param.point.x + margin;
        if (x + tooltipWidth > chartContainerRef.current!.clientWidth) {
          x = param.point.x - tooltipWidth - margin;
        }

        //y 위치 계산: 아래 공간이 부족하면 위쪽으로 조정
        let y = param.point.y + margin;
        if (y + tooltipHeight > chartContainerRef.current!.clientHeight) {
          y = chartContainerRef.current!.clientHeight - tooltipHeight - margin;
        }
        if (y < margin) {
          y = margin;
        }

        // 전일 종가 및 거래량 계산
        const currentData = seriesesData.get(selectedPeriod) || [];
        const currentIndex = currentData.findIndex(
          (d) => formatTimeForChart(d.time) === param.time
        );
        const prevClose =
          currentIndex > 0 ? currentData[currentIndex - 1].close : undefined;
        const prevVolume =
          currentIndex > 0
            ? currentData[currentIndex - 1].trading_volume
            : undefined;

        setTooltipPosition({ x, y });
        setTooltipData({
          time: param.time as string,
          open: (candleData as any).open,
          high: (candleData as any).high,
          low: (candleData as any).low,
          close: (candleData as any).close,
          trading_volume: (volumeData as any).value,
          ma_5: (ma5Data as any)?.value ?? 0,
          ma_10: (ma10Data as any)?.value ?? 0,
          ma_20: (ma20Data as any)?.value ?? 0,
          ma_60: (ma60Data as any)?.value ?? 0,
          prevClose,
          prevVolume,
        });
        setTooltipVisible(true);
      }
    });

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
      ma10SeriesRef.current = null;
      chartRef.current = null;
      minLineRef.current = null;
      maxLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    setChartInterval(selectedPeriod);
  }, [selectedPeriod, seriesesData]);

  return (
    <div>
      <div className="px-6">
        <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>
      <div className="relative">
        <div className="absolute left-0 top-3 z-10 text-sm font-light bg-white/80 px-2">
          <span style={{ color: "#545454" }}>■ 5</span>{" "}
          <span style={{ color: "#FF4868" }}>■ 10</span>{" "}
          <span style={{ color: "#F1A626" }}>■ 20</span>{" "}
          <span style={{ color: "#40B27F" }}>■ 60</span>
        </div>
        {tooltipVisible && tooltipData && (
          <div
            className="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] pointer-events-none text-[14px]"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            <div className="text-base  text-[14px] mb-1 pb-1 border-b">
              {formatDate(tooltipData.time)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-[14px]">종가</span>
              <div className="text-right">
                <span
                  className={
                    tooltipData.prevClose &&
                    tooltipData.close >= tooltipData.prevClose
                      ? "text-red-600"
                      : "text-blue-600"
                  }
                >
                  {tooltipData.close.toLocaleString()}
                </span>
                {tooltipData.prevClose && (
                  <span
                    className={`ml-2 text-xs ${
                      tooltipData.close >= tooltipData.prevClose
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {
                      calculateChange(tooltipData.close, tooltipData.prevClose)
                        .percent
                    }
                    %
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">시가</span>
                <div className="text-right">
                  <span
                    className={
                      tooltipData.prevClose &&
                      tooltipData.open >= tooltipData.prevClose
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  >
                    {tooltipData.open.toLocaleString()}
                  </span>
                  {tooltipData.prevClose && (
                    <span
                      className={`ml-2 text-xs ${
                        tooltipData.open >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {
                        calculateChange(tooltipData.open, tooltipData.prevClose)
                          .percent
                      }
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">고가</span>
                <div className="text-right">
                  <span
                    className={
                      tooltipData.prevClose &&
                      tooltipData.high >= tooltipData.prevClose
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  >
                    {tooltipData.high.toLocaleString()}
                  </span>
                  {tooltipData.prevClose && (
                    <span
                      className={`ml-2 text-xs ${
                        tooltipData.high >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {
                        calculateChange(tooltipData.high, tooltipData.prevClose)
                          .percent
                      }
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">저가</span>
                <div className="text-right">
                  <span
                    className={
                      tooltipData.prevClose &&
                      tooltipData.low >= tooltipData.prevClose
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  >
                    {tooltipData.low.toLocaleString()}
                  </span>
                  {tooltipData.prevClose && (
                    <span
                      className={`ml-2 text-xs ${
                        tooltipData.low >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {
                        calculateChange(tooltipData.low, tooltipData.prevClose)
                          .percent
                      }
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">거래량</span>
                <div className="text-right">
                  <span className="text-gray-700 font-medium">
                    {Math.round(tooltipData.trading_volume).toLocaleString()}
                  </span>
                  {tooltipData.prevVolume && (
                    <span
                      className={`ml-2 text-xs ${
                        tooltipData.trading_volume >= tooltipData.prevVolume
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {
                        calculateChange(
                          tooltipData.trading_volume,
                          tooltipData.prevVolume
                        ).percent
                      }
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 mt-1 border-t">
                <div className="text-xs text-gray-500 mb-1.5">주가이동평균</div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">이평 5</span>
                  <div className="text-right">
                    <span
                      className={
                        tooltipData.prevClose &&
                        tooltipData.ma_5 >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {tooltipData.ma_5.toLocaleString()}
                    </span>
                    {tooltipData.prevClose && (
                      <span
                        className={`ml-2 text-xs ${
                          tooltipData.ma_5 >= tooltipData.prevClose
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {
                          calculateChange(
                            tooltipData.ma_5,
                            tooltipData.prevClose
                          ).percent
                        }
                        %
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">이평 10</span>
                  <div className="text-right">
                    <span
                      className={
                        tooltipData.prevClose &&
                        tooltipData.ma_10 >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {tooltipData.ma_10.toLocaleString()}
                    </span>
                    {tooltipData.prevClose && (
                      <span
                        className={`ml-2 text-xs ${
                          tooltipData.ma_10 >= tooltipData.prevClose
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {
                          calculateChange(
                            tooltipData.ma_10,
                            tooltipData.prevClose
                          ).percent
                        }
                        %
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">이평 20</span>
                  <div className="text-right">
                    <span
                      className={
                        tooltipData.prevClose &&
                        tooltipData.ma_20 >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {tooltipData.ma_20.toLocaleString()}
                    </span>
                    {tooltipData.prevClose && (
                      <span
                        className={`ml-2 text-xs ${
                          tooltipData.ma_20 >= tooltipData.prevClose
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {
                          calculateChange(
                            tooltipData.ma_20,
                            tooltipData.prevClose
                          ).percent
                        }
                        %
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">이평 60</span>
                  <div className="text-right">
                    <span
                      className={
                        tooltipData.prevClose &&
                        tooltipData.ma_60 >= tooltipData.prevClose
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {tooltipData.ma_60.toLocaleString()}
                    </span>
                    {tooltipData.prevClose && (
                      <span
                        className={`ml-2 text-xs ${
                          tooltipData.ma_60 >= tooltipData.prevClose
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {
                          calculateChange(
                            tooltipData.ma_60,
                            tooltipData.prevClose
                          ).percent
                        }
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="absolute left-0 bottom-[17dvh] z-10 text-sm font-light bg-white/80 px-2">
          {legendData.volume ? `거래량 ${legendData.volume}` : "거래량"}
        </div>
        <div
          ref={chartContainerRef}
          className="w-full h-[calc(100dvh-285px)]"
        />
      </div>
    </div>
  );
};
