"use client";

import type { FC } from "react";
import { useState } from "react";
import { Kratong } from "./kratong";
import { DEFAULT_BASE, DEFAULT_FLOWER, KratongMap, SHOW_DECORATIONS, normalizeSelected, KratongType, KratongTypeVariant } from "@map/kratong";
import { pushKratong } from "@server/actions";
import { useRouter } from "next/navigation";
import { u } from "@components/ui";
import {
  ActionButtons,
  BuilderSheet,
  BuilderShell,
  BuilderStage,
  NextButton,
  ScrollArea,
  SectionLabel,
  SIGN_SWATCH_ORDER,
  SwatchRow,
  TabStrip,
  TileGrid,
  WishField,
  lineName,
  lineWish,
} from "@components/ui/builder";
import type { Tile } from "@components/ui/builder";

import type { KratongSelected as Selected, Wish } from "@types-app/kratong";
export type { Selected, Wish };

type Part = "base" | "flowers" | "candles" | "decorations";

const TABS: { id: Part; label: string }[] = [
  { id: "base", label: "ฐาน" },
  { id: "flowers", label: "ดอกไม้" },
  { id: "candles", label: "เทียน" },
  ...(SHOW_DECORATIONS ? [{ id: "decorations" as const, label: "ของตกแต่ง" }] : []),
];

type AnyPart = KratongType | KratongTypeVariant;

const toTile = (data: AnyPart, signVariant: number): Tile => ({
  id: data.id,
  name: data.name,
  src:
    "url" in data
      ? (data.thumbnail ?? data.url)
      : (data.thumbnails ? data.thumbnails[signVariant] : data.variants[signVariant]),
  wide: "variants" in data,
});

const PreviewKratong: FC<{ selected: Selected }> = ({ selected }) => (
  <Kratong zIndex={7} height={u(190.8)} selected={selected} />
);

interface CreateKratongProps {
  selected: Selected;
  setSelected: (selection: Selected) => void;
  nextPage: () => void;
}

