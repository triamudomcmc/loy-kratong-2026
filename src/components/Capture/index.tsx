"use client";

import type { FC } from "react";
import Image from "next/image";
import { Cloud } from "@components/Vector/cloud";
import { WaterFour, WaterOne, WaterThree, WaterTwo } from "@components/Water";
import clsx from "clsx";
import type { KratongData } from "@types-app/kratong";
import { IdleCaptureKratong } from "./capturekratong";

const layer = "absolute left-[calc(-2vw_-_350px)]";

export const CaptureKratong: FC<{ data: KratongData }> = ({ data }) => {
  return (
    <div className="relative h-[1920px] w-[1080px] bg-[#eee]">
      <nav className="absolute top-[46px] left-[48px]  w-full z-[99]">
        <div className="max-w-[306px]">
          <Image src="/assets/images/logo.png" width={1024} height={169} alt="โลโก้ กช." />
        </div>
      </nav>
      <div className="absolute top-[5px] z-[9] w-full">
        <div className="w-[490px] absolute z-[3] left-[-96px] top-[201px] opacity-[15%] ">
          <Cloud />
        </div>
        <div className="w-[448px] absolute z-[3] left-[296px] top-[303px] opacity-[15%] ">
          <Cloud />
        </div>
        <div className="w-[465px] absolute z-[3] right-[-96px] top-[231px] opacity-[15%] ">
          <Cloud />
        </div>
        <div className="absolute right-[46px] top-[35px] z-[8] h-[375px] w-[375px]">
          <div className="absolute left-1/2 top-1/2 z-[7] w-[65%] -translate-x-1/2 -translate-y-1/2">
            <img src="/assets/images/scene/moon.gif" width={2048} height={2048} alt="ดวงจันทร์" />
          </div>
          <div className="absolute top-0 z-[6]">
            <img src="/assets/images/scene/blur.png" width={3414} height={3414} alt="ดวงจันทร์" />
          </div>
        </div>
        {/* <div className={styles["fireworks-1"]}>
          <Image src="/assets/images/scene/fireworks-red.png" width={692} height={754} />
        </div>
        <div className={styles["fireworks-2"]}>
          <Image src="/assets/images/scene/fireworks-purple.png" width={692} height={754} />
        </div> */}
        <div className="absolute left-[200px] top-[65px] z-[7] h-[494px] w-[640px]">
          <img src="/assets/images/scene/capture-fireworks-flipped.png" width={2048} height={2048} alt="" />
        </div>
      </div>
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#000000_0%,#236bad_70.87%)]">
        <div className={clsx(layer, "z-10 bottom-[30px]")}>
          <div className="relative w-[554vw] bottom-[-193px]">
            <div className="absolute top-[-166px] z-[5] flex w-[300vw]">
              <div className="w-[275%]">
                <img src="/assets/images/scene/buildings.png" width={2328} height={318} alt="ตึก" />
              </div>
            </div>
            <WaterFour />
          </div>
        </div>

        <div className={clsx(layer, "z-20 bottom-[110px]")}>
          <div className="relative w-[554vw] bottom-[-526px]">
            <WaterThree />
            <IdleCaptureKratong
              lane="t"
              className="absolute z-[29] brightness-[40%]"
              data={{
                kratong: {
                  base: "banana-leaf",
                  candles: "candle-yellow",
                  decorations: "sign-want-love",
                  flowers: "love",
                  signVariant: 0,
                },
                wish: { content: "", name: "" },
              }}
              size={"280px"}
              initialX={332}
              initialY={-151}
              highlighted={false}
            />

            <IdleCaptureKratong
              lane="t"
              className="absolute z-[29] brightness-[40%]"
              data={{
                kratong: {
                  base: "ice",
                  candles: "candle-yellow",
                  decorations: "sign-quote",
                  flowers: "luck",
                  signVariant: 1,
                },
                wish: { content: "", name: "" },
              }}
              size={"280px"}
              initialX={1222}
              initialY={-181}
              highlighted={false}
            />
          </div>
        </div>

        <div className={clsx(layer, "z-30 bottom-[-474px]")}>
          <div className="relative w-[554vw] bottom-[-344px]">
            <IdleCaptureKratong
              lane="m"
              className="absolute z-[29]"
              data={{ kratong: data.kratong, wish: { content: "", name: "" } }}
              size={"550px"}
              initialX={662}
              initialY={-451}
              highlighted={true}
            />
            <WaterTwo />
          </div>
        </div>

        <div className={clsx(layer, "z-40 bottom-[-17px]")}>
          <div className="relative w-[554vw] bottom-[-1049px]">
            <IdleCaptureKratong
              lane="b"
              className="absolute z-[29] brightness-[65%]"
              data={{
                kratong: {
                  base: "ice",
                  candles: "candle-blue",
                  decorations: "sign-want-money",
                  flowers: "study",
                  signVariant: 1,
                },
                wish: { content: "", name: "" },
              }}
              size={"380px"}
              initialX={332}
              initialY={-281}
              highlighted={false}
            />
            <WaterOne />

            <IdleCaptureKratong
              lane="b"
              className="absolute z-[29] brightness-[65%]"
              data={{
                kratong: {
                  base: "coconut-shell",
                  candles: "candle-yellow",
                  decorations: "sign-enttid",
                  flowers: "summer-fruits",
                  signVariant: 0,
                },
                wish: { content: "", name: "" },
              }}
              size={"380px"}
              initialX={1112}
              initialY={-251}
              highlighted={false}
            />
          </div>
        </div>
      </div>
      <div className="w-full absolute bottom-[90px] z-[99] px-[75px]">
        <p className="font-display font-light text-7xl text-white w-full text-center">{data.wish.name}</p>
      </div>
    </div>
  );
};
