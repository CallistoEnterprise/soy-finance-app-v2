import React from "react";
import {useColorMode} from "../../../shared/providers/ThemeProvider";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";

export default function SwitchTheme() {
  const { toggleTheme, mode } = useColorMode();

  return <IconButton variant="menu" onClick={toggleTheme}>
    {mode === "dark"
      ? <Svg iconName="sun" />
      : <Svg iconName="night" />}
  </IconButton>;
}
