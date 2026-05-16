import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#2e2e2e]">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd4]/60 bg-[#f8f5f0]/85 px-5 py-4 backdrop-blur-md md:px-10 md:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Argent Nest</span>
            <span className="text-lg">🥛</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-[#6b5c50] md:flex">
            <a href="#hot">新品</a>
            <a href="#hot">熱賣</a>
            <a href="#categories">分類</a>
            <a href="/admin" className="rounded-full border border-[#c9b8a8] px-4 py-1.5 text-xs">
              管理後台
            </a>
          </nav>

          <a href="/admin" className="rounded-full border border-[#c9b8a8] px-3 py-1 text-xs md:hidden">
            後台
          </a>
        </div>
      </header>

     <section className="px-5 py-8 md:px-10 md:py-12">
  <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#ede6dd]">
    <div className="grid items-center gap-10 px-8 py-16 md:grid-cols-2 md:px-16 md:py-24">
      
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#a08060]">
          Healing Select Shop
        </p>

        <h2 className="mb-6 text-5xl font-bold leading-[1.15] tracking-tight md:text-6xl">
          Welcome to
          <br />
          Argent Nest 🥛🤍
        </h2>

        <p className="mb-8 max-w-md text-[15px] leading-8 text-[#6b5c50]">
          把讓人心情變好的東西，
          都放進這裡了。
          <br />
          韓系療癒選物・女孩日常・微辣穿搭 ☁️
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#hot"
            className="rounded-full bg-[#2e2e2e] px-8 py-4 text-sm font-medium text-white transition hover:scale-105"
          >
            開始逛逛
          </a>

          <a
            href="#categories"
            className="rounded-full border border-[#c9b8a8] px-8 py-4 text-sm font-medium text-[#6b5c50]"
          >
            探索分類
          </a>
        </div>
      </div>

      <div className="relative flex justify-center">
        <div className="relative overflow-hidden rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop"
            alt="Argent Nest"
            className="h-[520px] w-full object-cover md:w-[420px]"
          />
        </div>

        <div className="absolute bottom-5 left-0 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
          <p className="text-xs tracking-[0.2em] text-[#a08060]">
            GIRL'S LITTLE WORLD ☁️
          </p>
        </div>
      </div>

    </div>
  </div>
</section>
      
      <section id="hot" className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.35em] text-[#a08060]">Collection</p>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">熱賣商品</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products?.map((product) => (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f0ebe4]">
                  {product.category && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium text-[#8b6f5c]">
                      {product.category}
                    </div>
                  )}

                  <div className="absolute right-3 top-3 z-10 rounded-full bg-[#2e2e2e] px-2.5 py-1 text-[10px] font-medium text-white">
                    HOT
                  </div>

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🏷️</div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
                  <h4 className="line-clamp-2 text-[13px] font-medium leading-[1.55] md:text-sm">
                    {product.name}
                  </h4>

                  {product.description && (
                    <p className="line-clamp-2 text-[11px] leading-[1.6] text-[#9e8e82] md:text-xs">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <p className="text-base font-bold md:text-lg">
                      NT$ {Number(product.price).toLocaleString()}
                    </p>

                    <span className="rounded-full bg-[#f3ede6] px-3 py-1.5 text-[11px] font-medium text-[#8b6f5c]">
                      查看 →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-10 text-2xl font-bold tracking-tight md:text-3xl">精選分類</h3>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <a href="#hot" className="rounded-[1.5rem] bg-[#fdf3ec] px-4 py-8 text-center shadow-sm">
              <span className="mb-3 block text-4xl">🧸</span>
              <p className="text-sm font-semibold">療癒娃娃</p>
            </a>

            <a href="#hot" className="rounded-[1.5rem] bg-[#f0ece8] px-4 py-8 text-center shadow-sm">
              <span className="mb-3 block text-4xl">👗</span>
              <p className="text-sm font-semibold">韓系穿搭</p>
            </a>

            <a href="#hot" className="rounded-[1.5rem] bg-[#faeef4] px-4 py-8 text-center shadow-sm">
              <span className="mb-3 block text-4xl">🎀</span>
              <p className="text-sm font-semibold">飾品小物</p>
            </a>

            <a href="#hot" className="rounded-[1.5rem] bg-[#fef8ec] px-4 py-8 text-center shadow-sm">
              <span className="mb-3 block text-4xl">🍰</span>
              <p className="text-sm font-semibold">甜點系列</p>
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#ede6dd] px-8 py-16 text-center md:px-16">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#a08060]">About</p>
          <h3 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">
            把日常變得可愛一點 🌸
          </h3>
          <p className="mx-auto max-w-lg text-[14px] leading-[2] text-[#6b5c50]">
            這裡是闆娘親自挑選的療癒小天地，<br />
            從韓系穿搭、卡通萌物、甜點到女孩日常小物，<br />
            希望妳每次逛進來，都能找到一點讓心情變好的東西。
          </p>
        </div>
      </section>

      <footer className="border-t border-[#e8ddd4] px-5 py-8 text-center text-xs text-[#b0a090] md:px-10">
        <p>© 2026 Argent Nest 🥛🤍 · 韓系療癒選物</p>
      </footer>
    </main>
  );
}
