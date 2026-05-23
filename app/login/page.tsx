"use client";

export default function LoginPage() {
  function loginWithLine() {
    const channelId =
      process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;

    const redirectUri =
      `${window.location.origin}/auth/line/callback`;

    const state = crypto.randomUUID();

    localStorage.setItem(
      "line_login_state",
      state
    );

    const url =
      "https://access.line.me/oauth2/v2.1/authorize" +
      `?response_type=code` +
      `&client_id=${channelId}` +
      `&redirect_uri=${encodeURIComponent(
        redirectUri
      )}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(
        "profile openid"
      )}`;

    window.location.href = url;
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-5xl">🤍</div>

          <h1 className="mt-5 text-3xl font-bold text-[#4b4038]">
            Argent Nest 會員登入
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#8c7b70]">
            使用 LINE 登入後，
            <br />
            可查看會員優惠與 VIP 價格 ☁️
          </p>
        </div>

        <button
          type="button"
          onClick={loginWithLine}
          className="mt-8 w-full rounded-full bg-[#06c755] py-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          使用 LINE 登入
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
