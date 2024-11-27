import { Quote, StockData, StockDetails } from "./model";

export const fetchHelloWorld = () => {
  return fetch("http://localhost:5000")
    .then(res => res.json())
    .then(r => {console.log(r); return r})
}

export const fetchHistoricalData = async (
  stockSymbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<StockData> => {
  const mock = {
    "c": [350.45, 355.12, 357.89, 352.34, 350.45, 352.89, ],
    "h": [351.50, 356.20, 360.00, 353.70, 351.50, 350.00, ],
    "l": [348.90, 353.80, 356.00, 350.50, 348.90, 366.00, ],
    "o": [349.50, 354.00, 357.00, 351.00, 349.50, 357.00, ],
    "s": "ok",
    "t": [1732112516, 1732213416, 1732314316, 1732415216, 1732517216, 1732618216],
    "v": [1204534, 1325678, 1402345, 1256789, 1256889, 1258000]
  }
  const response = {
    ok: true,
    status: 200,
    json: () => Promise.resolve(mock),
  }

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};

export const fetchStockDetails = async (stockSymbol: string): Promise<StockDetails> => {
  const basePath = "https://finnhub.io/api/v1";
  const url = `${basePath}/stock/profile2?symbol=${stockSymbol}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
  console.log("stock details url ", url)
  const response = await fetch(url);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};

export type SymbolSearch = {
  count: number,
  result: Array<{
    description: string,
    displaySymbol: string,
    symbol: string,
    type: string
  }>
}
export const searchSymbol = async (query: string): Promise<SymbolSearch> => {
  const basePath = "https://finnhub.io/api/v1";
  const url = `${basePath}/search?q=${query}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
  const response = await fetch(url);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()).result;
};


export const fetchQuote = async (stockSymbol: string): Promise<Quote> => {
  const basePath = "https://finnhub.io/api/v1";
  const url = `${basePath}/quote?symbol=${stockSymbol}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
  console.log("fetchquote url: ", url)
  const response = await fetch(url);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};
