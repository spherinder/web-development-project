// import logo from './logo.svg';
import './App.css';
// import { useQuery } from '@tanstack/react-query';
// import { fetchHelloWorld } from './api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import { Dashboard } from "./components/Dashboard";
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserOverview } from './components/UserOverview';
import { Header } from './components/Header';

const initTheme = {
  darkMode: false,
  setDarkMode: (() => { throw new Error("wont happen") }) as Dispatch<SetStateAction<boolean>>
}

export const ThemeContext = createContext(initTheme);

const initAuth = {
  apiToken: null as string | null,
  setApiToken: (() => { throw new Error("wont happen") }) as Dispatch<SetStateAction<string | null>>,
}
export const AuthContext = createContext(initAuth);

type Market = {
  id: number,
  name: string,
  description: string,
  // created_at: string,
}

const initMarket = {
  market: null as Market | null,
  setMarket: (() => { throw new Error("wont happen") }) as Dispatch<SetStateAction<Market | null>>
}
export const MarketContext = createContext(initMarket);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [market, setMarket] = useState<Market | null>({
    id: 1,
    name: "Default",
    description: "this is market",
    // created_at: new Date().toISOString(),
  });

  const oldApiToken = localStorage.getItem("api-token");
  if (oldApiToken != apiToken) {
    setApiToken(oldApiToken)
  }

  return (
    <AuthContext.Provider value={{ apiToken, setApiToken }}>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <MarketContext.Provider value={{ market, setMarket }}>
          <BrowserRouter>
            <div
              className={`h-screen ${darkMode ? "bg-gray-900 text-gray-300" : "bg-neutral-100"
                }`}
            >
              <div className="p-4 col-span-1 md:col-span-2 xl:col-span-3 row-span-1 flex justify-start items-center">
                {/*<Header name={stockDetails?.name ?? ""} />*/}
                <Header name={""} />
              </div>
              <div className="md:p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-rows-8 md:grid-rows-7 xl:grid-rows-5 auto-rows-fr gap-6 font-quicksand">
                <div className="col-span-12">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/user" element={<UserOverview />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </div>

              </div>
            </div>
          </BrowserRouter>
        </MarketContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
