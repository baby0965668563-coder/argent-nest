"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("argent_user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    } catch {
      localStorage.removeItem("argent_user");
      router.push("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("argent_user");
    alert("已登出 ☁️");
    router.push("/");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-[#6b5c50]">會員載入中...</p>
      </main>
    );
  }

  const isVip = user?.is_vip === true || user?.level === "vip";

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="bg-[#f6efe7] px-6 py-8 text-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
              />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl">
                ☁️
              </div>
            )}

            <h1 className="mt-4 text-2xl font-semibold text-[#4b4038]">
              {user.name || "Argent Nest Member"}
            </h1>

            <p className="mt-2 text-sm text-[#8c7b70]">
              Argent Nest 會員中心
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-3xl bg-[#faf7f2] p-5">
              <p className="text-sm text-[#8c7b70]">會員等級</p>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#4b4038]">
                  {isVip ? "VIP MEMBER" : "NORMAL MEMBER"}
                </p>

                {isVip && (
                  <span className="rounded-full bg-[#fff2e5] px-3 py-1 text-xs font-medium text-[#b07255]">
                    VIP ☁️
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-[#faf7f2] p-5">
              <p className="text-sm text-[#8c7b70]">LINE User ID</p>

              <p className="mt-2 break-all text-sm text-[#4b4038]">
                {user.line_user_id || "-"}
              </p>
            </div>

            {user.email && (
              <div className="rounded-3xl bg-[#faf7f2] p-5">
                <p className="text-sm text-[#8c7b70]">Email</p>

                <p className="mt-2 text-sm text-[#4b4038]">
                  {user.email}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-sm font-medium text-[#6b5c50]"
            >
              返回首頁
            </button>

            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="w-full rounded-full bg-[#f6f1ea] py-4 text-sm font-medium text-[#6b5c50]"
            >
              我的訂單
            </button>

            <button
              type="button"
              onClick={() => router.push("/wishlist")}
              className="w-full rounded-full bg-[#fff2e5] py-4 text-sm font-medium text-[#b07255]"
            >
              我的收藏
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
            >
              登出會員
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}