import { RecentTransactionStatus, useRecentTransactionsStore } from "@/stores/useRecentTransactions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import addToast from "@/other/toast";

export function useRecentTransactionTracking() {
  const {
    transactions,
    updateTransactionStatus,
    setIsViewed
  } = useRecentTransactionsStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const notified = useRef<string[]>([]);

  const transactionsForAddress = useMemo(() => {
    if(!address) {
      return [];
    }
    return transactions[address] || []
  }, [address, transactions]);

  const isUnViewedTransactions = useMemo(() => {
    if(!address) {
      return { isUnViewed: false };
    }

    const _transactionsForAddress = transactions[address];
    if (_transactionsForAddress) {
      const unViewed = _transactionsForAddress.filter((t) => {
        return !t.isViewed;
      });

      const pending = unViewed.filter((t) => {
        return t.status === RecentTransactionStatus.PENDING;
      });

      const failed = unViewed.filter((t) => {
        return t.status === RecentTransactionStatus.ERROR;
      });

      const success  = unViewed.filter((t) => {
        return t.status === RecentTransactionStatus.SUCCESS;
      });

      return {
        isUnViewed: Boolean(unViewed.length),
        pending,
        failed,
        success,
        totalUnViewed: unViewed.length
      };
    }

    return { isUnViewed: false };
  }, [address, transactions]);


  const waitForTransaction = useCallback(async (hash: `0x${string}`, account: string, title: string) => {
    const transaction = await publicClient.waitForTransactionReceipt(
      { hash }
    );
    if (transaction.status === "success") {
      updateTransactionStatus(hash, RecentTransactionStatus.SUCCESS, account);
      if(!notified.current.includes(hash)) {
        addToast(`Success: ${title}`);
        notified.current = [...notified.current, hash];
      }
    }

    if (transaction.status === "reverted") {
      updateTransactionStatus(hash, RecentTransactionStatus.ERROR, account);
      if(!notified.current.includes(hash)) {
        addToast(`Reverted: ${title}`, "error", {
          duration: Infinity
        });
        notified.current = [...notified.current, hash];
      }

    }

    setIsViewed(hash, account, false);
  }, [publicClient, setIsViewed, updateTransactionStatus])

  useEffect(() => {
    for (const transaction of transactionsForAddress) {
      if (transaction.status === RecentTransactionStatus.PENDING) {
        waitForTransaction(transaction.hash, transaction.account, transaction.title);
      }
    }
  }, [transactionsForAddress, waitForTransaction]);

  return isUnViewedTransactions;
}
