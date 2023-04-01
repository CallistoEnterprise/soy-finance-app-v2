import React, {useState} from "react";
import IconButton from "../../../../shared/components/IconButton";
import Svg from "../../../../shared/components/Svg/Svg";
import dynamic from "next/dynamic";

const DynamicLanguageDialog = dynamic(() => import("../LanguageDialog"), {
  ssr: false
});

export default function SwitchLanguage() {
  const [langOpened, setLangOpened] = useState(false);

  return <>
    <IconButton onClick={() => {
      setLangOpened(true);
    }}>
      <Svg iconName="earth" />
    </IconButton>
    {langOpened && <DynamicLanguageDialog
      langOpened={langOpened}
      setLangOpened={setLangOpened}
    />}
  </>;
}
