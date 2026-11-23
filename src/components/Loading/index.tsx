import { Layer, Moon, Stage, TealSky, u } from "@components/ui";

/** Route loading screen: the teal sky with the moon and a gently pulsing "กำลังโหลด...". */
export function CatLoading() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-sky-bottom" role="status" aria-live="polite" aria-label="กำลังโหลด">
      <TealSky />
      <Stage>
        <div className="absolute inset-0 animate-pulse motion-reduce:animate-none">
          <Moon glow={{ x: 60, y: 213, size: 253 }} body={{ x: 59, y: 209, size: 257 }} />
        </div>
        <Layer x={0} y={510} w={375}>
          <p
            className="animate-pulse motion-reduce:animate-none text-center text-white font-ui font-light"
            style={{ fontSize: u(22), lineHeight: "normal" }}
          >
            กำลังโหลด...
          </p>
        </Layer>
      </Stage>
    </div>
  );
}
