import { useEffect } from "react";

export function useCloseWithEscape(isOpen: boolean | null, onClose: any) {
  useEffect(
    () => {
      const onKeyPress = (e: any) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        window.addEventListener(
          "keyup",
          onKeyPress
        );
      }

      return () => {
        window.removeEventListener(
          "keyup",
          onKeyPress
        );
      };
    },
    [isOpen, onClose]
  );
}
