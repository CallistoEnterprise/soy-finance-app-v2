import * as React from "react";
import { fork, serialize, Scope } from "effector";

let clientScope: Scope;

const initializeScope = (initialData: Record<string, unknown>) => {
  let scope = fork({
    values: {
      ...(clientScope
        ? serialize(clientScope)
        : {}),
      ...initialData,
    },
  });

  if (typeof document !== "undefined") {
    clientScope = scope;
  }

  return scope;
};

export const useScope = (initialData = {}) => React.useMemo(
  () => initializeScope(initialData),
  [initialData]
);

export const getClientScope = (): Scope | undefined => clientScope;
