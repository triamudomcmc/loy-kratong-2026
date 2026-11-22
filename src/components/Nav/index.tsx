"use client";

import type { ResultData } from "@types-app/kratong";
import { ArrowDownTrayIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  return (
    <header className="flex w-full px-6 py-6 fixed top-0 left-0 z-[99]">
      <nav className="max-w-[124px]">
        <Image src="/assets/images/logo.png" width={1024} height={169} alt="โลโก้ กช." />
      </nav>
    </header>
  );
}

export function NavLoy() {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [prevEntity, setPrevEntity] = useState<undefined | ResultData>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available after mount
    setPrevEntity(JSON.parse(localStorage.getItem("entity") || "{}"));
  }, []);

  const onClick = async () => {
    if (!prevEntity || waiting) return;
    const imgUrl = `/api/capture?data=${encodeURIComponent(JSON.stringify(prevEntity))}`;

    setWaiting(true);

    const res = await fetch(imgUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (res.ok) {
      const { default: InApp } = await import("detect-inapp");
      const inapp = new InApp(navigator.userAgent || navigator.vendor);
      if (inapp.browser === "line" || inapp.browser === "messenger" || inapp.browser === "facebook") {
        const a = document.createElement("a");
        a.href = imgUrl;
        a.download = `loykratong.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(await res.blob());
        a.download = `loykratong.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }

    setWaiting(false);
  };

  const move = () => {
    localStorage.removeItem("entity");
    localStorage.removeItem("entityId");
    localStorage.removeItem("released");

    router.push("/create");
  };

  return (
    <header className="flex justify-between items-center w-screen px-6 py-6 fixed top-0 left-0 z-[99]">
      <div onClick={move} className="fixed bottom-6">
        <h1 className="text-sm text-white font-ui flex space-x-2">
          <ArrowLeftIcon className="w-5 h-5" /> <span>สร้างกระทงเพิ่ม</span>
        </h1>
      </div>
      <nav className="max-w-[124px]">
        <Image src="/assets/images/logo.png" width={1024} height={169} alt="โลโก้ กช." />
      </nav>
      <div
        onClick={onClick}
        className="flex text-[12px] cursor-pointer sm:text-sm hover:bg-gray-600 transition-colors rounded-full border text-white border-white bg-[#051018] px-6 py-2 space-x-1 font-light"
      >
        <ArrowDownTrayIcon className="sm:w-5 sm:h-5 h-4 w-4" />
        <span className="font-ui">{waiting ? "กำลังโหลด..." : "บันทึกภาพกระทง"}</span>
      </div>
    </header>
  );
}
