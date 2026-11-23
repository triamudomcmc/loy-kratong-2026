import { Logo } from "./logo";
import { u } from "./frame";

const DESKTOP_SCALE = 254 / 102;

/**
 * Logo header (Figma Nav 91:459 mobile, nav-desktop 91:505).
 * - default: absolutely positioned inside a <Frame> (uses the frame's `--u`).
 * - `fixed`: viewport-fixed header for ordinary pages; sets its own `--u`
 *   (mobile width min(100vw,430px) below `lg`, 100vw / 1440 at `lg`+).
 */
export function NavHeader({ fixed = false, desktop = false }: { fixed?: boolean; desktop?: boolean }) {
  if (fixed) {
    return (
      <header className="nav-fixed">
        <div className="absolute lg:hidden" style={{ left: u(24), top: u(19) }}>
          <Logo />
        </div>
        <div className="absolute hidden lg:block" style={{ left: u(37), top: u(34) }}>
          <Logo scale={DESKTOP_SCALE} />
        </div>
      </header>
    );
  }
  return (
    <div className="absolute left-0 top-0 w-full" style={{ height: u(desktop ? 100 : 52) }}>
      <div className="absolute" style={desktop ? { left: u(37), top: u(34) } : { left: u(24), top: u(19) }}>
        <Logo scale={desktop ? DESKTOP_SCALE : 1} />
      </div>
    </div>
  );
}
