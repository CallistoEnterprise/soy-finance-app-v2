import clsx from "clsx";

interface Props {
  checked: boolean,
  setChecked: any,
  small?: boolean,
  disabled?: boolean
}

export default function Switch({ checked, setChecked, small = false, disabled = false }: Props) {
  return <label className={clsx(
    "relative inline-block w-[56px] h-8"
  )}>
    <input className="peer appearance-none" disabled={disabled} checked={checked} onChange={setChecked}
           type="checkbox"/>
    <span className={clsx(`
                      absolute
                      cursor-pointer
                      w-full
                      h-full
                      top-0
                      bottom-0
                      duration-200
                      peer-checked:border-green
                      peer-checked:bg-green/20
                      border-active-border
                      border
                      rounded-5
                      peer-checked:before:bg-green
                      peer-checked:before:translate-x-6
                      hover:before:bg-green
                      hover:border-green
                      before:content-['']
                      before:absolute
                      before:top-[3px]
                      before:left-[3px]
                      before:h-[24px]
                      before:w-[24px]
                      before:bg-active-border
                      before:rounded-full
                      before:duration-200
                  `
    )}/>
  </label>;
}
