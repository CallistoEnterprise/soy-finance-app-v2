import {useCallback} from "react";
import {useEvent} from "effector-react";
import {addRecentTransaction, editTransactionStatus} from "../models";
import {useSnackbar} from "../providers/SnackbarProvider";

export function useReceipt() {
  const addRecentTransactionFn = useEvent(addRecentTransaction);
  const editTransactionStatusFn = useEvent(editTransactionStatus);
  const {showMessage} = useSnackbar();

  const wait = useCallback(async ({tx, chainId, summary}) => {
    try {
      addRecentTransactionFn({chainId, hash: tx.hash, summary});
      await tx.wait();
      showMessage(`Success: ${summary}`);
      editTransactionStatusFn({chainId, status: "succeed", hash: tx.hash});
    } catch (e) {
      showMessage(`Error: ${summary}`, "error");
      editTransactionStatusFn({chainId, status: "error", hash: tx.hash});
      console.log(e);
    }
  }, [addRecentTransactionFn, editTransactionStatusFn, showMessage]);

  return {
    wait
  }
}
