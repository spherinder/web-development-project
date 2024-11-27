// import logo from './logo.svg';
import './App.css';
// import { useQuery } from '@tanstack/react-query';
// import { fetchHelloWorld } from './api';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { Dashboard } from "./components/Dashboard";

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

const App = () => {
  // const {status, data, error} = useQuery({queryKey: ["helloWorld"], queryFn: fetchHelloWorld})

  const [darkMode, setDarkMode] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("AAPL");
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode}}>
      <StockContext.Provider value={{ stockSymbol, setStockSymbol }}>
        <Dashboard />
      </StockContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
