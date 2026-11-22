import { SalaFrontBG } from "@components/Background";
import { cupsaaCls } from "@components/kratong-classes";
import { Create } from "./create";
import type { CupsaaKratongData } from "@types-app/kratong";

export const CUPSAAPage = ({ id, data }: { id: string; data: CupsaaKratongData }) => {
  return (
    <article className={cupsaaCls.scene}>
      <SalaFrontBG />
      <Create id={id} idata={data} />
    </article>
  );
};
