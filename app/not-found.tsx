export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f0] px-5">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 text-center shadow-sm">
        <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#a08060]">
          404 NOT FOUND
        </p>

        <h1 className="text-4xl font-black tracking-tight text-[#2e2e2e]">
          找不到這個頁面 ☁️
        </h1>

        <p className="mt-5 text-sm leading-8 text-[#8b7b6e]">
          可能商品已下架、網址錯誤，
          <br />
          或是這個小角落偷偷消失了。
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="/"
            className="rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
          >
            回首頁繼續逛逛 ☁️
          </a>

          <a
            href="https://line.me/R/ti/p/@929santn"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#d8c5b0] bg-white py-4 text-sm font-medium text-[#6b5c50]"
          >
            LINE 詢問闆娘
          </a>
        </div>
      </div>
    </main>
  );
}