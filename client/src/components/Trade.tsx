import { Dispatch, SetStateAction, createContext, PropsWithChildren, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { ThemeContext, AuthContext, MarketContext } from "../App";
import { Card } from "./Card";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, transactionType, tokenType, doTransaction, dollarsPerYes, fetchMarketInfo, cashout, serverUrl } from "../api";
import { capitalize } from "../utils";
import { buttonClass, buttonClassNoBg } from "./tailwindClassNames";

const initTransactionType = {
  transactionType: "buy" as transactionType,
  setTransactionType: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<transactionType>>,
}

export const TransactionContext = createContext(initTransactionType);

export const Trade = () => {
  const {market} = useContext(MarketContext)
  const [tradeAmount, setTradeAmount] = useState(0);
  const [tokenType, setTokenType] = useState<tokenType>("yes");
  const [transactionType, setTransactionType] = useState<transactionType>("buy");
  const { status, data }= useQuery({
    queryKey: ["resolved"],
    queryFn: () =>fetchMarketInfo(market?.id ?? 1)
  })

  if (data?.resolved) {
    return (
      <div style={{
        fontSize: "22px",
        display: "flex",
        flexDirection: "column",
      }}>
        <center>
          Market has been resolved
        </center>
        <Cashout/>
      </div>
    )
  }

  const updateSelectedButton = (newButton: tokenType) => {
    setTokenType(_ =>  newButton);
  }

  const updateAmount = (type: updateType) => {
    if (type === "add") {
      setTradeAmount(tradeAmount + 1);
    } else if (type === "subtract" && tradeAmount > 0) {
      setTradeAmount(tradeAmount - 1);
    }
  }

  return (
    <Card>
      <TransactionContext.Provider value={{ transactionType, setTransactionType }}>
      <div style={{
        fontSize: "22px",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly",
        // flexGrow: 1,
        // flexShrink: 0,
        // flexWrap: "nowrap",

      }}>
        <Header/>
        <Buttons getSelectedButton={() => tokenType} updateSelectedButton={updateSelectedButton}/>
        <Amount tradeAmount={tradeAmount} setTradeAmount={setTradeAmount} updateAmount={updateAmount}/>
        <Execute tokenType={tokenType} tradeAmount={tradeAmount}/>
      </div>
      </TransactionContext.Provider>
    </Card>
  )
}

const Header = () => {

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-evenly",
    }}>
      <HeaderButton type="buy"/>
      <HeaderButton type="sell"/>
    </div>
  )
}

const HeaderButton = ({type}: {type: transactionType}) => {
  const { transactionType, setTransactionType } = useContext(TransactionContext);

  return (
      <button onClick={() => setTransactionType(type)}
        style={{
          color: transactionType === type ? "#2D9CDB" : "#000000"
        }}>
        {capitalize(type)}
      </button>
  )
}

type updateType = "add" | "subtract"

const Buttons = ({getSelectedButton, updateSelectedButton}: {
  getSelectedButton: Function,
  updateSelectedButton: Function
}) => {
  return (
    <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}>
          Outcome
      <div className="trade-buttons" style={{
        display: "flex",
        justifyContent: "space-evenly",
      }}>

        <Button type="yes" selectedButton={() => getSelectedButton()}
              onClick={(newButton: tokenType) => updateSelectedButton(newButton)}/>
        <Button type="no" selectedButton={() => getSelectedButton()}
              onClick={(newButton: tokenType) => updateSelectedButton(newButton)}/>
          </div>
        </div>

  )
}
const Button = ({type, selectedButton, onClick}: {
  type: tokenType,
  selectedButton: Function,
  onClick: Function
}) => {
  const {market} = useContext(MarketContext)
  const { transactionType } = useContext(TransactionContext);
  const {status, error: _, data} = useQuery({
    queryKey: ["marketInfo", market?.id],
    queryFn: () => {
      return fetchMarketInfo(market?.id ?? 1); // FIXME
    }
  })
  if (status !== "success") {
    return <>Loading..</> // TODO
  }

  const yesPrice = dollarsPerYes(data.yes_liquidity, data.no_liquidity)
  const price = type === "yes" ? yesPrice : 1-yesPrice
  const currentSelected = type === selectedButton();
  const buttonColor = type === "yes" ? "#27AE60" : "#E64800";
  return (
    <button className={buttonClassNoBg} onClick={() => onClick(type)}
      style={{
        backgroundColor: currentSelected ? buttonColor : "gray",
      }}>
      {capitalize(transactionType)} {type} for Ð{price.toFixed(2)}
    </button>
  )
}

