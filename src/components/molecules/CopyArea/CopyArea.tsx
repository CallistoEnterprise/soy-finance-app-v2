import React, { useEffect, useRef } from "react";
import styles from "./CopyArea.module.scss";
import Svg from "../../atoms/Svg/Svg";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {copyToClipboard} from "../../../processes/web3/ui/ChangeWalletContent/ChangeWalletContent";
import clsx from "clsx";
import IconButton from "../../atoms/IconButton";

const ellipse = (txtNode) => {
  const scrollWidth = txtNode.scrollWidth;
  const actualWidth = txtNode.clientWidth;
  const threeDotsWidth = 15;

  if (scrollWidth - threeDotsWidth > actualWidth) {
    const str = txtNode.textContent;
    const txtChars = str.length;
    const avgLetterSize = scrollWidth / txtChars;

    const lettersToDelete = (scrollWidth - actualWidth + threeDotsWidth) / avgLetterSize;

    txtNode.textContent = str.slice(
      0,
      -(4 + lettersToDelete)
    ) + "..." + str.slice(-4);
  }
  txtNode.style.opacity = "1";
};

export default function CopyArea({ text, view = "default", size = "regular" }) {
  const { showMessage } = useSnackbar();
  const ref = useRef(null);
  const textRef = useRef(null);

  useEffect(
    () => {
      const cropText = () => {
        console.log("Cropping");
        ellipse(textRef.current);
      };

      window.addEventListener(
        "resize",
        cropText
      );

      cropText();

      return () => {
        window.removeEventListener(
          "resize",
          cropText
        );
      };
    },
    [text]
  );

  const handleClick = async () => {
    await copyToClipboard(text);
    showMessage("Successfully copied!");
  };

  return <div ref={ref} className={clsx(
    styles.copyContainer,
    styles[size],
    styles[view]
  )}>
    <div ref={textRef} className={styles.text}>{text}</div>
    <IconButton onClick={handleClick} className={styles.copyButton}>
      <Svg iconName="copy" />
    </IconButton>
  </div>;
};
