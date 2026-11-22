"use client";

import type { FC } from "react";
import { WaterFour, WaterOne, WaterThree, WaterTwo } from "@components/Water";
import Image from "next/image";
import { Cloud } from "@components/Vector/cloud";
import clsx from "clsx";
import { BotLane, MidLane, MovingKratong, TopLane } from "./kratonglane";
import type { ResultData } from "@types-app/kratong";
import { AnimatePresence, motion } from "motion/react";
import { CUPSAAIdleKratong, DraggableKratong, IdleKratong, PrincipalIdleKratong } from "./displaykratong";
import { useWindowDimensions } from "@utils/useWindowDimensions";
import { CUPSAAKratongData, PrincipalKratongData, RongPrincipalKratongsData } from "@map/realkratong";
import { useEffect, useState } from "react";

function random(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function chunk<T>(arr: T[], cCount: number) {
  const len = Math.ceil(arr.length / cCount);
  const chunks: T[][] = [];
  const n = arr.length;
  let i = 0;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}

const LoyKratongScene: FC<{ entities: ResultData[] }> = ({ entities }) => {
  const { width } = useWindowDimensions();
  const [localLoy, setLocalLoy] = useState(false);
  const [done, setDone] = useState(false);
  const [lanes, setLanes] = useState<ResultData[][]>([[], [], []]);
  const [idle, setIdle] = useState<{ data: ResultData; initialX: number } | null>(null);

  const [prevEntity, setPrevEntity] = useState<undefined | ResultData>(undefined);

  /* eslint-disable react-hooks/set-state-in-effect -- browser-only values (localStorage, viewport, random) are read after mount to stay SSR-safe */
  useEffect(() => {
    const cwidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    setLocalLoy(localStorage.getItem("released") === "true");
    setPrevEntity(JSON.parse(localStorage.getItem("entity") || "{}"));
    setDone(true);
    setIdle({
      data: RongPrincipalKratongsData[random(0, 3)],
      initialX: cwidth > 640 ? 550 : 350,
    });
  }, []);

  useEffect(() => {
    if (entities.length > 0) {
      setLanes(chunk(shuffle(entities), 3));
    }
  }, [entities]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="w-[250vw] nak:w-[210vw] lg:w-[175vw]">
      <AnimatePresence>
        {!localLoy && (
          <motion.div
            key="pantoloy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="blinking-text w-[250px] absolute bottom-[75px] left-[50px] z-[99]"
          >
            {/* <Pantoloy /> */}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed w-[100vw] top-[-49px] z-[9] xl:top-[-31px]">
        <div className="absolute w-full top-[50px] z-[4]">
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[-50px] top-[75px] sm:top-[55px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[125px] sm:w-[105px] absolute z-[3] left-[75px] top-[123px] sm:top-[103px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[155px] top-[75px] sm:top-[55px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[275px] top-[95px] sm:top-[85px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[165px] sm:w-[135px] absolute z-[3] left-[535px] top-[55px] sm:top-[65px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[125px] sm:w-[105px] absolute z-[3] left-[421px] top-[49px] sm:top-[103px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[695px] top-[75px] sm:top-[55px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[815px] top-[95px] sm:top-[85px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[165px] sm:w-[135px] absolute z-[3] left-[975px] top-[55px] sm:top-[65px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[1024px] top-[75px] sm:top-[55px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[125px] sm:w-[105px] absolute z-[3] left-[1234px] top-[123px] sm:top-[103px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[1425px] top-[75px] sm:top-[55px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[150px] sm:w-[125px] absolute z-[3] left-[1530px] top-[95px] sm:top-[85px] opacity-[15%] ">
            <Cloud />
          </div>
          <div className="w-[165px] sm:w-[135px] absolute z-[3] left-[1673px] top-[55px] sm:top-[65px] opacity-[15%] ">
            <Cloud />
          </div>
        </div>
        <div className="absolute w-[150px] h-[150px] right-[10vw] top-[35px] z-[8]">
          <div className="absolute w-[65%] left-[50%] top-[50%] z-[7]">
            <Image src="/assets/images/scene/moon.gif" width={2048} height={2048} className="object-cover" alt="ดวงจันทร์" />
          </div>
          <div className="absolute top-0 z-[6]">
            <Image src="/assets/images/scene/blur.png" width={3414} height={3414} className="object-cover" alt="ดวงจันทร์" />
          </div>
        </div>
      </div>
      <div className="h-[100vh] bg-black bg-loy relative overflow-hidden w-[250vw] nak:w-[210vw] lg:w-[175vw]">
        <div className="relative left-[24px] top-[12px]">
          <div className="absolute w-[225px] h-[225px] top-[75px] left-[9px] z-[10]">
            <Image src="/assets/images/scene/fireworks-blue.gif" width={441} height={480} alt="" />
          </div>
          <div className="absolute w-[174px] h-[200px] top-[105px] left-[189px] z-[10]">
            <Image src="/assets/images/scene/fireworks-orange.gif" width={441} height={481} alt="" />
          </div>
          <div className="absolute w-[174px] h-[200px] top-[55px] left-[551px] z-[10]">
            <Image src="/assets/images/scene/fireworks-purple.gif" width={441} height={481} alt="" />
          </div>
          <div className="absolute w-[305px] h-[205px] top-[45px] left-[741px] z-[10]">
            <Image src="/assets/images/scene/fireworks-white.gif" width={1280} height={960} alt="" />
          </div>

          {width > 840 && (
            <>
              <div className="absolute w-[225px] h-[225px] top-[75px] left-[1009px] z-[10]">
                <Image src="/assets/images/scene/fireworks-blue.gif" width={441} height={480} alt="" />
              </div>
              <div className="absolute w-[174px] h-[200px] top-[105px] left-[1389px] z-[10]">
                <Image src="/assets/images/scene/fireworks-orange.gif" width={441} height={481} alt="" />
              </div>
              <div className="absolute w-[174px] h-[200px] top-[55px] left-[1551px] z-[10]">
                <Image src="/assets/images/scene/fireworks-purple.gif" width={441} height={481} alt="" />
              </div>
              <div className="absolute w-[305px] h-[205px] top-[45px] left-[1741px] z-[10]">
                <Image src="/assets/images/scene/fireworks-white.gif" width={1280} height={960} alt="" />
              </div>
            </>
          )}
        </div>
        <div
          className={
            done ? "absolute left-[-50px] bottom-[70px] custom:bottom-[70px] nak:bottom-[-8px] lg:bottom-[-150px]" : ""
          }
        >
          <div className="relative">
            <div className="absolute z-[5] flex top-[-75px] custom:top-[-109px] sm:top-[-231px] lg:top-[-240px]  sm:w-[353vw] lg:w-[253vw]">
              <div className="w-[125%]">
                <Image
                  src="/assets/images/scene/buildings-black.png"
                  width={2328}
                  height={318}
                  className="object-cover"
                  alt="ตึก"
                />
              </div>
            </div>
            <TopLane entities={lanes[0]} />
            <WaterFour />
          </div>
        </div>
        <div
          className={
            done ? "absolute left-[-50px] bottom-[20px] custom:bottom-[60px] nak:bottom-[-68px] lg:bottom-[-220px]" : ""
          }
        >
          <div className="relative">
            {idle && (
              <IdleKratong
                highlighted
                className="transition-opacity absolute top-[-50px] nak:top-[-60px] lg:top-[-46px]"
                lane="m"
                size={["155px", "115px"]}
                initialX={idle.initialX}
                data={idle.data}
              />
            )}
            <CUPSAAIdleKratong
              highlighted
              initialX={width > 640 ? 965 : 665}
              data={CUPSAAKratongData}
              lane="m"
              size={["185px", "135px"]}
              className={
                "transition-opacity absolute top-[-48px] nak:top-[-60px] lg:top-[-44px]"
              }
            />
            <MidLane entities={lanes[1]} />
            <WaterThree />
          </div>
        </div>
        <div
          className={
            done
              ? "absolute left-[-50px] bottom-[-40px] custom:bottom-[-30px] nak:bottom-[-158px] lg:bottom-[-315px]"
              : ""
          }
        >
          <div className="relative">
            <div className="relative">
              <div className="absolute left-[22px] z-[35] top-[-215px] w-[342px] max-w-[450px] select-none sm:top-[-334px] sm:w-[450px]">
                <Image
                  width={1350}
                  height={1382}
                  className="object-contain"
                  src="/assets/images/scene/sala-side.png"
                  alt="ศาลา"
                />
              </div>
              {!localLoy && prevEntity && prevEntity?.kratong && prevEntity?.wish && (
                <DraggableKratong
                  setLoy={setLocalLoy}
                  className={clsx(
                    "absolute z-[36] top-[-108px] left-[112px] cursor-pointer nak:top-[-81px] sm:left-[183px]",
                    width > 640 && "ml-16"
                  )}
                  data={prevEntity}
                  height={width > 640 ? "170px" : "155px"}
                  zIndex={[39, 39]}
                />
              )}
            </div>
            <PrincipalIdleKratong
              className="transition-opacity absolute top-[-74px] nak:top-[-72px] lg:top-[-68px]"
              lane="b"
              size={["200px", "170px"]}
              initialX={width > 640 ? 750 : 490}
              data={PrincipalKratongData}
            />
            {localLoy && prevEntity && (
              <MovingKratong
                className={
                  "transition-opacity absolute left-[350px] top-[-54px] nak:top-[-58px] lg:top-[-40px]"
                }
                initialX={width > 640 ? 62 : -25}
                data={prevEntity}
                size={["170px", "155px"]}
                lane="b"
              />
            )}
            <BotLane entities={lanes[2]} />
            <WaterTwo />
          </div>
        </div>
        <div
          className={
            done
              ? "absolute left-[-50px] bottom-[-120px] custom:bottom-[-105px] nak:bottom-[-238px] lg:bottom-[-396px]"
              : ""
          }
        >
          <div className="relative">
            <WaterOne />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyKratongScene;
