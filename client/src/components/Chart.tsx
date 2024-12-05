import { MouseEventHandler, useContext, useState } from "react";
import { AuthContext, MarketContext, ThemeContext } from "../App";
import { Card } from "./Card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartSpan, LiquidityHistory } from "../model";
import {curveCardinal} from "d3-shape"
import { useQuery } from "@tanstack/react-query";
import { dollarsPerYes, fetchLiquidityHistory } from "../api";

const convertUnixTimestampToDate = (unixTimestamp: number): string => {
  const milliseconds = unixTimestamp * 1000;
  return new Date(milliseconds).toLocaleDateString();
};

const convertDateToUnixTimestamp = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

const chartConfig: Record<ChartSpan,{resolution: string,days:number,weeks:number,months:number,years:number}> = {
  "1D": { resolution: "1", days: 1, weeks: 0, months: 0, years: 0 },
  "1W": { resolution: "15", days: 0, weeks: 1, months: 0, years: 0 },
  "1M": { resolution: "60", days: 0, weeks: 0, months: 1, years: 0 },
  "1Y": { resolution: "D", days: 0, weeks: 0, months: 0, years: 1 },
};

type ChartFilterProps = {
  text: string,
  active: boolean,
  onClick: MouseEventHandler<HTMLButtonElement>
}

const ChartFilter = ({ text, active, onClick }: ChartFilterProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-12 m-2 h-8 border-1 rounded-md flex items-center justify-center cursor-pointer ${
        active
          ? "bg-indigo-600 border-indigo-700 text-gray-100"
          : "border-indigo-300 text-indigo-300"
      } transition duration-200 hover:bg-indigo-600 hover:text-gray-100 hover:border-indigo-700`}
    >
      {text}
    </button>
  );
};


const getDateRange = (filter: ChartSpan) => {
  const { days, weeks, months, years } = chartConfig[filter];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + days + 7 * weeks);
  startDate.setMonth(startDate.getMonth() + months);
  startDate.setFullYear(startDate.getFullYear() + years);

  const startTimestampUnix = convertDateToUnixTimestamp(startDate);
  const endTimestampUnix = convertDateToUnixTimestamp(endDate);
  return { startTimestampUnix, endTimestampUnix };
};


const formatData = (data: LiquidityHistory) => {
  return data.map(({yes_liquidity: y, no_liquidity: n, timestamp}) => {
    const price = dollarsPerYes(y,n);
      return {
        "¥ price": price.toFixed(2),
        "₦ price": (1-price).toFixed(2),
        date: timestamp,
        // date: convertUnixTimestampToDate(data.t[index]),
      };
  });
};

export const Chart = () => {
  const [filter, setFilter] = useState<ChartSpan>("1W");

  const { darkMode } = useContext(ThemeContext);

  const { market } = useContext(MarketContext);


  const {status, error: _, data} = useQuery({
    queryKey: ["historicalData", market?.id],
    queryFn: () => {
      return fetchLiquidityHistory(market?.id ?? 1); // FIXME
    }
  })
  const yesColors = darkMode ? {
    stroke: "#ffeeff",
    tooltipText: "#b18ee1",
    areaStop: "#91aef1",
  } : {
    stroke: "#312e81",
    tooltipText: "#312e81",
    areaStop: "#c7d2fe",
  }

  const noColors = darkMode ? {
    stroke: "#f1ea9e",
    tooltipText:  "#e1ca8e",
    areaStop: "#81592e",
  } : {
    stroke: "#81592e",
    tooltipText: "#81592e",
    areaStop: "#f1dabe",
  }

  return (
    <Card>
      <ul className="flex absolute top-2 right-2 z-40">
        {(Object.keys(chartConfig) as Array<ChartSpan>).map(item => (
          <li key={item}>
            <ChartFilter
              text={item}
              active={filter === item}
              onClick={() => {
                setFilter(item);
              }}
            />
          </li>
        ))}
      </ul>
      <ResponsiveContainer>
        <AreaChart data={status === "success" ? formatData(data) : []}>
          <defs>
            <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={yesColors.areaStop}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={yesColors.areaStop}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="chartColor2" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={noColors.areaStop}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={noColors.areaStop}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={darkMode ? { backgroundColor: "#111827" } : undefined}
          />
          <Area
            type={curveCardinal.tension(0.6)}
            dataKey="¥ price"
            stroke={yesColors.stroke}
            fill="url(#chartColor)"
            fillOpacity={1}
            strokeWidth={0.5}
          />
          <Area
            type={curveCardinal.tension(0.6)}
            dataKey="₦ price"
            stroke={noColors.stroke}
            fill="url(#chartColor2)"
            fillOpacity={1}
            strokeWidth={0.5}
          />
          <XAxis dataKey="date"/>
          <YAxis domain={[0, 1]}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
