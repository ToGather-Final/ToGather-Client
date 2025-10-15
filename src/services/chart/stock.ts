import { baseUrl } from "@/constants/baseUrl";
import { Stock, StockDetail } from "@/types/api/stock";
import { Response } from "@/types/api/response";

// export const getStockList = async () => {
//   const res = await fetch(`${baseUrl}/trading/stocks`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch stockList");
//   }

//   const data: Stock[] = await res.json();
//   return data;
// };

export const getStockList = (url: string): Promise<Response<Stock[]>> =>
  fetch(url).then((res) => res.json());

export const getStockDetail = (url: string): Promise<Response<StockDetail>> =>
  fetch(url).then((res) => res.json());
