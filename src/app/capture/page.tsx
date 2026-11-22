import { CaptureKratong } from "@components/Capture";
import type { KratongData } from "@types-app/kratong";

const sample: KratongData = {
  kratong: {
    base: "banana-leaf",
    candles: "candle-yellow",
    decorations: "swan",
    flowers: "luck",
    signVariant: 0,
  },
  wish: {
    name: "hi",
    content: "hi",
  },
};

function parseData(raw: string | string[] | undefined): KratongData {
  if (typeof raw !== "string" || !raw) return sample;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.kratong && parsed.wish) return parsed as KratongData;
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
