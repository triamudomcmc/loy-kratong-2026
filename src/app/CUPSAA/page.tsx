import { redirect } from "next/navigation";
import { CUPSAAPage } from "@components/CUPSAA";
import { getPorOarKratong } from "@server/queries";
import type { CupsaaKratongData } from "@types-app/kratong";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await searchParams;
  if (typeof id !== "string") redirect("/error");

  const data = ((await getPorOarKratong(id)) ?? {}) as CupsaaKratongData;

  return (
    <CUPSAAPage id={id} data={data} />
  );
}
