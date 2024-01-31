import { PropsWithChildren } from "react";

export default function Container({children}: PropsWithChildren) {
  return <div className="max-w-[1448px] my-0 mx-auto w-full sm:px-6">
    {children}
  </div>
}
