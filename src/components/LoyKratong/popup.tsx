"use client";

import type { FC } from "react";
import { motion } from "motion/react";
import type { Wish } from "@types-app/kratong";
import { u } from "@components/ui";

/** Offset of the popup box from the tapped kratong's box (Figma: popup 808,266 over the รองผอ. kratong 762,479). */
export const POPUP_DX = 46;
export const POPUP_DY = -213;

/**
 * Wish popup (Figma Group 90, 91:942), 360.486 x 279.508 with a tail at x=68.
 * The glass is a blurred CSS box (an SVG `<img>` cannot backdrop-blur) under the exported Union
 * SVG, which carries the gradient fill and the stroke. Positioned by its parent.
 */
// Browsers drop backdrop-filter while the glass (or any ancestor) has opacity < 1, so fading the whole popup made it
// look flat and then "snap" to glass. Instead the wrapper only scales/slides, the blur radius itself animates in,
// and the stroke/gradient art and text fade as siblings of the glass (never its ancestors).
const BLUR_ON = `blur(${u(9.57)})`;
const BLUR_OFF = "blur(0px)";
const FADE = { duration: 0.22, ease: "easeOut" } as const;

export const WishPopup: FC<{ wish: Wish; onClose: () => void }> = ({ wish, onClose }) => (
  <motion.div
    className="absolute inset-0"
    style={{ transformOrigin: `${u(68)} 100%` }}
    initial={{ scale: 0.85, y: 12 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0.85, y: 12 }}
    transition={{ type: "spring", stiffness: 380, damping: 28 }}
  >
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: u(360.486), height: u(258.609), borderRadius: u(15.95) }}
      initial={{ backdropFilter: BLUR_OFF }}
      animate={{ backdropFilter: BLUR_ON }}
      exit={{ backdropFilter: BLUR_OFF }}
      transition={FADE}
    />
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      <PopupContent wish={wish} onClose={onClose} />
    </motion.div>
  </motion.div>
);

const PopupContent: FC<{ wish: Wish; onClose: () => void }> = ({ wish, onClose }) => (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      alt=""
      className="absolute left-0 top-0 block max-w-none"
      style={{ width: u(360.486), height: u(279.508) }}
      src="/assets/figma/river/popup-union.svg"
    />
    <p
      className="absolute font-noto font-normal text-white overflow-hidden text-ellipsis whitespace-nowrap"
      style={{ left: u(29.77), top: u(33.99), width: u(278), fontSize: u(19.141), lineHeight: "normal" }}
    >
      {wish.name}
    </p>
    <button
      type="button"
      aria-label="ปิด"
      onClick={onClose}
      className="absolute"
      style={{ left: u(319.01), top: u(19.14), width: u(19.143), height: u(19.139) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="absolute block inset-0 size-full max-w-none" src="/assets/figma/river/icon-xmark.svg" />
    </button>
    <div className="absolute" style={{ left: u(32.96), top: u(80.82), width: u(68.056), height: 0 }}>
      <div className="absolute" style={{ inset: `${u(-0.53)} 0` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="block size-full max-w-none" src="/assets/figma/river/popup-divider.svg" />
      </div>
    </div>
    <p
      className="absolute font-ui font-normal text-white overflow-hidden break-words"
      style={{
        left: u(29.77),
        top: u(98.5),
        width: u(289.239),
        maxHeight: u(145),
        fontSize: u(15.958),
        lineHeight: 1.2816,
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical",
      }}
    >
      {wish.content}
    </p>
  </>
);
