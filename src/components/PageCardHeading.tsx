import React from "react";

interface Props {
  title: string
}
export default function PageCardHeading({title}: Props) {
  return <h2 className="text-24 font-bold">{title}</h2>
}
