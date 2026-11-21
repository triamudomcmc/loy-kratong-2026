import type { NextRequest } from "next/server";
import screenshot from "@utils/screenshot";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!data) return new Response("Missing data", { status: 400 });

  try {
    const file = await screenshot(`${req.nextUrl.origin}/capture?data=${encodeURIComponent(data)}`, 1080, 1920);

    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, immutable, no-transform, s-maxage=31536000, max-age=31536000",
      },
    });
  } catch (e) {
    console.error("capture failed", e);
    return new Response("Failed to capture", { status: 500 });
  }
}
