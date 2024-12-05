import { LiquidityHistory } from "./model";

export const serverUrl = "http://localhost:4000";

export const fetchLiquidityHistory = async (
  marketId: number
): Promise<LiquidityHistory> => {

  const response = await fetch(`${serverUrl}/market/${marketId}/history`)
  const json = await response.json()

  if (!response.ok) {
    throw new Error(`Error when buying shares: ${response.status}`);
  }
  return json.data
}

/**
 * Say we want to purchase "yes" tokens:
 * y * n = k
 * x dollars → x "yes", x "no"
 * (y-δ) * (n+x) = y * n
 * δ(x) = y - y*n / (n+x) = y*x / (n+x)
 *
 * Price p(x) ≔ (x + δ(x)) "yes" / x dollars
 *
 * limₓ→₀ p(x)
 * = 1 + δ(x)/x
 * = 1 + y/(n+x)
 * = 1 + y/n
 */
export const yesPerDollar = (y: number, n: number) => {
  return 1 + y/n
}

export const dollarsPerYes = (y: number, n: number) => {
  return n/(y+n)
}

// export const fetchStockDetails = async (stockSymbol: string): Promise<StockDetails> => {
//   const basePath = "https://finnhub.io/api/v1";
//   const url = `${basePath}/stock/profile2?symbol=${stockSymbol}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
//   console.log("stock details url ", url)
//   const response = await fetch(url);

//   if (!response.ok) {
//     const message = `An error has occured: ${response.status}`;
//     throw new Error(message);
//   }

//   return await response.json();
// };

export type SymbolSearch = {
  count: number,
  result: Array<{
    description: string,
    displaySymbol: string,
    symbol: string,
    type: string
  }>
}
// export const searchSymbol = async (query: string): Promise<SymbolSearch> => {
//   const basePath = "https://finnhub.io/api/v1";
//   const url = `${basePath}/search?q=${query}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
//   const response = await fetch(url);

//   if (!response.ok) {
//     const message = `An error has occured: ${response.status}`;
//     throw new Error(message);
//   }

//   return (await response.json()).result;
// };


// export const fetchQuote = async (stockSymbol: string): Promise<Quote> => {
//   const basePath = "https://finnhub.io/api/v1";
//   const url = `${basePath}/quote?symbol=${stockSymbol}&token=ct3iiihr01qrd05j40jgct3iiihr01qrd05j40k0`;
//   console.log("fetchquote url: ", url)
//   const response = await fetch(url);

//   if (!response.ok) {
//     const message = `An error has occured: ${response.status}`;
//     throw new Error(message);
//   }

//   return await response.json();
// };

export type transactionType = "buy" | "sell"
export type tokenType = "yes" | "no"

export const doTransaction = async (
  kind: transactionType,
  tokenType: tokenType,
  amount: number,
  apiToken: string,
  marketId: number
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
  const url = `${serverUrl}/auth/register`;
  console.log("registering");

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: 'include',

    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })

  if (!response.ok) {
    throw new Error(`Error when registering in: ${response.status}`);
  }
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
