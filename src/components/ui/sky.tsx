/** Teal sky gradient (Figma frames ปก / Scene 1-4: 183.82deg, Scene 17: 181.26deg). */
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
