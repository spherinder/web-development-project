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

export type Quote = {
  c: number,
  d: number,
  dp: number,
  h: number,
  l: number,
  o: number,
  pc: number,
  t: number
}

export type ChartSpan = "1Y" | "1M" | "1W" | "1D"

export type StockData = {
  "c": Array<number>,
  "h": Array<number>,
  "l": Array<number>,
  "o": Array<number>,
  "s": string,
  "t": Array<number>,
  "v": Array<number>
}
