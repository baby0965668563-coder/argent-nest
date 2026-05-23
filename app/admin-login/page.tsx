"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    if (password === "argentnest520") {
      localStorage.setItem("argent_admin_login", "true");
      router.push("/admin");
      return;
    }

    setError("密碼錯誤，請再確認一次 ☁️");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-5xl">🥛</div>

          <h1 className="mt-5 text-3xl font-bold text-[#4b4038]">
            Argent Nest 後台登入
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#8c7b70]">
            請輸入後台密碼進入管理頁面。
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="請輸入後台密碼"
            className="w-full rounded-2xl border border-[#cdb9a8] bg-white px-4 py-4 text-sm text-[#3f332b] placeholder:text-[#9b8b80] outline-none"
          />

          {error && (
            <p className="text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-semibold text-white"
          >
            進入後台
          </button>

          <a
            href="/"
            className="block w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-center text-sm text-[#6b5c50]"
          >
            回首頁
          </a>
        </div>
      </div>
    </main>
  );
}
