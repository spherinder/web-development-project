// import logo from './logo.svg';
import './App.css';
// import { useQuery } from '@tanstack/react-query';
// import { fetchHelloWorld } from './api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { Dashboard } from "./components/Dashboard";
import { Login } from './components/Login';
import { Register } from './components/Register';

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

type Market = {
  id: number,
  name: string,
  desc: string,
  created_at: string,
  yes_liquidity: number,
  no_liquidity: number,
  modified: string,
}

const initMarket = {
  market: null as Market|null,
  setMarketId: (() => {throw new Error("wont happen")}) as Dispatch<SetStateAction<Market|null>>
}
export const MarketContext = createContext(initMarket);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [apiToken, setApiToken] = useState(null);
  const [market, setMarketId] = useState<Market|null>(null);

  return (
    <AuthContext.Provider value={{ apiToken, setApiToken }}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode}}>
        <MarketContext.Provider value={{ market, setMarketId }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </BrowserRouter>
        </MarketContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
