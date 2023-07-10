import {EthersError} from "ethers";
import {useSnackbar} from "../../../shared/providers/SnackbarProvider";
import {useCallback} from "react";

const errorMessages = {
  UNKNOWN_ERROR: "Error: Unknown error, please contact support",
  NOT_IMPLEMENTED: "",
  UNSUPPORTED_OPERATION: "",
  NETWORK_ERROR: "",
  SERVER_ERROR: "",
  TIMEOUT: "",
  BAD_DATA: "Error: Provided set of data cannot be correctly interpretted",
  CANCELLED: "",
  BUFFER_OVERRUN: "",
  NUMERIC_FAULT: "",
  INVALID_ARGUMENT: "",
  MISSING_ARGUMENT: "",
  UNEXPECTED_ARGUMENT: "",
  VALUE_MISMATCH: "",
  CALL_EXCEPTION: "",
  INSUFFICIENT_FUNDS: "",
  NONCE_EXPIRED: "",
  REPLACEMENT_UNDERPRICED: "",
  TRANSACTION_REPLACED: "",
  UNCONFIGURED_NAME: "",
  OFFCHAIN_FAULT: "",
  ACTION_REJECTED: "Error: Request was rejected by the user"
}

export function useEthersError() {
  const {showMessage} = useSnackbar();

  const handleError = useCallback((e: EthersError) => {
    if(errorMessages[e.code]) {
      showMessage(errorMessages[e.code], "error");
      console.log("ETHERS ERROR");
      console.log("Info: ", e.info);
      console.log("Code: ", e.code);
      console.log("Cause: ", e.cause);
      console.log("Stack: ", e.stack);
    } else {
      showMessage(errorMessages.UNKNOWN_ERROR, "error");
      console.log("ETHERS ERROR");
      console.log("Info: ", e.info);
      console.log("Code: ", e.code);
      console.log("Cause: ", e.cause);
      console.log("Stack: ", e.stack);
    }
  }, [showMessage]);

  return {handleError};
}
