import { PropsWithChildren } from "react";

export default function PageCard({children}: PropsWithChildren) {
  return <div className="sm:rounded-5 p-4 sm:p-5 border-y sm:border border-primary-border bg-primary-bg">
    {children}
  </div>;
}
