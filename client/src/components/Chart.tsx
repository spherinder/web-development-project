import { MouseEventHandler, useContext, useState } from "react";
import { MarketContext, ThemeContext } from "../App";
import { Card } from "./Card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartSpan, LiquidityHistory } from "../model";
import { curveMonotoneX } from "d3-shape"
import { useQuery } from "@tanstack/react-query";
import { dollarsPerYes, fetchLiquidityHistory } from "../api";

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

const find = <T,>(arr: T[], pred: (_: T) => boolean): number => {
  for (let i=0;i<arr.length;i++) {
    if (pred(arr[i])) {
      return i
    }
  }
  return arr.length;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const ms_per_period: Record<ChartSpan, number> = {
  "1H": 60 * 60 * 1000,
  "1D": MS_PER_DAY,
  "1W": 7 * MS_PER_DAY,
  "1M": 30 * MS_PER_DAY,
  "1Y": 365 * MS_PER_DAY,
}

const formatUnixMilli = (ms:number) => new Date(ms).toLocaleString(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const narrowPriceHistory = (data: LiquidityHistory, span: ChartSpan) => {
  return data.slice(find(data, ({timestamp}) =>
    new Date(timestamp).getTime() >= Date.now() - ms_per_period[span]
  )).map(({yes_liquidity: y, no_liquidity: n, timestamp}) => {
      const price = dollarsPerYes(y,n);
      return {
        "¥ price": price.toFixed(2),
        "₦ price": (1-price).toFixed(2),
        date: new Date(timestamp).getTime(),
      };
  })
};

export const Chart = () => {
  const [span, setSpan] = useState<ChartSpan>("1W");
  const { darkMode } = useContext(ThemeContext);
  const { market } = useContext(MarketContext);

  const {status, error: _, data} = useQuery({
    queryKey: ["liquidityHistory", market?.id ?? 1], // FIXME
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
        {(Object.keys(ms_per_period) as Array<ChartSpan>).map(item => (
          <li key={item}>
            <ChartFilter
              text={item}
              active={span === item}
              onClick={() => {
                setSpan(item);
              }}
            />
          </li>
        ))}
      </ul>
      <ResponsiveContainer>
        <AreaChart data={status === "success" ? narrowPriceHistory(data, span) : []}>
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
            type={curveMonotoneX}
            dataKey="¥ price"
            stroke={yesColors.stroke}
            fill="url(#chartColor)"
            fillOpacity={1}
            strokeWidth={0.5}
          />
          <Area
            type={curveMonotoneX}
            dataKey="₦ price"
            stroke={noColors.stroke}
            fill="url(#chartColor2)"
            fillOpacity={1}
            strokeWidth={0.5}
          />
          <XAxis dataKey="date"
            domain={[Date.now() - ms_per_period[span], Date.now()]}
            type="number"
            tickFormatter={formatUnixMilli}
          />
          <YAxis domain={[0, 1]}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
