import { Create } from "./create";
import type { CupsaaKratongData } from "@types-app/kratong";

export const CUPSAAPage = ({ id, data }: { id: string; data: CupsaaKratongData }) => {
  return (
    <article>
      <Create id={id} idata={data} />
    </article>
  );
};