const Amount = ({tradeAmount, setTradeAmount, updateAmount}: {tradeAmount: number, setTradeAmount: Function, updateAmount: Function}) => {
  const { transactionType } = useContext(TransactionContext);

  const amountButtonStyle = {
    padding: "8px",
    width: "28px",
    height: "28px",
    backgroundColor: "#b3b3b3",
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    const value = event.target.value;
    // Can be prefixed with Ð
    if (!Number.isNaN(Number(value))) {
      setTradeAmount(Number(value));
    } else if (!Number.isNaN(Number(value.slice(1)))) {
      setTradeAmount(Number(value.slice(1)));
    } else {
      console.log("bad format, must be number");
    }
  };

  return (
    <div style={{
      // padding: "10px",
      display: "flex",
      flexDirection: "column",

    }}>
      {transactionType === "buy" ? "Amount" : "Shares"}
      <div className="amount" style={{
        display: "flex",
        justifyContent: "space-evenly"
    }}>

      <button aria-hidden="true" className="amount-button"
        onClick={() => updateAmount("subtract")}
        style={amountButtonStyle}>
        <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.166672 0.166664H11.8333V1.83333H0.166672V0.166664Z" fill="#666666">
          </path>
        </svg>
      </button>

      <input type="text" inputMode="decimal"
        placeholder="Ð0" className="amount-input"
        onChange={handleAmountChange}
        value={`${transactionType === "buy" ? "Ð" : ""}${tradeAmount}`}
        style={{
          borderColor: "black",
          textAlign: "center",
        }}/>

      <button aria-hidden="true" className="amount-button"
        onClick={() => updateAmount("add")}
      style={amountButtonStyle}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.8333 5.16666H6.83333V0.166664H5.16667V5.16666H0.166668V6.83333H5.16667V11.8333H6.83333V6.83333H11.8333V5.16666Z" fill="#666666">
          </path>
        </svg>
      </button>
      </div>
    </div>
  )
}

const Execute = ({tokenType, tradeAmount}: {tokenType: tokenType, tradeAmount: number}) => {
  const { apiToken } = useContext(AuthContext);
  const { transactionType } = useContext(TransactionContext);
  const { market } = useContext(MarketContext);

  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (() => executeTransaction(
      transactionType, tokenType, tradeAmount, apiToken!, market?.id ?? 1 // FIXME
    )),
    onSuccess: (_ => {
      console.log("transaction successful");
      queryClient.invalidateQueries({ queryKey: ["liquidityHistory", market?.id ?? 1] });
      queryClient.invalidateQueries({ queryKey: ["marketInfo"] });
    })
  });

  useEffect(() => {
    const evtSource = new EventSource(`${serverUrl}/market/listen/${market?.id ?? 1}`);
    evtSource.onmessage = (event) => {
      if (event.data) {
        console.log(event.data);
        queryClient.invalidateQueries({ queryKey: ["liquidityHistory", market?.id ?? 1] });
        queryClient.invalidateQueries({ queryKey: ["marketInfo"] });
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate()
  }

  if (apiToken) {
    return (
      <center>
        <button className={buttonClass} onClick={handleSubmit}>
          Execute Transaction
        </button>
      </center>
    )
  }
  return (
    <center>
      <button className="auth-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </center>
  )
}

const executeTransaction = async (
  kind: transactionType,
  type: tokenType,
  amount: number,
  apiToken: string,
  marketId: number,
) => {
  console.log("executing transaction")
  if (amount === 0) {
    alert("You have specified an amount of 0")
  }
  return await doTransaction(kind, type, amount, apiToken, marketId);

}

const Cashout = () => {
  const { apiToken } = useContext(AuthContext);
  const { market } = useContext(MarketContext);

  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (() => cashout( apiToken!, market?.id ?? 1 // FIXME
    )),
    onSuccess: (_ => {
      console.log("cashout successful");
      queryClient.invalidateQueries({ queryKey: ["liquidityHistory", market?.id ?? 1] });
      queryClient.invalidateQueries({ queryKey: ["marketInfo"] });
    })
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate()
  }

   if (apiToken) {
    return (
      <center>
        <button className="resolve-button" onClick={handleSubmit}>

          Cashout tokens
        </button>
      </center>
    )
  }
  return (
    <center>
      <button className="auth-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </center>
  )

}
