"use client";

import { useState } from "react";
import Container from "@/components/atoms/Container";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import * as React from "react";
import addToast from "@/other/toast";

export default function Lib() {
  const [isCheckboxChecked, setCheckboxChecked] = useState(true);
  const [isSwitchChecked, setSwitchChecked] = useState(true);

  // const {addToast} = useToastsContext();

  return <Container>
    <div className="flex gap-2.5">
      <PrimaryButton onClick={() => {
        addToast("Me awesome toast");
      }}>Add success</PrimaryButton>
      <PrimaryButton onClick={() => {
        addToast("Me awesome toast info", "info", {
          duration: Infinity
        });
      }}>Add info</PrimaryButton>
      <PrimaryButton onClick={() => {
        addToast("Me awesome toast warning", "warning");
      }}>Add warning</PrimaryButton>
      <PrimaryButton onClick={() => {
        addToast("Me awesome toast error", "error");
      }}>Add error</PrimaryButton>
    </div>
  </Container>
}
