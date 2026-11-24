import { CaptureKratong } from "@components/Capture";
import { RevealContinue } from "./reveal-continue";
import type { AnyResultData } from "@types-app/kratong";

/** Reads the just-submitted kratong from the URL (same shape as /capture?data=). Bad or missing data goes to the river. */
function parseData(raw: string | string[] | undefined): AnyResultData | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.kratong && parsed.wish) return parsed as AnyResultData;
  } catch {
    // fall through
  }
  return null;
}

/**
 * The moment after "ลอยกระทง !": a full-screen reveal of the user's kratong (dark scene, then their name and
 * "โอมเพี้ยง !", then the kratong lights up), before continuing to the river.
 */
export default async function RevealPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { data } = await searchParams;
  const parsed = parseData(data);
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#1286b1]">
      {parsed && <CaptureKratong data={parsed} style="day" animate />}
      <RevealContinue skip={!parsed} />
    </main>
  );
}
