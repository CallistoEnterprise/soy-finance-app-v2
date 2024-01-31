import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole, useTransitionStyles
} from "@floating-ui/react";
import { PropsWithChildren, useId } from "react";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}
export default function Dialog({isOpen, setIsOpen, children}: PropsWithChildren<Props>) {

  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  });

  const {isMounted, styles: transitionStyles} = useTransitionStyles(context, {
    duration: {
      open: 200,
      close: 200
    },
  });

  const click = useClick(context);
  const role = useRole(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
    outsidePress: (event: MouseEvent) => {
      if(!event.target) {
        return true;
      }

      return (event.target as HTMLDivElement).classList.contains("Dialog-overlay");
    }
  });

  const { getFloatingProps } = useInteractions([
    click,
    role,
    dismiss
  ]);

  const headingId = useId();
  const descriptionId = useId();

  return (
    <>
      <FloatingPortal>
        {isMounted && (
          <FloatingOverlay className="Dialog-overlay" style={{...transitionStyles}} lockScroll>
            <FloatingFocusManager context={context}>
              <div
                className="bg-primary-bg border-primary-border border rounded-5"
                ref={refs.setFloating}
                aria-labelledby={headingId}
                aria-describedby={descriptionId}
                {...getFloatingProps()}
              >
                {children}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
}
