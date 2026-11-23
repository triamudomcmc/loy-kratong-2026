"use client";

import { LightWater } from "@components/Water";
import Image from "next/image";
import { useWindowDimensions } from "@utils/useWindowDimensions";

export default function SalaFrontBG() {
  const { width } = useWindowDimensions();

  return (
    <>
      <div className="h-screen relative bg-[linear-gradient(182.71deg,#281981_-2.41%,#3a71b3_47.53%,#1a3270_100.68%)]">
        <div className="relative h-screen overflow-hidden select-none pointer-events-none blur-xs">
          <div className="w-full h-full absolute z-[3] backdrop-blur-[4px] bg-[linear-gradient(260.4deg,rgba(255,149,149,0.78)_5.94%,rgba(58,137,255,0.713602)_58.41%,rgba(144,92,255,0.63)_114.03%)]" />
          <div className="fixed w-[140px] h-[140px] right-[45px] top-[55px] sm:w-[200px] sm:h-[200px] sm:right-[50px] sm:top-[25px]">
            <div className="absolute w-[65%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]">
              <Image
                src="/assets/images/scene/moon.gif"
                width={2048}
                height={2048}
                className="object-cover"
                alt=""
              />
            </div>
            <div className="absolute top-0 z-[1]">
              <Image
                src="/assets/images/scene/blur.png"
                width={3414}
                height={3414}
                className="object-cover"
                alt=""
              />
            </div>
          </div>
          <div className="w-full absolute bottom-0 z-[-5]">
            <LightWater />
          </div>
          <div className="absolute bottom-[-10px] z-0 left-1/2 -translate-x-1/2 min-w-full min-h-1/2">
            <div className="w-full h-full flex justify-center">
              {width >= 640 ? (
                <Image
                  width={1350}
                  height={753}
                  className="object-cover"
                  src="/assets/images/scene/sala-front.png"
                  alt="ศาลา"
                />
              ) : (
                <Image fill className="object-cover" src="/assets/images/scene/sala-front.png" alt="ศาลา" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
