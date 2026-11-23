/** Blue sky gradient of every new frame (ปก 187:430, Scene 19 bg 187:566, Scene 22 ...): 183.82deg, #4ed1d8 -> #1286b1 at 52.758%. */
export function TealSky({ desktop = false }: { desktop?: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${
          desktop ? "181.2578deg" : "183.8249deg"
        }, var(--color-sky-top) 1.4976%, var(--color-sky-mid) 25.649%, var(--color-sky-bottom) 52.758%)`,
      }}
    />
  );
}

/** Alias: the sky is blue now; `TealSky` is kept so every existing import keeps working. */
export const BlueSky = TealSky;
