import type { FC } from "react";
import { Create } from "./create";
import type { KratongData } from "@types-app/kratong";

export const KratongPage: FC<{ data?: KratongData | null }> = ({ data }) => {
  return (
    <article>
      <Create idata={data} />
    </article>
  );
};
