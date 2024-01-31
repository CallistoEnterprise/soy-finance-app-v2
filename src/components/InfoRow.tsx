import React, { ReactNode } from "react";

interface Props {
  label: ReactNode | string,
  value: ReactNode | string
}
export default function InfoRow({ label, value }: Props) {
  return <div className="text-12 xl:text-14 leading-[18px] flex justify-between items-center text-secondary-text">
    <span>{label}</span>
    <span className="text-primary-text">{value}</span>
  </div>
}
