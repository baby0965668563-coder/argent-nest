"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const [authorized, setAuthorized] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [users, setUsers] =
    useState<any[]>([]);

  const [searchText, setSearchText] =
    useState("");

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "argent_admin_login"
      );

    if (saved === "true") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const password = prompt(
      "請輸入後台密碼"
    );

    if (
      password ===
      "argentnest520"
    ) {
      localStorage.setItem(
        "argent_admin_login",
        "true"
      );

      setAuthorized(true);
    } else {
      alert("密碼錯誤 ☁️");
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchUsers();
    }
  }, [authorized]);

  async function fetchUsers() {
    const { data } =
      await supabase
        .from("users")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    setUsers(data || []);
  }

  async function toggleVip(
    user: any
  ) {
    const nextVip =
      !user.is_vip;

    const { error } =
      await supabase
        .from("users")
        .update({
          is_vip: nextVip,

          level: nextVip
            ? "vip"
            : "normal",
        })
        .eq("id", user.id);

    if (error) {
      alert(
        "VIP 修改失敗"
      );

      return;
    }

    fetchUsers();
  }

  const filteredUsers =
    users.filter((user) => {
      const keyword =
        searchText.toLowerCase();

      return (
        user.name
          ?.toLowerCase()
          .includes(keyword) ||
        user.email
          ?.toLowerCase()
          .includes(keyword) ||
        user.line_user_id
          ?.toLowerCase()
          .includes(keyword)
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              會員管理
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Argent Nest
              會員系統
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-full border px-4 py-2 text-sm"
          >
            返回後台
          </a>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <input
            className="mb-6 w-full rounded-2xl border p-4"
            placeholder="搜尋會員名稱 / LINE ID"
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
          />

          <div className="space-y-4">
            {filteredUsers.map(
              (user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border bg-[#fffdfb] p-5"
                >
                  <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                      <img
                        src={
                          user.avatar_url
                        }
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee8] text-2xl">
                        ☁️
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-bold">
                        {user.name ||
                          "未命名會員"}
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        {user.line_user_id}
                      </p>

                      {user.email && (
                        <p className="mt-1 text-xs text-gray-500">
                          {
                            user.email
                          }
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.is_vip ? (
                          <span className="rounded-full bg-[#fff2e5] px-3 py-1 text-xs text-[#b07255]">
                            VIP MEMBER
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-xs text-gray-600">
                            NORMAL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() =>
                        toggleVip(
                          user
                        )
                      }
                      className={`w-full rounded-full py-3 text-sm text-white ${
                        user.is_vip
                          ? "bg-[#2e2e2e]"
                          : "bg-[#b07255]"
                      }`}
                    >
                      {user.is_vip
                        ? "取消 VIP"
                        : "設為 VIP"}
                    </button>
                  </div>
                </div>
              )
            )}

            {filteredUsers.length ===
              0 && (
              <p className="py-10 text-center text-sm text-gray-400">
                目前沒有會員
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}