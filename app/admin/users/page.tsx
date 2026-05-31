"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserItem = {
  id?: string | number;
  name?: string | null;
  phone?: string | null;
  line_id?: string | null;
  vip_level?: string | null;
  created_at?: string | null;
};

export default function AdminUsersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("argent_admin_login");

    if (saved === "true") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const password = prompt("請輸入後台密碼");

    if (password === "argentnest520" || password === "argentnest0223") {
      localStorage.setItem("argent_admin_login", "true");
      setAuthorized(true);
    } else {
      alert("密碼錯誤 ☁️");
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    if (authorized) fetchUsers();
  }, [authorized]);

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      alert("讀取會員失敗：" + error.message);
      return;
    }

    setUsers(data || []);
  }

  async function updateVipLevel(user: UserItem, vipLevel: string) {
    const keyColumn = user.id ? "id" : "line_id";
    const keyValue = user.id || user.line_id;

    if (!keyValue) {
      alert("找不到會員 ID 或 LINE ID，無法更新");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        vip_level: vipLevel,
      })
      .eq(keyColumn, keyValue);

    if (error) {
      alert("更新會員等級失敗：" + error.message);
      return;
    }

    alert(`已更新為 ${vipLevel}`);
    fetchUsers();
  }

  const filteredUsers = users.filter((user) => {
    const keyword = searchText.toLowerCase();

    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.phone?.toLowerCase().includes(keyword) ||
      user.line_id?.toLowerCase().includes(keyword) ||
      user.vip_level?.toLowerCase().includes(keyword)
    );
  });

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        驗證中...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        無權限 ☁️
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-8 text-[#3d3d3d]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
            ADMIN USERS
          </p>

          <h1 className="text-3xl font-bold text-[#4b4038]">
            會員管理後台 ☁️
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            管理 Argent Nest 會員等級
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/admin"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            商品後台
          </a>

          <a
            href="/admin/orders"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            訂單後台
          </a>

          <a
            href="/"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            回首頁
          </a>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("argent_admin_login");
              location.reload();
            }}
            className="rounded-full bg-[#2e2e2e] px-4 py-2 text-sm text-white"
          >
            登出
          </button>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-[#4b4038]">會員列表</h2>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-full bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "讀取中..." : "重新整理"}
          </button>
        </div>

        <input
          className="mb-5 w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
          placeholder="搜尋姓名、電話、LINE ID、會員等級..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="space-y-4">
          {filteredUsers.map((user, index) => {
            const vipLevel = user.vip_level || "NORMAL";

            return (
              <div
                key={user.id || user.line_id || index}
                className="rounded-2xl border bg-[#fffdfb] p-4"
              >
                <div className="mb-4">
                  <p className="text-lg font-bold text-[#4b4038]">
                    {user.name || "未填姓名"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    電話：{user.phone || "未填電話"}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    LINE ID：{user.line_id || "無 LINE ID"}
                  </p>

                  <p className="mt-2 inline-block rounded-full bg-[#f3ebe3] px-4 py-2 text-sm font-bold text-[#6b5c50]">
                    目前等級：{vipLevel}
                  </p>

                  {user.created_at && (
                    <p className="mt-2 text-xs text-gray-400">
                      建立時間：{new Date(user.created_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateVipLevel(user, "NORMAL")}
                    className={`rounded-full border py-3 text-sm ${
                      vipLevel === "NORMAL"
                        ? "bg-[#3f332b] text-white"
                        : "bg-white text-[#6b5c50]"
                    }`}
                  >
                    改回 NORMAL
                  </button>

                  <button
                    type="button"
                    onClick={() => updateVipLevel(user, "VIP")}
                    className={`rounded-full border py-3 text-sm ${
                      vipLevel === "VIP"
                        ? "bg-[#b07255] text-white"
                        : "bg-white text-[#b07255]"
                    }`}
                  >
                    設為 VIP
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filteredUsers.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              目前沒有會員資料
            </p>
          )}
        </div>
      </div>
    </main>
  );
}