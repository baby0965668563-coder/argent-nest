"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  function handleLogin() {
    if (!ADMIN_PASSWORD) {
      setError("尚未設定後台密碼");
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setError("密碼錯誤");
      return;
    }

    localStorage.setItem("argent_admin_login", "true");

    router.push("/admin/orders");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#4b4038]">
          後台登入
        </h1>

        <p className="mt-2 text-sm text-[#9b8b7c]">
          請輸入管理員密碼
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="管理員密碼"
          className="mt-5 w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
        />

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="mt-5 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
        >
          登入後台
        </button>
      </div>
    </main>
  );
}