"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CUPSAAKratong } from "./kratong";
import { CUPSAAMap } from "@map/kratong";
import { sendData } from "@server/actions";
import { u } from "@components/ui";
import {
  ActionButtons,
  BuilderSheet,
  BuilderShell,
  BuilderStage,
  NextButton,
  ScrollArea,
  TabStrip,
  TileGrid,
  WishField,
  lineName,
  lineWish,
} from "@components/ui/builder";

import type { CupsaaSelected as Selected, Wish } from "@types-app/kratong";
export type { Selected, Wish };

type Part = "base" | "flowers" | "candles";

const TABS: { id: Part; label: string }[] = [
  { id: "base", label: "ฐาน" },
  { id: "flowers", label: "ดอกไม้" },
  { id: "candles", label: "เทียน" },
];

const Preview = ({ selected }: { selected: Selected }) => (
  <CUPSAAKratong zIndex={7} height={u(163)} selected={selected} />
);

interface CreateKratongProps {
  selected: Selected;
  setSelected: (selection: Selected) => void;
  nextPage: () => void;
}

const CreateKratong = ({ selected, setSelected, nextPage }: CreateKratongProps) => {
  const [section, setSection] = useState<Part>("base");

  const tiles = Object.values(CUPSAAMap[section]).map((data) => ({
    id: data.id,
    name: data.name,
    src: data.thumbnail ?? data.url,
  }));

  return (
    <BuilderStage title="สร้างกระทง" preview={<Preview selected={selected} />} previewKey={JSON.stringify(selected)}>
      <BuilderSheet />
      <TabStrip tabs={TABS} value={section} onChange={setSection} />
      <ScrollArea key={section}>
        <TileGrid
          tiles={tiles}
          selectedId={selected[section]}
          onSelect={(id) => setSelected({ ...selected, [section]: id })}
        />
      </ScrollArea>
      <NextButton onClick={nextPage} />
    </BuilderStage>
  );
};

interface CreateWishProps {
  selected: Selected;
  wish: Wish;
  setWish: (wish: Wish) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface WishError {
  name: string | null;
  content: string | null;
}

const CharLimits = { name: 64, content: 280 };

const CreateWish = ({ selected, wish, setWish, nextPage, prevPage }: CreateWishProps) => {
  const [error, setErrorState] = useState<WishError>({ name: null, content: null });
  const [errorTick, setErrorTick] = useState(0);
  const setError = (next: WishError) => {
    setErrorState(next);
    if (next.name || next.content) setErrorTick((t) => t + 1);
  };

  const validateValues = () => {
    const next = {
      name: wish.name.length === 0 ? "โปรดกรอกข้อมูลดังกล่าว" : null,
      content: wish.content.length === 0 ? "โปรดกรอกข้อมูลดังกล่าว" : null,
    };
    setError(next);
    return !next.name && !next.content;
  };

  return (
    <BuilderStage title="ใส่คำอธิษฐาน" preview={<Preview selected={selected} />} previewKey={JSON.stringify(selected)}>
      <BuilderSheet header={false} />
      <WishField
        label="ชื่อ"
        top={321}
        value={wish.name}
        placeholder="สมาคมนักเรียนเก่าเตรียมอุดมศึกษา ในพระบรมราชูปถัมภ์"
        limit={CharLimits.name}
        error={error.name}
        errorTick={errorTick}
        lineSrc={lineName}
        onChange={(name) => setWish({ name, content: wish.content })}
      />
      <WishField
        label="ใส่คำอธิษฐาน"
        top={430}
        value={wish.content ?? ""}
        placeholder="ขอให้รวย ๆ ขอให้สุขภาพแข็งแรง ขอให้ครอบครัวมีความสุข สาธุ"
        limit={CharLimits.content}
        error={error.content}
        errorTick={errorTick}
        lineSrc={lineWish}
        onChange={(content) => setWish({ name: wish.name, content })}
      />
      <ActionButtons
        onBack={prevPage}
        submitLabel="บันทึกกระทง"
        onSubmit={() => {
          if (!validateValues()) return;
          nextPage();
        }}
      />
    </BuilderStage>
  );
};

import type { CupsaaResultData as ResultData } from "@types-app/kratong";
export type { ResultData };

interface ResultProps {
  id: string;
  data: ResultData;
  prevPage: () => void;
}

const Result = ({ id, data, prevPage }: ResultProps) => {
  const started = useRef(false);

  // Submit once per mount, with at most 3 attempts and a growing delay.
  // The ref guard keeps React Strict Mode's double effect from double-submitting.
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const send = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await sendData({ id, data, kind: "CUPSAA" });
          if (res?.status) return;
        } catch {
          // fall through to retry
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    };

    send();
  }, [id, data]);

  return (
    <BuilderStage title="สำเร็จ" preview={<Preview selected={data.kratong} />} previewKey={JSON.stringify(data.kratong)}>
      <BuilderSheet header={false} />
      <motion.div
        className="absolute flex flex-col items-center text-center font-noto text-white"
        style={{ left: u(25), top: u(330), width: u(293), gap: u(12) }}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}
      >
        <motion.p
          style={{ fontSize: u(18), lineHeight: 1.4 }}
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          {data.wish.name}
        </motion.p>
        <motion.p
          className="break-words"
          style={{ fontSize: u(14), lineHeight: 1.6 }}
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          {data.wish.content}
        </motion.p>
      </motion.div>
      <ActionButtons onBack={prevPage} backLabel="กลับไปแก้ไขกระทง" />
    </BuilderStage>
  );
};

import type { CupsaaResultData as KratongData } from "@types-app/kratong";
export type { KratongData };

export const Create = ({ id, idata }: { id: string; idata: KratongData }) => {
  const [data, setData] = useState<KratongData>(
    Object.keys(idata).length > 1
      ? idata
      : {
          kratong: {
            base: "base-pink",
            candles: "candle-pink",
            flowers: "flower-pink",
          },
          wish: {
            name: "สมาคมนักเรียนเก่าเตรียมอุดมศึกษา ในพระบรมราชูปถัมภ์",
            content: "",
          },
        },
  );

  const [page, setPage] = useState(1);

  const setKratong = (selection: Selected) => {
    setData((oldData) => ({ kratong: selection, wish: oldData.wish }));
  };

  const setWish = (newWish: Wish) => {
    setData((oldData) => ({ kratong: oldData.kratong, wish: newWish }));
  };

  const NextPage = () => {
    setPage((currPage) => (currPage === 3 ? currPage : currPage + 1));
  };

  const PrevPage = () => {
    setPage((currPage) => (currPage === 1 ? currPage : currPage - 1));
  };

  return (
    <BuilderShell>
      {page === 1 && <CreateKratong key="build" selected={data.kratong} setSelected={setKratong} nextPage={NextPage} />}
      {page === 2 && (
        <CreateWish
          key="wish"
          wish={data.wish}
          setWish={setWish}
          selected={data.kratong}
          nextPage={NextPage}
          prevPage={PrevPage}
        />
      )}
      {page === 3 && <Result key="result" id={id} data={data} prevPage={PrevPage} />}
    </BuilderShell>
  );
};
