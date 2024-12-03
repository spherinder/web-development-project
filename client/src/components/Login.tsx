import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import {ThemeContext, StockContext} from "../App";
import { login } from "../api";
import { Header } from "./Header";
import { Quote, StockDetails } from "../model";
import { useQuery } from "@tanstack/react-query";
import { Trade } from "./Trade";


export const Login = ({ show, onClose }: {show: boolean, onClose: Function}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  console.log("login show", show);

  // TODO: use react query
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(username, password);
    try {
      await login(username, password);
    } catch (err) {
      console.log("login failed")
      alert("Login failed! Please double-check you username and password")
      return
    }
    onClose(); // Close the popup after successful submission
  };

  if (!show) {
    return null;
  }
  
  return (
    <div className="login-form" style={{
      position: "fixed",
      zIndex: 1,
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      overflow: "auto",
      // backgroundColor: "rgb(0,0,0)",
      backgroundColor: "rgba(0,0,0,0.4)",
      paddingTop: "60px",
      // position: "absolute",
      // display: "flex",
      // flexDirection: "column",
      // justifyContent: "center",
      // alignItems: "center",
      // textAlign: "center",
      // minHeight: "100vh",
      // left: "100px",
      // top: "100px",
      // backgroundColor: "white",
    }}>
      


      <div className="popup"

        style={{
          position: "absolute",
          zIndex: "inherit",
          backgroundColor: "#fefefe",
          margin: "5% auto 15% auto", /* 5% from the top, 15% from the bottom and centered */
          border: "1px solid #888",
          width: "40%",
          height: "60%",
          padding: "50px",
        }}>
        <h3 style={{fontSize: "30px"}}>Enter your login credentials</h3>

        <form  action=""
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "10px",
            // alignItems: "start",
            // alignContent: "start",
            // gridTemplateColumns: "[label] 1fr [control] auto",
            // gridAutoFlow: "row",
            // gridGap: "10px",
          }}>
          <label htmlFor="first"
            style={{
              // gridArea: "label",
              // gridRow: "auto",
            }}>
          Username:
        </label>
        <input type="text" id="first" name="first"
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your Username" required
          style={{
            // gridArea: "input",
            // gridRow: "auto",
            // padding: "10px",

          }}/>

        <label htmlFor="password">
          Password:
        </label>
        <input type="password" id="password" name="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Password" required/>

          <div className="wrap">
            <button type="submit" onClick={handleSubmit}
              style={{
                width: "250px",
                height: "30px",
                textAlign: "center",
                backgroundColor: "#2D9CDB",
              }}>
              Submit
            </button>
          </div>
        </form>
        
      <p>Not registered?
        <a href="#" style={{
          textDecoration: "none",
        }}>
          Create an account
        </a>
      </p>
    </div>
    </div>
  )
}
