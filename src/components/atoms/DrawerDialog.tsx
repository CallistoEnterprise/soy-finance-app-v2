import React, { PropsWithChildren } from "react";
import { useMediaQuery } from "react-responsive";
import Drawer from "@/components/atoms/Drawer";
import Dialog from "@/components/atoms/Dialog";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}
export default function DrawerDialog({
                                       isOpen,
                                       children,
                                       setIsOpen,
                                     }: PropsWithChildren<Props>) {
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  return <>{isMobile
    ? <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>{children}</Drawer>
    : <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>{children}</Dialog>}</>;
}
