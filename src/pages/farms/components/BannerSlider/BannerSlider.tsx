import React, {DetailedReactHTMLElement, HTMLAttributes, useEffect, useState} from "react";
import styles from "./BannerSlider.module.scss";
import BannerSliderItem from "../BannerSliderItem";
import Text from "../../../../components/atoms/Text";
import Button from "../../../../components/atoms/Button";
import clsx from "clsx";
import Image from "next/image";

export default function BannerSlider({children}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // const [paused, setPaused] = useState(false);

  const updateIndex = (newIndex) => {
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
      className={styles.carousel}
      // onMouseEnter={() => setPaused(true)}
      // onMouseLeave={() => setPaused(false)}
    >
      <div
        className={clsx(styles.inner, styles[`active${activeIndex}`])}
      >
        <BannerSliderItem active={activeIndex === 0} index={0}>
          <div className={styles.textPart}>
            <Text variant={28} weight={600}>Sloth Farming 101</Text>
            <div style={{height: 10}} />
            <Text>New to the Slothiverse? Get started with Farming in just a few easy steps!</Text>
            <div style={{height: 16}} />
            <Button>Master Farming</Button>
          </div>
          <div className={styles.bannerImage}>
            <Image width={434} height={224} src="/images/banners/banner1.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 1} index={1}>
          <div className={styles.textPart}>
            <Text variant={28} weight={600}>Secure your Slothvestments</Text>
            <div style={{height: 10}} />
            <Text>Fear not, Sloth friends! Our Sloth Shield has your back, keeping your funds safe and sound.</Text>
            <div style={{height: 16}} />
            <Button>Protect your Funds</Button>
          </div>
          <div className={styles.bannerImage}>
            <Image width={434} height={224} src="/images/banners/banner2.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 2} index={2}>
          <div className={styles.textPart}>
            <Text variant={28} weight={600}>Callisto Network - Sloth`s Safe Haven</Text>
            <div style={{height: 10}} />
            <Text>Dive into the ultra-fast, ultra-cheap Callisto Network! The ideal environment for Soy-powered DeFi Sloths.</Text>
            <div style={{height: 16}} />
            <Button>Explore Callisto Network</Button>
          </div>
          <div className={styles.bannerImage}>
            <Image width={434} height={224} src="/images/banners/banner3.svg" alt="" />
          </div>
        </BannerSliderItem>
        <BannerSliderItem active={activeIndex === 3} index={3}>
          <div className={styles.textPart}>
            <Text variant={28} weight={600}>Juicy APR Hotspots</Text>
            <div style={{height: 10}} />
            <Text>Hungry for juicy returns? Feast your eyes on our top-performing pools with the highest APRs, ripe for the picking!</Text>
            <div style={{height: 16}} />
            <Button>Boost your Earnings</Button>
          </div>
          <div className={styles.bannerImage}>
            <Image width={434} height={224} src="/images/banners/banner4.svg" alt="" />
          </div>
        </BannerSliderItem>
      </div>
      <div className={styles.indicators}>
        {/*<button*/}
        {/*  onClick={() => {*/}
        {/*    updateIndex(activeIndex - 1);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Prev*/}
        {/*</button>*/}
        {[1, 2, 3, 4].map((z, index) => {
          return (
            <button
              key={z}
              className={`${index === activeIndex ? styles.active : ""}`}
              onClick={() => {
                updateIndex(index);
              }}
            />
          );
        })}
        {/*<button*/}
        {/*  onClick={() => {*/}
        {/*    updateIndex(activeIndex + 1);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Next*/}
        {/*</button>*/}
      </div>
    </div>
  );
}
