import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { StockContext, ThemeContext } from "../App";
import { Card } from "./Card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchHistoricalData } from "../api";
import { ChartSpan, StockData } from "../model";
import {curveCardinal} from "d3-shape"
import { useQuery } from "@tanstack/react-query";

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

export const Chart = () => {
  const [filter, setFilter] = useState<ChartSpan>("1W");

  const { darkMode } = useContext(ThemeContext);

  const { stockSymbol } = useContext(StockContext);

  const formatData = (data: StockData) => {
    return data.c.map((item, index) => {
      return {
        value: item.toFixed(2),
        date: convertUnixTimestampToDate(data.t[index]),
      };
    });
  };

  const {status, error, data} = useQuery({
    queryKey: ["historicalData", stockSymbol, filter],
    queryFn: () => {
      const { startTimestampUnix, endTimestampUnix } = getDateRange(filter);
      const resolution = chartConfig[filter].resolution;
      return fetchHistoricalData(
        stockSymbol,
        resolution,
        startTimestampUnix,
        endTimestampUnix
      );
    }
  })

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
                stopColor={darkMode ? "#312e81" : "rgb(199 210 254)"}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={darkMode ? "#312e81" : "rgb(199 210 254)"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={darkMode ? { backgroundColor: "#111827" } : undefined}
            itemStyle={darkMode ? { color: "#818cf8" } : undefined}
          />
          <Area
            type={curveCardinal.tension(0.6)}
            dataKey="value"
            // stroke="#312e81"
            stroke={darkMode ? "#b18ee1" : "#312e81"}
            fill="url(#chartColor)"
            fillOpacity={1}
            strokeWidth={0.5}
          />
          <XAxis dataKey="date" />
          <YAxis domain={["dataMin", "dataMax"]} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
