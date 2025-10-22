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
import { SimpleChartData } from "@/types/api/stock";

interface ChartProps {
    dayData: SimpleChartData[];
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

    // 날짜 형식 변환 함수 (YYYYMMDD -> YYYY-MM-DD)
    const formatDateForChart = (dateStr: string | undefined | null): Time => {
        if (!dateStr || typeof dateStr !== "string") {
            return new Date().toISOString().split("T")[0] as Time;
        }

        if (dateStr.length === 8) {
            // YYYYMMDD 형식을 YYYY-MM-DD로 변환
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}-${month}-${day}` as Time;
        }
        return dateStr as Time;
    };

    const handleChartClick = useCallback(() => {
        if (stockCode) {
            router.push(`/stock/${stockCode}`);
        }
    }, [router, stockCode]);

    const setChartData = useCallback(() => {
        if (!dayData || dayData.length === 0) return;

        // 유효한 데이터만 필터링
        const validData = dayData.filter(
            (d) =>
                d &&
                d.time &&
                d.open !== undefined &&
                d.high !== undefined &&
                d.low !== undefined &&
                d.close !== undefined
        );

        if (validData.length === 0) return;

        candleSeriesRef.current?.setData(
            validData.map((d) => ({
                time: formatDateForChart(d.time),
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }))
        );

        let minimumPrice = validData[0].low;
        let maximumPrice = validData[0].high;
        for (let i = 1; i < validData.length; i++) {
            const highPrice = validData[i].high;
            if (highPrice > maximumPrice) {
                maximumPrice = highPrice;
            }
            const lowPrice = validData[i].low;
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
                color: "#ff0000ff",
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
            priceFormat: {
                type: "price",
                precision: 0,
                minMove: 1,
            },
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