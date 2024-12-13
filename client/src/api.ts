import { LiquidityHistory, MarketInfo, User } from "./model";

export const serverUrl = process.env.NODE_ENV === "production" ? `https://be.${window.location.hostname}` : "http://localhost:4000";

export const fetchUserData = async (apiToken: string): Promise<User> => {
  const response = await fetch(`${serverUrl}/user/`, {
    headers: {
      "x-api-key": apiToken,
    }
  });
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`Error when fetching currently logged in user: ${response.status}`);
  }
  return json.data
}

export const fetchLiquidityHistory = async (
  marketId: number
): Promise<LiquidityHistory> => {

  const response = await fetch(`${serverUrl}/market/${marketId}/history`)
  const json = await response.json()

  if (!response.ok) {
    throw new Error(`Error when fetching liquidity history: ${response.status}`);
  }
  return json.data
}

export const fetchMarketInfo = async (
  marketId: number
): Promise<MarketInfo> => {

  const response = await fetch(`${serverUrl}/market/${marketId}`)
  const json = await response.json()

  if (!response.ok) {
    throw new Error(`Error when fetching market info: ${response.status}`);
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
  return 1 + y / n
}

export const dollarsPerYes = (y: number, n: number) => {
  return n / (y + n)
}

export type SymbolSearch = {
  count: number,
  result: Array<{
    description: string,
    displaySymbol: string,
    symbol: string,
    type: string
  }>
}

export type transactionType = "buy" | "sell"
export type tokenType = "yes" | "no"

export const doTransaction = async (
  kind: transactionType,
  tokenType: tokenType,
  amount: number,
  apiToken: string,
  marketId: number
) => {
  const url = `${serverUrl}/market/${marketId}/tx`;
  console.log(`${kind}ing ${tokenType} in market `, marketId);

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: 'include',
    body: JSON.stringify({
      kind: `${kind}[${tokenType}]`,
      amount: amount
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

export const cashout = async (apiToken: string, marketId: number) => {
  const url = `${serverUrl}/market/${marketId}/cashout`;
  console.log("cashing out");

  const response = await fetch(url, {
    mode: "cors",
    credentials: 'include',

    method: "POST",
    headers: {
      "x-api-key": apiToken,
      "Content-type": "application/json; charset=UTF-8"
    }
  })

  if (!response.ok) {
    throw new Error(`Error when logging in: ${response.status}`);
  }

  return await response.json();
}
