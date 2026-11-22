"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("entityId");
    const story = localStorage.getItem("story");

    if (story === "done") {
      router.push("/create");
    }
    if (id === "" || !id) return;

    // intentional full page load, as before
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/loykratong";
  }, [router]);

  return null;
}
