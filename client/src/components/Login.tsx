import { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {ThemeContext, AuthContext} from "../App";
import { login } from "../api";
import { useMutation } from "@tanstack/react-query";


export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const mutation = useMutation({
    mutationFn: (_ => login(username, password)),
    onSuccess: ((apiToken, _variables, _context) => {
      setApiToken(apiToken);
      console.log(apiToken);
      navigate("/")}),
  });

  const { setApiToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(username, password);
    mutation.mutate()
  };

  if (mutation.status === "pending") {
    return <h1>Loading...</h1>
  }

  if (mutation.status === "error") {
    return <h1>Login unsuccessful.  Please double-check your details.</h1>
  }

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
