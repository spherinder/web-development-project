import { FC, PropsWithChildren, useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {ThemeContext} from "../App";
import { register } from "../api";
import { Header } from "./Header";
import { useMutation } from "@tanstack/react-query";
import { Trade } from "./Trade";


export const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (_ => register(username, email,password)),
    onSuccess: (_ => navigate("/login")),
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("register", username, email, password);
    mutation.mutate()
  };

  if (mutation.status === "pending") {
    return <h1>Loading...</h1>
  }

  if (mutation.status === "error") {
    return <h1>An error occured.  Please try again.</h1>
  }
  
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
