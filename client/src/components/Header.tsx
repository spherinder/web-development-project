import { useContext, useState } from "react";
import { AuthContext, ThemeContext } from "../App";
import { SymbolSearch } from "../api";
import {MagnifyingGlassIcon, MoonIcon, XMarkIcon} from "@heroicons/react/16/solid"
import { useNavigate } from 'react-router-dom';
import { capitalize } from "../utils";

const SearchResults = ({ result }: {result:SymbolSearch["result"]}) => {
  const { darkMode } = useContext(ThemeContext);

  // const { setStockSymbol } = useContext(StockContext);

  return (
    <ul
      className={`absolute top-12 border-2 w-full rounded-md h-64 overflow-y-scroll ${
        darkMode
          ? "bg-gray-900 border-gray-800 custom-scrollbar custom-scrollbar-dark"
          : "bg-white border-neutral-200 custom-scrollbar"
      }`}
    >
      {result.map((item) => {
        return (
          <li
            key={item.symbol}
            className={`cursor-pointer p-4 m-2 flex items-center justify-between rounded-md ${
              darkMode ? "hover:bg-indigo-600" : "hover:bg-indigo-200 "
            } transition duration-300`}
            // onClick={() => setStockSymbol(item.symbol)}
          >
            <span>{item.symbol}</span>
            <span>{item.description}</span>
          </li>
        );
      })}
    </ul>
  );
};

const Search = () => {
  const { darkMode } = useContext(ThemeContext);

  const [input, setInput] = useState("");

  const [bestMatches, setBestMatches] = useState<SymbolSearch["result"]>([]);

  const updateBestMatches = async () => {
    try {
      if (input) {
        // const searchResults = await searchSymbol(input);
        // const result = searchResults.result;
        // setBestMatches(result);
      }
    } catch (error) {
      setBestMatches([]);
      console.log(error);
    }
  };

  const clear = () => {
    setInput("");
    setBestMatches([]);
  };

  return (
    <div
      className={`flex items-center my-4 border-2 rounded-md relative z-50 w-96 ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-neutral-200"
      }`}
    >
      <input
        type="text"
        value={input}
        className={`w-full px-4 py-2 focus:outline-none rounded-md ${
          darkMode ? "bg-gray-900" : null
        }`}
        placeholder="Search markets..."
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            updateBestMatches();
          }
        }}
      />
      {input && (
        <button onClick={clear} className="m-1">
          <XMarkIcon className="h-4 w-4 fill-gray-500" />
        </button>
      )}
      <button
        onClick={updateBestMatches}
        className="h-8 w-8 bg-indigo-600 rounded-md flex justify-center items-center m-1 p-2 transition duration-300 hover:ring-2 ring-indigo-400"
      >
        <MagnifyingGlassIcon className="h-4 w-4 fill-gray-100" />
      </button>
      {input && bestMatches.length > 0 ? (
        <SearchResults result={bestMatches} />
      ) : null}
    </div>
  );
};

const ThemeIcon = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`rounded-lg border-1 border-neutral-400 p-2 absolute right-8 xl:right-32 shadow-lg transition duration-300 hover:scale-125 ${
        darkMode ? "shadow-gray-800" : null
      }`}
    >
        <MoonIcon
          className={`h-8 w-8 cursor-pointer stroke-1 ${
            darkMode
              ? "fill-yellow-400 stroke-yellow-400"
              : "fill-none stroke-neutral-400"
          }`}
        />
    </button>
  );
};

type AuthAction = "login" | "register"

const AuthButton = ({action} : {action: AuthAction}) => {
  const navigate = useNavigate();
  return (
  <button onClick={() => navigate(`/${action}`)}
    style={{
      width: "100px",
      height: "40px",
      textAlign: "center",
      backgroundColor: "#2D9CDB",
      margin: "10px",
    }}>
    {capitalize(action)}
  </button>
  )
}

const LogOutButton = () => {
  const {setApiToken} = useContext(AuthContext)

  const handleClick = () => {
    localStorage.removeItem("api-token")
    setApiToken(null)
  }

  return (
    <button className="auth-button" onClick={handleClick}
      style={{ width: "100px", margin: "10px" }}>
      Log out
    </button>

  )
}

export const Header = ({ name }:{name:string}) => {
  const {apiToken} = useContext(AuthContext)

  return (
    <>
      <div className="xl:px-32">
        <h1 className="text-5xl">{name}</h1>
        <Search />
      </div>

      <div style={{display: "flex", justifyContent: "flex-end"}}
            /* TODO: Better placement */>
        {apiToken === null ? (
          <>
          <AuthButton action="register"/>
          <AuthButton action="login"/>
          </>
        ) : <>
              <LogOutButton/>
            </>}
        <ThemeIcon />
      </div>
    </>
  );
};
