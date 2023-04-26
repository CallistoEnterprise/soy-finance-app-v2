import React, { createContext, useContext, useState } from "react";

type ColorModeType = "light" | "dark";

interface ThemeContextInterface {
  toggleTheme: () => void,
  mode: ColorModeType
}

const ThemeContext = createContext<ThemeContextInterface | null>(null);

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState<ColorModeType>(document.body.dataset.colorTheme as ColorModeType);

  function toggleTheme() {
    const newMode = mode === "light"
      ? "dark"
      : "light";
    setMode(newMode);
    document.body.dataset.colorTheme = newMode;
    localStorage.setItem(
      "color-theme",
      newMode
    );
  }


  return <ThemeContext.Provider value={{
    toggleTheme,
    mode
  }}>
    <div style={{ minHeight: "100vh" }} data-theme={mode}>
      {children}
    </div>
  </ThemeContext.Provider>;
};

export default ThemeProvider;

export const useColorMode = () => {
  return useContext(ThemeContext);
};
