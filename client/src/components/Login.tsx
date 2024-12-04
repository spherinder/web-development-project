import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {ThemeContext, StockContext, AuthContext} from "../App";
import { login } from "../api";
import { Header } from "./Header";
import { Quote, StockDetails } from "../model";
import { useQuery } from "@tanstack/react-query";
import { Trade } from "./Trade";


export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { setApiToken } = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log("login show", show);

  // TODO: use react query
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(username, password);
    try {
      const apiToken = await login(username, password);
      setApiToken(apiToken);
      console.log(apiToken);
    } catch (err) {
      console.log("login failed")
      alert("Login failed! Please double-check you username and password")
      return
    }
    navigate("/");
  };
    
  return (
    <div className="form-container">
      <div className="login-form">
        <h3 style={{fontSize: "30px"}}>Enter your login credentials</h3>
        <form  action="">
          <label htmlFor="first">
            Username:
          </label>
          <input type="text" id="first" name="first"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Username" required/>

          <label htmlFor="password">
            Password:
          </label>
          <input type="password" id="password" name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password" required/>

          <button type="submit" className="submit-button"
            onClick={handleSubmit}>
            Submit
          </button>
        </form>

        <p>Not registered?   
          <a href="/register">
            Create an account
          </a>
        </p>
      </div>
    </div>
  )
}
