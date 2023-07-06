import React from "react";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import Drawer from "../Drawer/Drawer";
import Dialog from "../../molecules/Dialog";

export default function DrawerDialog({
 isOpen,
 children,
 onClose,
}) {
  const isMobile = useMediaQuery("(max-width: 600px)");

  return <>{isMobile
    ? <Drawer isOpen={isOpen} onClose={onClose} position="bottom">{children}</Drawer>
    : <Dialog isOpen={isOpen} onClose={onClose}>{children}</Dialog>}</>;
}
