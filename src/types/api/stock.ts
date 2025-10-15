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
  time: string; //time
  open: number;
  high: number;
  low: number;
  close: number;
  trading_volume: number; //trading_volume
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
  chartData: SimpleChartData[];
  resistanceLine: number;
  supportLine: number;
}