const CreateKratong: FC<CreateKratongProps> = ({ selected, setSelected, nextPage }) => {
  const [section, setSection] = useState<Part>("base");

  const parts = (part: Part) => Object.values(KratongMap[part]) as AnyPart[];
  const select = (part: Part) => (id: string) => setSelected({ ...selected, [part]: id });
  const tiles = (list: AnyPart[]) => list.map((d) => toTile(d, selected.signVariant));

  const decorations = parts("decorations");
  const signs = decorations.filter((d) => d.type === "variant");
  const others = decorations.filter((d) => d.type !== "variant");

  return (
    <BuilderStage title="สร้างกระทง" shadowY={198.31} preview={<PreviewKratong selected={selected} />} previewKey={JSON.stringify(selected)}>
      <BuilderSheet />
      <TabStrip tabs={TABS} value={section} onChange={setSection} />
      <ScrollArea key={section}>
        {section === "decorations" ? (
          <>
            <SwatchRow
              label="ป้าย"
              value={selected.signVariant}
              order={SIGN_SWATCH_ORDER}
              onChange={(signVariant) => setSelected({ ...selected, signVariant })}
            />
            <TileGrid y={16} tiles={tiles(signs)} selectedId={selected.decorations} onSelect={select("decorations")} />
            <div style={{ height: u(18) }} />
            <SectionLabel>ของตกแต่ง</SectionLabel>
            <TileGrid y={0} tiles={tiles(others)} selectedId={selected.decorations} onSelect={select("decorations")} />
          </>
        ) : (
          <TileGrid tiles={tiles(parts(section))} selectedId={selected[section]} onSelect={select(section)} />
        )}
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

const CreateWish: FC<CreateWishProps> = ({ selected, wish, setWish, prevPage }) => {
  const router = useRouter();

  const [error, setErrorState] = useState<WishError>({ name: null, content: null });
  const [errorTick, setErrorTick] = useState(0);
  const setError = (next: WishError) => {
    setErrorState(next);
    if (next.name || next.content) setErrorTick((t) => t + 1);
  };
  const [loading, setLoading] = useState(false);

  const validateValues = () => {
    const next = {
      name: wish.name.length === 0 ? "โปรดกรอกข้อมูลดังกล่าว" : null,
      content: wish.content.length === 0 ? "โปรดกรอกข้อมูลดังกล่าว" : null,
    };
    setError(next);
    return !next.name && !next.content;
  };

  const save = async () => {
    setLoading(true);
    const entityData = { kratong: selected, wish: wish };
    let kratongData: Awaited<ReturnType<typeof pushKratong>>;
    try {
      kratongData = await pushKratong({ data: entityData });
    } catch {
      setError({ name: null, content: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
      setLoading(false);
      return;
    }

    if (!kratongData.status) {
      const next: WishError = { name: null, content: null };

      if (kratongData.report === "cursed") {
        if (kratongData.data.location === "name") next.name = "ข้อมูลข้างต้นมีคำที่ไม่เหมาะสม";
        if (kratongData.data.location === "content") next.content = "ข้อมูลข้างต้นมีคำที่ไม่เหมาะสม";
      } else {
        next.content = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      }

      setError(next);
      setLoading(false);
      return;
    }

    const id = kratongData.data.id;
    localStorage.setItem("entityId", id);
    localStorage.setItem("entity", JSON.stringify(entityData));
    // play the reveal of the new kratong first; /reveal continues to /loykratong on its own
    router.push(`/reveal?data=${encodeURIComponent(JSON.stringify(entityData))}`);
  };

  return (
    <BuilderStage title="ใส่คำอธิษฐาน" shadowY={200.44} preview={<PreviewKratong selected={selected} />} previewKey={JSON.stringify(selected)}>
      <BuilderSheet header={false} dim={0.68} />
      <WishField
        label="ชื่อ"
        top={321}
        value={wish.name ?? ""}
        placeholder="นายเรียนเด่น เล่นดี"
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
        placeholder="ขอให้ได้คณะที่หวัง ขอให้มีหวานใจ สาธุ"
        limit={CharLimits.content}
        error={error.content}
        errorTick={errorTick}
        lineSrc={lineWish}
        onChange={(content) => setWish({ name: wish.name, content })}
      />
      <ActionButtons
        busy={loading}
        onBack={prevPage}
        submitLabel="ลอยกระทง !"
        onSubmit={() => {
          if (!validateValues()) return;
          save();
        }}
      />
    </BuilderStage>
  );
};

import type { ResultData as ResultData } from "@types-app/kratong";
export type { ResultData };

import type { ResultData as KratongData } from "@types-app/kratong";
export type { KratongData };

export const Create: FC<{ idata?: KratongData | null }> = ({ idata }) => {
  const [data, setData] = useState<KratongData>(
    idata && Object.keys(idata).length > 1
      ? { ...idata, kratong: normalizeSelected(idata.kratong) }
      : {
          kratong: {
            base: DEFAULT_BASE,
            flowers: DEFAULT_FLOWER,
            candles: "candle-yellow",
            decorations: "none",
            signVariant: 4,
          },
          wish: {
            name: "",
            content: "",
          },
        }
  );

  const [page, setPage] = useState(1);

  const setKratong = (selection: Selected) => {
    setData((oldData) => {
      return {
        kratong: selection,
        wish: oldData.wish,
      };
    });
  };

  const setWish = (newWish: Wish) => {
    setData((oldData) => {
      return {
        kratong: oldData.kratong,
        wish: newWish,
      };
    });
  };

  const goNext = () => {
    setPage((currPage) => (currPage === 3 ? currPage : currPage + 1));
  };

  const goPrev = () => {
    setPage((currPage) => (currPage === 1 ? currPage : currPage - 1));
  };

  return (
    <BuilderShell>
      {page === 1 && <CreateKratong key="build" selected={data.kratong} setSelected={setKratong} nextPage={goNext} />}
      {page === 2 && (
        <CreateWish
          key="wish"
          wish={data.wish}
          setWish={setWish}
          selected={data.kratong}
          nextPage={goNext}
          prevPage={goPrev}
        />
      )}
    </BuilderShell>
  );
};
