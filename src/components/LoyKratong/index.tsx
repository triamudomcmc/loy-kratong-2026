"use client";

import type { FC } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ResultData } from "@types-app/kratong";
import { RiverScene } from "./river";

export const LoyKratongPage: FC<{ entities: ResultData[] }> = ({ entities }) => {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage?.getItem("entity")) {
      router.push("/");
    }
  }, [router]);

  return (
    <article>
      <RiverScene entities={entities} />
    </article>
  );
};
