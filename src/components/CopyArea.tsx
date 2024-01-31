import { useEffect, useRef } from "react";
import { copyToClipboard } from "@/other/copyToClipboard";
import clsx from "clsx";
import ActionIconButton from "@/components/buttons/ActionIconButton";
import addToast from "@/other/toast";

const ellipse = (txtNode: HTMLDivElement | null) => {
  const scrollWidth = txtNode?.scrollWidth;
  const actualWidth = txtNode?.clientWidth;
  const threeDotsWidth = 15;

  if (scrollWidth && actualWidth && scrollWidth - threeDotsWidth > actualWidth) {
    const str = txtNode.textContent;

    if(str) {
      const txtChars = str.length;
      const avgLetterSize = scrollWidth / txtChars;

      const lettersToDelete = (scrollWidth - actualWidth + threeDotsWidth) / avgLetterSize;

      txtNode.textContent = str.slice(
        0,
        -(4 + lettersToDelete)
      ) + "..." + str.slice(-4);
    }
  }

  if(txtNode) {
    txtNode.style.opacity = "1";
  }
};
export default function CopyArea({text}: {text: string}) {
  const ref = useRef(null);
  const textRef = useRef(null);

  useEffect(
    () => {
      const cropText = () => {
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
    addToast("Successfully copied!");
  };

  return <div ref={ref} className={clsx(
    "w-full py-[17px] pr-[60px] pl-5 rounded-2 relative h-[60px] whitespace-nowrap bg-secondary-bg text-primary-text"
  )}>
    <div ref={textRef} className="text-primary-text text-16 opacity-0">{text}</div>
    <span className="absolute w-10 h-10 top-1/2 -translate-y-1/2 right-2">
      <ActionIconButton onClick={handleClick} icon="copy" />
    </span>

  </div>
}
