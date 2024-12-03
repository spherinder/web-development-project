import { FC, PropsWithChildren, useContext } from "react";
import {ThemeContext} from "../App";


export const Card: FC<PropsWithChildren> = ({ children }) => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <div
      className={`w-full h-full rounded-md relative p-8 border-2 ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-neutral-200"
      }`}
    >
      {children}
    </div>
  );
};
