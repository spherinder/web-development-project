import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import {ThemeContext, StockContext} from "../App";
import { Card } from "./Card";
import { useQuery } from "@tanstack/react-query";

export const Trade = () => {
  const [tradeAmount, setTradeAmount] = useState(0);
  const [selectedButton, setSelectedButton] = useState<buttonType>("yes");

  const updateSelectedButton = (newButton: buttonType) => {
    setSelectedButton(_ =>  newButton);
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
        <Buttons getSelectedButton={() => selectedButton} updateSelectedButton={updateSelectedButton}/>
        <Amount getAmount={() => tradeAmount} updateAmount={updateAmount}/>
        <Execute buttonType={selectedButton} tradeAmount={tradeAmount}/>
      </div>
    </Card>
  )

}

type buttonType = "yes" | "no"
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
              onClick={(newButton: buttonType) => updateSelectedButton(newButton)}/>
        <Button type="no" selectedButton={() => getSelectedButton()}
              onClick={(newButton: buttonType) => updateSelectedButton(newButton)}/>
          </div>
        </div>

  )
}
const Button = ({type, selectedButton, onClick}: {
  type: buttonType,
  selectedButton: Function,
  onClick: Function
}) => {
  const price = 0;
  const currentSelected = type === selectedButton();
  const buttonColor = type === "yes" ? "#27AE60" : "#E64800";

  return (
    <button className="trade-button" onClick={() => onClick(type)}
      style={{
        backgroundColor: currentSelected ? buttonColor : "gray",
        width: "200px",
        height: "50px",

      }}>
      Buy {type} for Ð{price}
    </button>
  )
}

const Amount = ({getAmount, updateAmount}: {getAmount: Function, updateAmount: Function}) => {
  const amountButtonStyle = {
    padding: "8px",
    width: "28px",
    height: "28px",
    backgroundColor: "#b3b3b3",
  };
  
  return (

    <div style={{
      // padding: "10px",
      display: "flex",
      flexDirection: "column",
      
    }}>
  Amount
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

      <input inputMode="decimal" pattern="[0-9]*"
        placeholder="0Ð" className="amount-input" value={`Ð${getAmount()}`}
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

const Execute = ({buttonType, tradeAmount}: {buttonType: buttonType, tradeAmount: number}) => {
  return (
    <center>
      <button onClick={() => executeTransaction(buttonType, tradeAmount)}
        style={{
        width: "250px",
        height: "50px",
        textAlign: "center",
        backgroundColor: "#2D9CDB",

      }}>
        Execute Transaction
      </button>
    </center>
  )
}



const executeTransaction = (type: buttonType, amount: number) => {
  console.log("executing transaction")
  if (amount === 0) {
    alert("You have specified an amount of 0")
  }
}
