export type UserBalance = {
  id: number,
  user_id: number,
  market_id: number,
  yes_balance: number,
  no_balance: number,
  dog_balance: number,
  timestamp: string
};

export type User = {
  id: number,
  email: string,
  username: string
}

export type StockDetails = {
  country: string,
  currency: string,
  estimateCurrency: string,
  exchange: string,
  finnhubIndustry: string,
  ipo: string,
  logo: URL,
  marketCapitalization: number,
  name: string,
  phone: string,
  shareOutstanding: number,
  ticker: string,
  weburl: URL,
}

export type ChartSpan = "1Y" | "1M" | "1W" | "1D" | "1H"

export type LiquidityHistory = Array<{
    yes_liquidity: number
    no_liquidity: number
    timestamp: string
}>


export type MarketInfo = {
  id: number,
  name: string,
  description: string,
  created_at: string,
  yes_liquidity: number,
  no_liquidity: number,
  modified: string,
  resolved: boolean,
}
