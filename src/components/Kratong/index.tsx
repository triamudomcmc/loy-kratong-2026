import type { FC } from "react";
import { SalaFrontBG } from "@components/Background";
import { Create } from "./create";
import type { KratongData } from "@types-app/kratong";

export const KratongPage: FC<{ data?: KratongData | null }> = ({ data }) => {
  return (
    <article>
      <SalaFrontBG />
      <Create idata={data} />
    </article>
  );
};
