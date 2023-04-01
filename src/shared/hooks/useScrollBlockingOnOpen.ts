import { useEffect } from "react";
import { useScrollBlock } from "./useScrollBlock";

export function useScrollBlockingOnOpen(isOpen: boolean | null) {
  const [blockScroll, allowScroll] = useScrollBlock();

  useEffect(
    () => {
      const updatePageScroll = () => {
        if (isOpen) {
          blockScroll();
        } else {
          allowScroll();
        }
      };

      updatePageScroll();
    },
    [allowScroll, blockScroll, isOpen]
  );
}
