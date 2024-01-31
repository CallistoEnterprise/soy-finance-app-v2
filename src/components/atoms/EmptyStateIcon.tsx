import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

interface Props {
  iconName: IconName
}

export default function EmptyStateIcon({iconName}: Props) {
  return <div className="flex items-center justify-center rounded-5 w-[120px] h-[120px] text-green bg-global dark:bg-empty-state">
    <Svg iconName={iconName} size={84} />
  </div>
}
