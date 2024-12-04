import { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {ThemeContext, StockContext} from "../App";
import { register } from "../api";
import { Header } from "./Header";
import { useQuery } from "@tanstack/react-query";
import { Trade } from "./Trade";


export const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

    // console.log("login show", show);

  // TODO: use react query
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("register", username, email, password);
    try {
      await register(username, email, password);
    } catch (err) {
      console.log("login failed")
      alert("Login failed! Please double-check you username and password")
      return
    }
    navigate("/login");
  };

    return (
      <div className="form-container">
        <div className="login-form">
          <h3 style={{fontSize: "30px"}}>Register your account</h3>
          <form  action="">

            <label htmlFor="first">
              Username:
            </label>
            <input type="text" id="first" name="first"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Username" required/>

            <label htmlFor="second">
              Email:
            </label>
            <input type="text" id="second" name="second"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email" required/>

            <label htmlFor="password">
              Password:
            </label>
            <input type="password" id="password" name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password" required/>

            <button type="submit" className="submit-button"
              onClick={handleSubmit}>
              Register
            </button>

          </form>

          <p>Already registered?
            <a href="/login">
              Login
            </a>
          </p>
        </div>
      </div>
    )
}
