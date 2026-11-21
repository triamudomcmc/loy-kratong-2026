"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SpeakerMute } from "@components/Vector/mute";
import { SpeakerUnmute } from "@components/Vector/unmute";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Unmuting is remembered per pathname, so every route change resets to muted
  // (the Pages Router did this on routeChangeComplete).
  const [unmutedOn, setUnmutedOn] = useState<string | null>(null);
  const mute = unmutedOn !== pathname;

  useEffect(() => {
    if (audioRef.current !== null) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
    }
  }, []);

  return (
    <div
      onMouseOver={() => {
        audioRef.current?.play().catch(() => {});
      }}
    >
      <audio muted={mute} ref={audioRef} className="song">
        <source src="/assets/audio/music.mp3"></source>
      </audio>
      {children}
      {pathname !== "/capture" && (
        <div className="fixed bottom-0 w-screen z-[99]">
          <div
            className="absolute text-center right-6 bottom-4 cursor-pointer w-[36px] h-[36px]"
            onClick={() => {
              setUnmutedOn(mute ? pathname : null);
            }}
          >
            {mute ? <SpeakerMute className="w-full h-full" /> : <SpeakerUnmute className="w-[80%] h-[80%]" />}
          </div>
        </div>
      )}
    </div>
  );
}
