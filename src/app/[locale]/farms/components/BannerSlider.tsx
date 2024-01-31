import React, { PropsWithChildren, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface ItemProps {
  index: number,
  active: boolean
}
function BannerSliderItem({ children, index, active }: PropsWithChildren<ItemProps>) {
  return (
    <div className={clsx(
      "rounded-2 text-white absolute top-0 left-0 bottom-0 right-0 p-10 overflow-visible duration-500 ease-in-out",
      active ? "z-[2] opacity-100" : "z-[1] opacity-0",
      index === 0 && "bg-farms-slider-0",
      index === 1 && "bg-farms-slider-1",
      index === 2 && "bg-farms-slider-2",
      index === 3 && "bg-farms-slider-3",
    )}>
      {children}
    </div>
  );
}

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  // const [paused, setPaused] = useState(false);

  // const { showMessage } = useSnackbar();

  const updateIndex = (newIndex: number) => {
    if (newIndex < 0) {
      newIndex = 3;
    } else if (newIndex >= 4) {
      newIndex = 0;
    }

    setActiveIndex(newIndex);
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!paused) {
  //       updateIndex(activeIndex + 1);
  //     }
  //   }, 3000);
  //
  //   return () => {
  //     if (interval) {
  //       clearInterval(interval);
  //     }
  //   };
  // });

  // const handlers = useSwipeable({
  //   onSwipedLeft: () => updateIndex(activeIndex + 1),
  //   onSwipedRight: () => updateIndex(activeIndex - 1)
  // });

  return (
    <div
      className="relative"
      // onMouseEnter={() => setPaused(true)}
      // onMouseLeave={() => setPaused(false)}
    >
      <div
        className={clsx("whitespace-nowrap duration-200 relative h-[230px]")}
      >
        <BannerSliderItem active={activeIndex === 0} index={0}>
          <div className="flex flex-col items-start max-w-[535px]">
            <p className="text-[#122110] text-28 font-semibold">Sloth Farming 101</p>
            <div style={{height: 10}} />
            <p className="text-[#122110]  whitespace-normal">New to the Slothiverse? Get started with Farming in just a few easy steps!</p>
            <div style={{height: 16}} />
            <a href="https://docs.soy.finance/soy-products/trading/make-your-first-trade" target="_blank">
              <PrimaryButton>Master Farming</PrimaryButton>
            </a>
          </div>
          <div className="absolute right-0 bottom-0 h-[224px] w-[434px]">
            <Image width={434} height={224} src="/images/banners/1.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 1} index={1}>
          <div className="flex flex-col items-start max-w-[535px]">
            <p className="text-[#122110] text-28 font-semibold" >Secure your Slothvestments</p>
            <div style={{height: 10}} />
            <p className="text-[#122110]  whitespace-normal">Fear not, Sloth friends! Our Distributed Insurance has your back, keeping your funds safe and sound.</p>
            <div style={{height: 16}} />
            <a href="https://docs.soy.finance/soy-products/safety-on-yields" target="_blank">
              <PrimaryButton>Invest in Your Safety</PrimaryButton>
            </a>
          </div>
          <div className="absolute right-0 bottom-0 h-[224px] w-[434px]">
            <Image width={434} height={224} src="/images/banners/2.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 2} index={2}>
          <div className="flex flex-col items-start max-w-[535px]">
            <p className="text-[#122110] text-28 font-semibold">Callisto Network - Sloths&apos; Safe Haven</p>
            <div style={{height: 10}} />
            <p className="text-[#122110]  whitespace-normal">Dive into the ultra-fast, ultra-cheap Callisto Network! The ideal environment for DeFi Sloths.</p>
            <div style={{height: 16}} />
            <a href="https://callisto.network/">
              <PrimaryButton>Explore Callisto Network</PrimaryButton>
            </a>
          </div>
          <div className="absolute right-0 bottom-0 h-[224px] w-[434px]">
            <Image width={434} height={224} src="/images/banners/3.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 3} index={3}>
          <div className="flex flex-col items-start max-w-[535px]">
            <p className="text-[#122110] text-28 font-semibold">Juicy Hotspots</p>
            <div style={{height: 10}} />
            <p className="text-[#122110]  whitespace-normal">Looking for juicy returns? Discover our top-performing pools with the Boost NFTs.</p>
            <div style={{height: 16}} />
            <PrimaryButton onClick={() => {}}>Boost your Earnings</PrimaryButton>
          </div>
          <div className="absolute right-0 bottom-0 h-[224px] w-[434px]">
            <Image width={434} height={224} src="/images/banners/4.svg" alt="" />
          </div>
        </BannerSliderItem>
      </div>
      <div className="flex justify-center items-center absolute bottom-2.5 w-full h-3.5 z-[3] gap-2">
        {[1, 2, 3, 4].map((z, index) => {
          return (
            <button
              key={z}
              className={`${index === activeIndex ? "bg-green w-6 rounded-5" : "w-3 rounded-full"} p-0  h-3  border border-green duration-300`}
              onClick={() => {
                updateIndex(index);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
