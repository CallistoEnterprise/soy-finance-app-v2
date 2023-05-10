import React, {useState} from "react";
import IconButton from "../../atoms/IconButton";
import Svg from "../../atoms/Svg/Svg";
import dynamic from "next/dynamic";

const DynamicLanguageDialog = dynamic(() => import("../../../pages/swap/components/LanguageDialog"), {
  ssr: false
});

export default function SwitchLanguage() {
  const [langOpened, setLangOpened] = useState(false);

  return <>
    <IconButton variant="menu" onClick={() => {
      setLangOpened(true);
    }}>
      <Svg iconName="web3" />
    </IconButton>
    <DynamicLanguageDialog
      langOpened={langOpened}
      setLangOpened={setLangOpened}
    />
  </>;
}
