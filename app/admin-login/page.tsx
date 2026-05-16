"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (password === "argentnest520") {
      localStorage.setItem("argent_admin_login", "true");
      window.location.href = "/admin";
    } else {
      alert("密碼錯誤 ☁️");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-sm">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#a08060]">
          Argent Nest
        </p>

        <h1 className="mb-6 text-3xl font-bold">
          後台登入 ☁️
        </h1>

        <input
          type="password"
          placeholder="請輸入後台密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-2xl border p-4"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-full bg-black py-4 text-white"
        >
          進入後台
        </button>
      </div>
    </main>
  );
}