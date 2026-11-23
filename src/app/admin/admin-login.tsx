"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@server/admin";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    start(async () => {
      const res = await adminLogin(formData);
      if (res.status) router.refresh();
      else
        setError(
          res.report === "wrong_password"
            ? "รหัสผ่านไม่ถูกต้อง"
            : res.report === "disabled"
              ? "ยังไม่ได้ตั้งค่ารหัสผ่านผู้ดูแล"
              : "กรุณากรอกรหัสผ่าน",
        );
    });
  };

  return (
    <main data-scene="plain" className="font-ui flex min-h-dvh items-center justify-center px-5 py-10 text-[#1f2a30]">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-medium text-[#004b64]">ตรวจสอบระบบ</h1>
        <p className="mt-1 text-sm text-slate-500">เข้าสู่ระบบเพื่อจัดการกระทงที่ส่งเข้ามา</p>
        {configured ? (
          <form action={submit} className="mt-5 flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="password">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="h-11 rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-[#1286b1] focus:ring-2 focus:ring-[#4ed1d8]/50"
            />
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg bg-[#004b64] text-base font-medium text-white transition hover:bg-[#003a4e] disabled:opacity-60"
            >
              {pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
            </button>
          </form>
        ) : (
          <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            ปิดการเข้าสู่ระบบอยู่ เนื่องจากยังไม่ได้ตั้งค่า <code className="font-mono">ADMIN_PASSWORD</code>{" "}
            ในตัวแปรสภาพแวดล้อมของเซิร์ฟเวอร์
          </p>
        )}
      </div>
    </main>
  );
}
