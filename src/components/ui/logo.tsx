/* eslint-disable @next/next/no-img-element */
import { u } from "./frame";

/**
 * "กช." logo lock-up (Figma Nav 91:459 > Logo 91:460, desktop Logo 91:445).
 * Natural size is 102 x 16.348 design px; `scale` multiplies it (desktop = 254 / 102).
 */
export function Logo({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  const s = (n: number) => u(n * scale);
  return (
    <div className={`relative font-noto text-white whitespace-nowrap ${className}`} style={{ width: s(102), height: s(16.348) }}>
      <div className="absolute" style={{ inset: "14.23% 73.37% 0 0" }}>
        <img alt="กช." className="absolute block inset-0 size-full max-w-none" src="/assets/figma/ui/logo-mark.svg" />
      </div>
      <div className="absolute bg-white" style={{ inset: "14.23% 69.59% 0.36% 29.73%" }} />
      <div className="absolute" style={{ inset: "0 0 11.04% 33.78%" }}>
        <p className="font-bold" style={{ fontSize: s(6.306), lineHeight: 1.29 }}>
          งานกิจกรรมพัฒนาผู้เรียน
        </p>
        <p className="font-normal" style={{ fontSize: s(6.677), lineHeight: 1.29 }}>
          โรงเรียนเตรียมอุดมศึกษา
        </p>
      </div>
    </div>
  );
}
