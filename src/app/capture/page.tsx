import { CaptureKratong } from "@components/Capture";
import type { AnyResultData, KratongData } from "@types-app/kratong";

const sample: KratongData = {
  kratong: {
    base: "green-lotus-large",
    candles: "candle-yellow",
    decorations: "swan",
    flowers: "lotus-marigold",
    signVariant: 0,
  },
  wish: {
    name: "hi",
    content: "hi",
  },
};

function parseData(raw: string | string[] | undefined): AnyResultData {
  if (typeof raw !== "string" || !raw) return sample;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.kratong && parsed.wish) return parsed as AnyResultData;
  } catch {
    // fall through to sample
  }
  return sample;
}

export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { data } = await searchParams;
  return <CaptureKratong data={parseData(data)} />;
}
