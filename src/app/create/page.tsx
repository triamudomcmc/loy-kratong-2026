import { KratongPage } from "@components/Kratong";
import { getPorOarKratong } from "@server/queries";
import type { KratongData } from "@types-app/kratong";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await searchParams;
  const data = typeof id === "string" ? ((await getPorOarKratong(id)) as KratongData | null) : null;

  return (
    <KratongPage data={data} />
  );
}
