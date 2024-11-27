import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import {ThemeContext, StockContext} from "../App";
import { Chart } from "./Chart";
import { fetchQuote, fetchStockDetails } from "../api";
import { Header } from "./Header";
import { Quote, StockDetails } from "../model";
import { useQuery } from "@tanstack/react-query";

type DetailsList = {
  name: string,
  country: string,
  currency: string,
  exchange: string,
  ipo: string,
  marketCapitalization: string,
  finnhubIndustry: string,
}

const Details = ({ details }: {details: StockDetails | null}) => {
  const { darkMode } = useContext(ThemeContext);

  const detailsList: DetailsList = {
    name: "Name",
    country: "Country",
    currency: "Currency",
    exchange: "Exchange",
    ipo: "IPO Date",
    marketCapitalization: "Market Capitalization",
    finnhubIndustry: "Industry",
  };

  const convertMillionToBillion = (number: number) => {
    return (number / 1000).toFixed(2);
  };

  return (
    <Card>
      <ul
        className={`w-full h-full flex flex-col justify-between divide-y-1 ${
          darkMode ? "divide-gray-800" : null
        }`}
      >
        {details ? (Object.keys(detailsList) as Array<keyof DetailsList>).map(item => {
          return (
            <li key={item} className="flex-1 flex justify-between items-center">
              <span>{detailsList[item]}</span>
              <span className="font-bold">
                {item === "marketCapitalization" && details
                  ? `${convertMillionToBillion(details[item])}B`
                  : details[item]}
              </span>
            </li>
          );
        }) : (<></>)}
      </ul>
    </Card>
  );
};

export const Card: FC<PropsWithChildren> = ({ children }) => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <div
      className={`w-full h-full rounded-md relative p-8 border-2 ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-neutral-200"
      }`}
    >
      {children}
    </div>
  );
};

type OverviewProps = {
  symbol: string,
  price: number,
  change: number,
  changePercent: number,
  currency: string
}

const Overview = ({ symbol, price, change, changePercent, currency }: OverviewProps) => {
  return (
    <Card>
      <span className="absolute left-4 top-4 text-neutral-400 text-lg xl:text-xl 2xl:text-2xl">
        {symbol}
      </span>
      <div className="w-full h-full flex items-center justify-around">
        <span className="text-2xl xl:text-4xl 2xl:text-5xl flex items-center">
          ${price}
          <span className="text-lg xl:text-xl 2xl:text-2xl text-neutral-400 m-2">
            {currency}
          </span>
        </span>
        <span
          className={`text-lg xl:text-xl 2xl:text-2xl ${
            change > 0 ? "text-lime-500" : "text-red-500"
          }`}
        >
          {change} <span>({changePercent}%)</span>
        </span>
      </div>
    </Card>
  );
};

export const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);

  const { stockSymbol } = useContext(StockContext);

  const {status: detailStatus, data: stockDetails} = useQuery({
    queryKey: ["stockDetails", stockSymbol],
    queryFn: () => fetchStockDetails(stockSymbol)
  })

  const {data: quote} = useQuery({
    queryKey: ["fetchQuote", stockSymbol],
    queryFn: () => fetchQuote(stockSymbol)
  })

  return (
    <div
      className={`h-screen grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-rows-8 md:grid-rows-7 xl:grid-rows-5 auto-rows-fr gap-6 p-10 font-quicksand ${
        darkMode ? "bg-gray-900 text-gray-300" : "bg-neutral-100"
      }`}
    >
      <div className="col-span-1 md:col-span-2 xl:col-span-3 row-span-1 flex justify-start items-center">
        <Header name={stockDetails?.name ?? ""} />
      </div>
      <div className="md:col-span-2 row-span-4">
        <Chart />
      </div>
      <div>
        <Overview
          symbol={stockSymbol}
          price={quote?.pc ?? 0}
          change={quote?.d ?? 0}
          changePercent={quote?.dp ?? 0}
          currency={stockDetails?.currency ?? ""}
        />
      </div>
      <div className="row-span-2 xl:row-span-3">
        <Details details={detailStatus === "success" ? stockDetails : null} />
      </div>
    </div>
  );
};
