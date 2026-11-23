import type { NextRequest } from "next/server";
import screenshot from "@utils/screenshot";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!data) return new Response("Missing data", { status: 400 });

  try {
    // In production render the capture page through the server itself (behind a proxy the public origin may not be
    // reachable from inside the container); CAPTURE_ORIGIN overrides it.
    const origin =
      process.env.CAPTURE_ORIGIN ||
      (process.env.NODE_ENV === "production" ? `http://127.0.0.1:${process.env.PORT || 3000}` : req.nextUrl.origin);
    const file = await screenshot(`${origin}/capture?data=${encodeURIComponent(data)}`, 1080, 1920);

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
