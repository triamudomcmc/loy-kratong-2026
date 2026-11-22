import { LoyKratongPage } from "@components/LoyKratong";
import { NavLoy } from "@components/Nav";
import { getSceneEntities } from "@server/queries";
import type { ResultData } from "@types-app/kratong";

// Reads Firestore on every request.
export const dynamic = "force-dynamic";

export default async function LoyKratong() {
  const entities = (await getSceneEntities()) as ResultData[];

  return (
    <>
      <NavLoy />
      <LoyKratongPage entities={entities} />
    </>
  );
}
