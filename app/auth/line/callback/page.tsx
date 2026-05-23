"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LineCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    handleLineCallback();
  }, []);

  async function handleLineCallback() {
    try {
      const params = new URLSearchParams(window.location.search);

      const code = params.get("code");
      const state = params.get("state");
      const savedState = localStorage.getItem("line_login_state");

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

      const tokenResponse = await fetch("/api/line/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          redirectUri: `${window.location.origin}/auth/line/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error(tokenData);
        alert("LINE 登入失敗，無法取得 token");
        router.push("/login");
        return;
      }

      const profileResponse = await fetch("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const profile = await profileResponse.json();

      if (!profile?.userId) {
        alert("LINE 登入失敗，無法取得會員資料");
        router.push("/login");
        return;
      }

      const userPayload = {
        line_user_id: profile.userId,
        name: profile.displayName || "",
        avatar_url: profile.pictureUrl || "",
      };

      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("line_user_id", profile.userId)
        .maybeSingle();

      if (existingUser) {
        await supabase
          .from("users")
          .update({
            name: userPayload.name,
            avatar_url: userPayload.avatar_url,
          })
          .eq("line_user_id", profile.userId);
      } else {
        await supabase.from("users").insert([
          {
            ...userPayload,
            is_vip: false,
            level: "normal",
          },
        ]);
      }

      const { data: finalUser } = await supabase
        .from("users")
        .select("*")
        .eq("line_user_id", profile.userId)
        .maybeSingle();

      localStorage.setItem(
        "argent_user",
        JSON.stringify(finalUser || userPayload)
      );

      localStorage.removeItem("line_login_state");

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("LINE 登入失敗，請稍後再試");
      router.push("/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4">
      <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">☁️</div>

        <h1 className="mt-5 text-2xl font-bold text-[#4b4038]">
          LINE 登入中...
        </h1>

        <p className="mt-3 text-sm text-[#8c7b70]">
          正在幫妳同步會員資料
        </p>
      </div>
    </main>
  );
}
