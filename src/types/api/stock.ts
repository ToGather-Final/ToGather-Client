export interface Stock {
  stockId: string;
  stockCode: string; //=code
  stockName: string; //=name
  stockImage: string; //=image
  country: string; //=area
  currentPrice: number; //=currentPrice
  changeAmount: number; //=increase
  changeRate: number; //=percent
  enabled: boolean;
  prdtTypeCd: string; //=prdtTypeCd
}
//   stockId: string;
//   area?: string; //krx //   "country": "KR",
//   owned?: number;
//   enabled: boolean

export interface SimpleChartData {
  time: string; //time
  open: number;
  high: number;
  low: number;
  close: number;
  trading_volume: number; //trading_volume
}

export interface StockChartData {
  time: string; //time
  open: number;
  high: number;
  low: number;
  close: number;
  ma_5: number;
  ma_10: number;
  ma_20: number;
  ma_60: number;
  trading_volume: number; //trading_volume
}

export interface ChartProps {
  dayData: StockChartData[];
  weekData: StockChartData[];
  monthData: StockChartData[];
  yearData: StockChartData[];
}

export interface StockDetail {
  stockId: string;
  stockCode: string; //code
  stockName: string; //name
  market: string; //area
  currentPrice: number;
  changeAmount: number; //increase
  changeRate: number; //percent
  changeDirection: "up" | "down";
  volume: number; //trading_volume
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  prevClosePrice: number;
  marketCap: number | null;
  chartData: SimpleChartData[] | StockChartData[];
  resistanceLine: number;
  supportLine: number;
}
