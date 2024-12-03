import { Quote, StockData, StockDetails } from "./model";

export const serverUrl = "http://localhost:4000";

export const fetchHelloWorld = () => {
  return fetch("http://localhost:5000")
    .then(res => res.json())
    .then(r => {console.log(r); return r})
}

export const fetchHistoricalData = async (): Promise<StockData> => {
  const mock = {
    "c": [30.45, 45.12, 57.89, 52.34, 50.45, 52.89, ],
    "h": [],
    "l": [],
    "o": [],
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

export type transactionType = "buy" | "sell"
export type tokenType = "yes" | "no"

export const doTransaction = async (
  kind: transactionType,
  tokenType: tokenType,
  amount: number,
  apiToken: string,
  marketId: string
) => {
  const url = `${serverUrl}/${marketId}/tx`;
  console.log("buying shares in market ", marketId);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      kind: `${kind}[${tokenType}]`,
      dollars: amount
    }),
    headers: {
      "x-api-key": apiToken,
      "Content-type": "application/json; charset=UTF-8"
    }
  })

  if (!response.ok) {
    throw new Error(`Error when buying shares: ${response.status}`);
  }

}

export const register = async (username: string, email: string, password: string) => {

}

export const login = async (username: string, password: string) => {
  const url = `${serverUrl}/auth/login`;
  console.log("logging in");

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: 'include',

    body: JSON.stringify({
      username: username,
      password: password,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })

  if (!response.ok) {
    throw new Error(`Error when logging in: ${response.status}`);
  }

  const data = await response.json();
  if (data) {
    const apiToken = data["data"]["api_key"];
    return apiToken
  }


}
