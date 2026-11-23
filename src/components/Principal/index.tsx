import { Create } from "./create";
import type { PrincipalKratongData } from "@types-app/kratong";

export const PrincipalPage = ({ id, data }: { id: string; data: PrincipalKratongData }) => {
  return (
    <article>
      <Create id={id} idata={data} />
    </article>
  );
};
