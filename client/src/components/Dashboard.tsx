import { useContext } from "react";
import { MarketContext, ThemeContext } from "../App";
import { Chart } from "./Chart";
import { Header } from "./Header";
import { Trade } from "./Trade";
import { Card } from "./Card";

type OverviewProps = {
  marketName: string,
  price: number,
  change: number,
  changePercent: number,
  currency: string
}

const Overview = ({ marketName, price, change, changePercent, currency }: OverviewProps) => {
  return (
    <Card>
      <span className="absolute left-4 top-4 text-primary-400 text-lg xl:text-xl 2xl:text-2xl">
        Market: {marketName}
      </span>
      <div className="w-full h-full flex items-center justify-around">
        <span className="text-2xl xl:text-4xl 2xl:text-5xl flex items-center">
          ${price}
          <span className="text-lg xl:text-xl 2xl:text-2xl text-neutral-400 m-2">
            {currency}
          </span>
        </span>
        <span
          className={`text-lg xl:text-xl 2xl:text-2xl ${change > 0 ? "text-lime-500" : "text-red-500"
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
  const { market } = useContext(MarketContext)

  return (
    <div
      className={`h-screen grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-rows-8 md:grid-rows-7 xl:grid-rows-5 auto-rows-fr gap-6 p-10 font-quicksand ${darkMode ? "bg-gray-900 text-gray-300" : "bg-neutral-100"
        }`}
    >
      <div className="col-span-1 md:col-span-2 xl:col-span-3 row-span-1 flex justify-start items-center">
        {/*<Header name={stockDetails?.name ?? ""} />*/}
        <Header name={""} />
      </div>
      <div className="md:col-span-2 row-span-4">
        <Chart />
      </div>
      <div>
        {/*<Overview
          symbol={stockSymbol}
          price={quote?.pc ?? 0}
          change={quote?.d ?? 0}
          changePercent={quote?.dp ?? 0}
          currency={stockDetails?.currency ?? ""}
        />*/}
        <Overview
          marketName={market?.name ?? "sus"}
          price={0}
          change={0}
          changePercent={0}
          currency={""}
        />
      </div>
      <div className="row-span-2 xl:row-span-3">
        <Trade />
        { /* // <Details details={detailStatus === "success" ? stockDetails : null} /> */}
      </div>
    </div>
  );
};
