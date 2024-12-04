// import logo from './logo.svg';
import './App.css';
// import { useQuery } from '@tanstack/react-query';
// import { fetchHelloWorld } from './api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { Dashboard } from "./components/Dashboard";
import { Login } from './components/Login';
import { Register } from './components/Register';

const initStock = {
  stockSymbol: "AAPL",
  setStockSymbol: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<string>>
}

export const StockContext = createContext(initStock);

const initTheme = {
  darkMode: false,
  setDarkMode: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<boolean>>
}

export const ThemeContext = createContext(initTheme);

const initAuth = {
  apiToken: null,
  setApiToken: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<any>>,
}
export const AuthContext = createContext(initAuth);

const initMarket = {
  marketId: "",
  setMarketId: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<string>>
}
export const MarketContext = createContext(initMarket);

const App = () => {
  // const {status, data, error} = useQuery({queryKey: ["helloWorld"], queryFn: fetchHelloWorld})

  const [darkMode, setDarkMode] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("AAPL");
  const [apiToken, setApiToken] = useState(null);
  const [marketId, setMarketId] = useState("");

  return (
    <AuthContext.Provider value={{ apiToken, setApiToken }}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode}}>
        <StockContext.Provider value={{ stockSymbol, setStockSymbol }}>
          <MarketContext.Provider value={{ marketId, setMarketId }}>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          </Routes>
            </BrowserRouter>
            </MarketContext.Provider>
            </StockContext.Provider>
            </ThemeContext.Provider>
            </AuthContext.Provider>
  );
}

export default App;
