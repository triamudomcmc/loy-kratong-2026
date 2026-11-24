import { redirect } from "next/navigation";
import { Reveal } from "@components/Reveal";
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

/** The moment after "ลอยกระทง !": the kratong lights up on the water, then on to the river. */
export default async function RevealPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { data } = await searchParams;
  const parsed = parseData(data);
  if (!parsed) redirect("/loykratong");
  return <Reveal data={parsed} />;
}
