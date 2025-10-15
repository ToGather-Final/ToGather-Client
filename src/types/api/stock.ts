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
}
//   stockId: string;
//   area?: string; //krx //   "country": "KR",
//   owned?: number;
//   enabled: boolean

export interface SimpleChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDetail {
  stockId: string;
  stockCode: string;
  stockName: string;
  market: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  changeDirection: "up" | "down";
  volume: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  prevClosePrice: number;
  marketCap: number | null;
  chartData: SimpleChartData[];
  resistanceLine: number;
  supportLine: number;
}
