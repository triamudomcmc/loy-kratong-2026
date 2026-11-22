import { SalaFrontBG } from "@components/Background";
import { principalCls } from "@components/kratong-classes";
import { Create } from "./create";
import type { PrincipalKratongData } from "@types-app/kratong";

export const PrincipalPage = ({ id, data }: { id: string; data: PrincipalKratongData }) => {
  return (
    <article className={principalCls.scene}>
      <SalaFrontBG />
      <Create id={id} idata={data} />
    </article>
  );
};
