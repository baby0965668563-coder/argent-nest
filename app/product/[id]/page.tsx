import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!product) {
    return <div className="p-10">找不到商品</div>;
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#2e2e2e]">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd4]/60 bg-[#f8f5f0]/85 px-5 py-4 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            Argent Nest <span>🥛</span>
          </a>

          <a href="/" className="text-sm text-[#8b6f5c] transition hover:text-[#2e2e2e]">
            ← 回首頁
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="relative">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-[2rem] bg-[#ede6dd] shadow-[0_8px_48px_rgba(0,0,0,0.10)]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover md:aspect-[4/5]"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-7xl md:aspect-[4/5]">
                    🏷️
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.category && (
                  <span className="rounded-full bg-[#ede6dd] px-3 py-1 text-xs font-medium text-[#8b6f5c]">
                    {product.category}
                  </span>
                )}

                <span className="rounded-full bg-[#2e2e2e] px-3 py-1 text-xs font-medium text-white">
                  預購商品
                </span>

                <span className="rounded-full border border-[#d8c5b0] px-3 py-1 text-xs text-[#a08060]">
                  14–21天出貨
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              {product.category && (
                <p className="mb-2 text-[11px] uppercase tracking-[0.4em] text-[#a08060]">
                  {product.category}
                </p>
              )}

              <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl lg:text-4xl">
                {product.name}
              </h1>
            </div>

            <p className="text-3xl font-bold text-[#2e2e2e]">
              NT$ {Number(product.price).toLocaleString()}
            </p>

            {product.description && (
              <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#a08060]">
                  商品說明
                </p>

                <p className="text-[14px] leading-[1.9] text-[#5c5c5c]">
                  {product.description}
                </p>
              </div>
            )}

            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-[#06C755] py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(6,199,85,0.35)] transition-all duration-200 hover:scale-[1.02]"
            >
              私訊 LINE 詢問 / 下單
            </a>

            <div className="rounded-[1.5rem] border border-[#e8ddd4] bg-[#fdf9f6] p-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#a08060]">
                購買須知
              </p>

              <ul className="space-y-2.5 text-[13px] leading-relaxed text-[#6b5c50]">
                <li>• 全館為預購商品，下單後請耐心等候</li>
                <li>• 預計出貨時間約 14–21 天，不含假日與連續假期</li>
                <li>• 無法配合等待時間，請勿下單</li>
                <li>• 商品顏色以實物為準，螢幕色差請見諒</li>
                <li>• 下單後如有疑問，請透過 LINE 聯繫我們</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-[#e8ddd4] px-5 py-8 text-center text-xs text-[#b0a090]">
        <p>© 2026 Argent Nest 🥛🤍 · 韓系療癒選物</p>
      </footer>
    </main>
  );
}