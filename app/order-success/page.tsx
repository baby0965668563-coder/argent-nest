"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">☁️</p>

        <h1 className="mt-5 text-2xl font-semibold text-[#4b4038]">
          訂單已送出
        </h1>

        <p className="mt-3 leading-7 text-[#6b5c50]">
          謝謝你的訂購 🤍
          <br />
          闆娘確認訂單後會再與你聯繫。
        </p>

        <p className="mt-4 rounded-2xl bg-[#fff7ef] px-4 py-3 text-sm leading-6 text-[#9b6b4f]">
          若有急單、修改款式、合併出貨需求，
          可以直接私訊 LINE 詢問。
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="https://line.me/R/ti/p/@你的LINE官方帳號"
            target="_blank"
            className="block w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
          >
            LINE 詢問
          </a>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-full border border-[#d8c5b0] bg-white py-3 text-sm text-[#6b5c50]"
          >
            回首頁繼續逛
          </button>
        </div>
      </div>
    </main>
  );
}