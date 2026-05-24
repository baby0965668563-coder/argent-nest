"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    liff?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    initLiff();
  }, []);

  function loadLiffScript() {
    return new Promise<void>(
      (resolve, reject) => {
        if (window.liff) {
          resolve();
          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://static.line-scdn.net/liff/edge/2/sdk.js";

        script.onload = () =>
          resolve();

        script.onerror = () =>
          reject(
            new Error(
              "LIFF SDK 載入失敗"
            )
          );

        document.body.appendChild(
          script
        );
      }
    );
  }

  async function initLiff() {
    try {
      const liffId =
        process.env
          .NEXT_PUBLIC_LIFF_ID;

      if (!liffId) return;

      await loadLiffScript();

      await window.liff.init({
        liffId,
      });

      // LINE APP 裡已登入
      if (
        window.liff.isLoggedIn()
      ) {
        await handleLiffLogin();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLiffLogin() {
    try {
      setLoading(true);

      setMessage(
        "正在登入會員..."
      );

      const profile =
        await window.liff.getProfile();

      const userPayload = {
        line_user_id:
          profile.userId,

        name:
          profile.displayName ||
          "",

        avatar_url:
          profile.pictureUrl ||
          "",
      };

      // upsert user
      await supabase
        .from("users")
        .upsert(
          [
            {
              ...userPayload,
            },
          ],
          {
            onConflict:
              "line_user_id",
          }
        );

      // 重新抓完整會員資料
      const {
        data: finalUser,
      } = await supabase
        .from("users")
        .select("*")
        .eq(
          "line_user_id",
          profile.userId
        )
        .single();

      localStorage.setItem(
        "argent_user",
        JSON.stringify(
          finalUser ||
            userPayload
        )
      );

      router.push("/member");
    } catch (err) {
      console.error(err);

      alert(
        "LINE 登入失敗"
      );

      setLoading(false);
    }
  }

  async function loginWithLine() {
    try {
      setLoading(true);

      const liffId =
        process.env
          .NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        alert(
          "尚未設定 LIFF ID"
        );
        return;
      }

      await loadLiffScript();

      await window.liff.init({
        liffId,
      });

      if (
        !window.liff.isLoggedIn()
      ) {
        window.liff.login({
          redirectUri:
            window.location.href,
        });

        return;
      }

      await handleLiffLogin();
    } catch (err) {
      console.error(err);

      alert(
        "LINE 登入失敗"
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-5xl">
            🤍
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#4b4038]">
            Argent Nest
            會員登入
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#8c7b70]">
            使用 LINE
            登入後，
            <br />
            可查看會員優惠與
            VIP 價格 ☁️
          </p>

          {message && (
            <div className="mt-5 rounded-2xl bg-[#f8f3ec] px-4 py-3 text-sm text-[#8c7b70]">
              {message}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={
            loginWithLine
          }
          disabled={loading}
          className="mt-8 w-full rounded-full bg-[#06c755] py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "登入中..."
            : "使用 LINE 登入"}
        </button>

        <a
          href="/"
          className="mt-4 block w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-center text-sm text-[#6b5c50]"
        >
          回首頁
        </a>

        <div className="mt-8 rounded-3xl bg-[#f8f3ec] p-5">
          <p className="text-sm leading-7 text-[#8c7b70]">
            ☁️ 會員功能包含：
            <br />
            ・VIP 價格
            <br />
            ・會員優惠
            <br />
            ・未來收藏同步
            <br />
            ・訂單紀錄
          </p>
        </div>
      </div>
    </main>
  );
}