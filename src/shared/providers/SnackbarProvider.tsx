import React, { useContext, useState, createContext, useEffect } from "react";
import Snackbar from "../../components/molecules/Snackbar";

interface SnackbarContextInterface {
  showMessage: (message: string, severity?: "success" | "error" | "info" | "warning", duration?: number) => void
}

const SnackbarContext = createContext<SnackbarContextInterface | null>(null);

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(4000);
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("success"); /** error | warning | info */

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const showMessage = (message, severity: "success" | "error" | "info" | "warning" = "success", duration = 4000) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
    setOpen(true);
  };

  useEffect(
    () => {
      const t = setTimeout(
        () => {
          setOpen(false);
        },
        duration
      );

      return () => {
        clearTimeout(t);
      };
    },


    [open, duration]
  );

  return <SnackbarContext.Provider value={{
    showMessage
  }}>
    {children}
    {open && <Snackbar message={message} severity={severity} handleClose={handleClose} />}
  </SnackbarContext.Provider>;
};

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};
