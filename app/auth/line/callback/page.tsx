"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LineCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    handleLineLogin();
  }, []);

  async function handleLineLogin() {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const code = params.get("code");
      const state = params.get("state");

      const savedState =
        localStorage.getItem(
          "line_login_state"
        );

      if (!code || !state) {
        alert("LINE 登入失敗");
        router.push("/login");
        return;
      }

      if (state !== savedState) {
        alert("登入驗證失敗");
        router.push("/login");
        return;
      }

      const response = await fetch(
        "https://api.line.me/oauth2/v2.1/token",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri:
              `${window.location.origin}/auth/line/callback`,
            client_id:
              process.env
                .NEXT_PUBLIC_LINE_CHANNEL_ID || "",
            client_secret:
              process.env
                .NEXT_PUBLIC_LINE_CHANNEL_SECRET || "",
          }),
        }
      );

      const tokenData =
        await response.json();

      const profileResponse =
        await fetch(
          "https://api.line.me/v2/profile",
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        );

      const profile =
        await profileResponse.json();

      const userData = {
        line_user_id: profile.userId,
        name: profile.displayName,
        picture: profile.pictureUrl,
      };

      await supabase
        .from("users")
        .upsert(userData, {
          onConflict: "line_user_id",
        });

      localStorage.setItem(
        "argent_user",
        JSON.stringify(userData)
      );

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("LINE 登入失敗");
      router.push("/login");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4">
      <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">☁️</div>

        <h1 className="mt-5 text-2xl font-bold text-[#4b4038]">
          LINE 登入中...
        </h1>

        <p className="mt-3 text-sm text-[#8c7b70]">
          正在幫妳登入會員
        </p>
      </div>
    </main>
  );
}
