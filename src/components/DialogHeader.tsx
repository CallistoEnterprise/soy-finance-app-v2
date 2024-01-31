import clsx from "clsx";
import CloseIconButton from "@/components/buttons/CloseIconButton";
import Svg from "@/components/atoms/Svg";

interface Props {
  title: string,
  handleClose: any,
  variant?: "dialog" | "dropdown"
  onBack?: () => void
}
export default function DialogHeader({title, handleClose, variant = "dialog", onBack}: Props) {
  return <div className={clsx(
    "flex justify-between items-center py-3 pr-2 xl:pr-3 border-b border-primary-border",
    variant === "dialog" && "pl-4 xl:pl-10",
    variant === "dropdown" && "pl-5"
  )}>
    {onBack && <button onClick={onBack}>
      <Svg iconName="back" />
    </button>}
    <h3 className="text-24 font-bold">{title}</h3>
    <CloseIconButton handleClose={handleClose} />
  </div>
}
