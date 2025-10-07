"use client";

import { useState, useEffect } from "react";
import { useStockTab } from "@/contexts/stockTabContext";
import StockDrawer from "./StockDrawer";
import MenuTab from "@/components/tab/MenuTab";

const stockList: Stock[] = [
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 30,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "카카오",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "000000",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "삼성전자",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 2,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "현대자동차",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 3,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "SK하이닉스",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 4,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 5,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    area: "KOSPI",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
];

const ownStockList = [
  {
    name: "NAVER",
    image:
      "https://play-lh.googleusercontent.com/gJZYXTPS_9AJYJfzRj1tT8IRMQ7rerhhlYmXSVyt8bV_gouL3kW46d_zY6VLnreyMA",
    owned: 33,
    code: "035420",
    currentPrice: 269000, //업다운에따라 ui달라짐
    increase: 500,
    percent: 2.51,
  },
];

//팁에 해당하는 api를 호출해서 StockList에 넣고 계속 보여주기

interface Stock {
  name: string;
  image: string;
  area?: string;
  owned?: number;
  code: string;
  currentPrice: number;
  increase: number;
  percent: number;
}

export default function StockListContainer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<null | Stock>(null);
  const { stockTab, setStockTab } = useStockTab();

  const uptabs = [
    { id: "MY", label: "보유주식" },
    { id: "DOMESTIC", label: "국내주식" },
    { id: "OVERSEAS", label: "해외주식" },
  ];

  //주식 코드만 넘겨주는 것도 생각해보기
  return (
    <MenuTab tabs={uptabs} defaultTab="MY">
      <ul>
        {stockList.map((stock, idx) => (
          <li
            key={`${stock.code}-${idx}`}
            className="flex justify-between p-5 border-b-[1px]"
            role="button"
            onClick={() => {
              setOpen(true);
              setSelected(stock);
            }}
          >
            <div className="flex items-center gap-[15px]">
              <img
                src={stock.image}
                alt="stock"
                className="h-[35px] w-[35px] rounded-full object-cover"
              />
              <div className="">
                <div className="font-bold">{stock.name}</div>
                <div className="flex gap-[7px] text-[#686868] text-[12px]">
                  {stockTab == "MY" ? (
                    <div>{stock.owned}주</div>
                  ) : (
                    <div>{stock.area}</div>
                  )}
                  <div>{stock.code}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold">
                {stock.currentPrice.toLocaleString()}원
              </div>
              <div className="flex gap-[5px]">
                <div className="text-[12px]">
                  {Math.abs(stock.increase).toLocaleString()}
                </div>
                <div className="text-[12px]">({stock.percent}%)</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <StockDrawer
        open={open}
        onOpenChange={setOpen}
        stockCode={selected?.code}
      ></StockDrawer>
    </MenuTab>
  );
}
