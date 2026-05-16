import { supabase } from "@/lib/supabase";

interface Props {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const keyword = q?.trim() || "";

 let query = supabase
  .from("products")
  .select("*")
  .eq("is_active", true)
  .order("sort_order", { ascending: true })
  .order("id", { ascending: false });

  if (category && category !== "全部") {
    query = query.eq("category", category);
  }

  if (keyword) {
    query = query.or(
      `name.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`
    );
  }

  const { data: products } = await query;

  const allProductsQuery = await supabase
  .from("products")
  .select("*")
  .eq("is_active", true)
  .order("sort_order", { ascending: true })
  .order("id", { ascending: false });
  
  const allProducts = allProductsQuery.data || [];
  const displayProducts = products || [];

  const categories = [
    { label: "全部", emoji: "☁️", desc: "全部商品" },
    { label: "療癒娃娃", emoji: "🧸", desc: "把小小快樂帶回家。" },
    { label: "微辣穿搭", emoji: "👗", desc: "韓系慵懶感女孩日常。" },
    { label: "女孩小物", emoji: "🎀", desc: "飾品、包包與日常可愛。" },
    { label: "甜點研究所", emoji: "🍰", desc: "屬於甜甜日常的小角落。" },
  ];

  function categoryHref(label: string) {
    const params = new URLSearchParams();

    if (label !== "全部") params.set("category", label);
    if (keyword) params.set("q", keyword);

    const queryString = params.toString();
    return queryString ? `/?${queryString}#hot` : "/#hot";
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#2e2e2e]">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd4]/70 bg-[#f8f5f0]/90 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            Argent Nest 🥛🤍
          </a>

          <nav className="flex items-center gap-4 text-sm text-[#6b5c50] md:gap-5">
            <a href="#hot">新品</a>
            <a href="#hot">熱賣</a>
            <a href="#categories">分類</a>
            <a
              href="/admin"
              className="rounded-full border border-[#d8c5b0] px-3 py-1.5 text-xs md:px-4 md:py-2"
            >
              後台
            </a>
          </nav>
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
                把讓人心情變好的東西，都放進這裡了。
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
                  src={
                    allProducts?.[0]?.image ||
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt="Argent Nest"
                  className="h-[520px] w-full object-cover md:w-[420px]"
                />
              </div>

              <div className="absolute bottom-5 left-0 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
                <p className="text-xs tracking-[0.2em] text-[#a08060]">
                  GIRL&apos;S LITTLE WORLD ☁️
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="px-5 pb-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#a08060]">
              Categories
            </p>

            <h3 className="text-3xl font-bold tracking-tight">
              逛逛屬於妳的小世界 ☁️
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#8b7b6e]">
              點分類後，下面商品會自動篩選。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
            {categories.map((cat) => {
              const active =
                (!category && cat.label === "全部") || category === cat.label;

              return (
                <a
                  key={cat.label}
                  href={categoryHref(cat.label)}
                  className={`rounded-[2rem] p-6 transition hover:-translate-y-1 ${
                    active
                      ? "bg-[#2e2e2e] text-white"
                      : "bg-white text-[#2e2e2e]"
                  }`}
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f5f0] text-3xl shadow-sm">
                    {cat.emoji}
                  </div>

                  <h4 className="mb-2 text-lg font-bold">{cat.label}</h4>

                  <p
                    className={`text-sm leading-7 ${
                      active ? "text-white/75" : "text-[#8b7b6e]"
                    }`}
                  >
                    {cat.desc}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="hot" className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#a08060]">
              Popular Picks
            </p>

            <h3 className="text-3xl font-bold tracking-tight">
              {keyword
                ? `搜尋：${keyword} ☁️`
                : category && category !== "全部"
                ? `${category} ☁️`
                : "最近大家都在偷偷收藏 ☁️"}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#8b7b6e]">
              闆娘挑出最近最有療癒感、最想帶回家的小可愛。
            </p>
          </div>

          <form
            action="/"
            className="mb-8 flex flex-col gap-3 rounded-[2rem] bg-white p-4 shadow-sm md:flex-row"
          >
            {category && category !== "全部" && (
              <input type="hidden" name="category" value={category} />
            )}

            <input
              name="q"
              defaultValue={keyword}
              placeholder="搜尋商品名稱，例如：包包、娃娃、衣服"
              className="flex-1 rounded-full border border-[#e8ddd4] px-5 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              className="rounded-full bg-[#2e2e2e] px-8 py-3 text-sm font-medium text-white"
            >
              搜尋
            </button>

            {keyword && (
              <a
                href={category ? `/?category=${category}#hot` : "/#hot"}
                className="rounded-full border border-[#d8c5b0] px-8 py-3 text-center text-sm text-[#6b5c50]"
              >
                清除
              </a>
            )}
          </form>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {displayProducts.map((product) => {
  const soldOut = product.is_sold_out === true;

  const createdAt = product.created_at
    ? new Date(product.created_at)
    : null;

  const now = new Date();

  const diffDays = createdAt
    ? (now.getTime() - createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
    : 999;

  const isNew = diffDays <= 7;

  return (
    <a
      key={product.id}
      href={`/product/${product.id}`}
      className="group overflow-hidden rounded-[2.2rem] bg-white/90 shadow-[0_6px_30px_rgba(70,50,35,0.08)] ring-1 ring-[#eaded4] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_rgba(70,50,35,0.16)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eee8]">
        {(soldOut || isNew) && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#8b6f5c] backdrop-blur">
            {soldOut ? "SOLD OUT" : isNew ? "NEW" : "PREORDER"}
          </div>
        )}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🏷️
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] tracking-[0.25em] text-[#b58b6b]">
          {product.category}
        </p>

        <h4 className="line-clamp-2 text-sm font-semibold leading-6">
          {product.name}
        </h4>

        <p className="pt-1 text-lg font-bold text-[#8b6f5c]">
          NT$ {Number(product.price).toLocaleString()}
        </p>

        {soldOut && (
          <p className="text-xs text-gray-400">
            目前已售完 ☁️
          </p>
        )}
      </div>
    </a>
  );
})}

  return (
    <a
      key={product.id}
      href={`/product/${product.id}`}
      className="group overflow-hidden rounded-[2.2rem] bg-white/90 shadow-[0_6px_30px_rgba(70,50,35,0.08)] ring-1 ring-[#eaded4] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_rgba(70,50,35,0.16)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eee8]">
        <div className="absolute left-3 top-3 z-10 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#8b6f5c] backdrop-blur">
          {soldOut ? "SOLD OUT" : "NEW"}
        </div>

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🏷️
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] tracking-[0.25em] text-[#b58b6b]">
          {product.category}
        </p>

        <h4 className="line-clamp-2 text-sm font-semibold leading-6">
          {product.name}
        </h4>

        <p className="pt-1 text-lg font-bold text-[#8b6f5c]">
          NT$ {Number(product.price).toLocaleString()}
        </p>

        {soldOut && (
          <p className="text-xs text-gray-400">
            目前已售完 ☁️
          </p>
        )}
      </div>
    </a>
  );
})}

            {displayProducts.length === 0 && (
              <div className="col-span-full rounded-[2rem] bg-white p-10 text-center text-[#8b7b6e]">
                找不到相關商品 ☁️
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[#efe7de]">
          <div className="grid gap-10 px-8 py-14 md:grid-cols-2 md:px-14 md:py-20">
            <div className="flex flex-col justify-center">
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#a08060]">
                Owner&apos;s Diary
              </p>

              <h3 className="mb-6 text-4xl font-bold tracking-tight">
                豬豬的碎念 ☁️
              </h3>

              <div className="space-y-5 text-[15px] leading-9 text-[#6b5c50]">
                <p>最近一直覺得，生活已經夠累了。</p>

                <p>
                  所以想把一些看到會笑、摸到會安心、
                  放在房間裡會覺得「好像有被療癒到」的東西，
                  慢慢放進 Argent Nest 裡。
                </p>

                <p>
                  希望妳每次逛進來，
                  都能找到一點讓自己開心的小東西 ☁️
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="overflow-hidden rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                <img
                  src={
                    allProducts?.[1]?.image ||
                    allProducts?.[0]?.image ||
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt="Argent Nest Mood"
                  className="h-[500px] w-full object-cover md:w-[380px]"
                />
              </div>

              <div className="absolute bottom-5 right-0 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
                <p className="text-xs tracking-[0.2em] text-[#a08060]">
                  LITTLE HEALING WORLD ☁️
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#a08060]">
              Today&apos;s Little Mood
            </p>

            <h3 className="text-3xl font-bold tracking-tight">
              Argent Nest 的日常碎片 ☁️
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#8b7b6e]">
              一些讓人想停下來看看的小可愛、穿搭靈感和療癒角落。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-[2rem] bg-white shadow-sm ${
                  i % 2 === 1 ? "md:mt-10" : ""
                }`}
              >
                <img
                  src={
                    allProducts?.[i]?.image ||
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                  }
                  className="h-56 w-full object-cover"
                  alt="Argent Nest daily mood"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8ddd4] bg-[#f6f1eb] px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
          <div>
            <h4 className="mb-4 text-2xl font-bold tracking-tight">
              Argent Nest 🥛🤍
            </h4>
            <p className="text-sm leading-8 text-[#8b7b6e]">
              韓系療癒選物 · 女孩日常 · 微辣穿搭
              <br />
              把讓人心情變好的東西，慢慢放進這裡 ☁️
            </p>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-bold tracking-[0.2em] text-[#a08060]">
              SHOP
            </h5>
            <div className="space-y-3 text-sm text-[#6b5c50]">
              <p>療癒娃娃</p>
              <p>韓系穿搭</p>
              <p>女孩小物</p>
              <p>甜點研究所</p>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-bold tracking-[0.2em] text-[#a08060]">
              NOTICE
            </h5>
            <div className="space-y-3 text-sm leading-7 text-[#6b5c50]">
              <p>全館為預購商品</p>
              <p>出貨約 14–21 天</p>
              <p>無法等待請勿下單</p>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-bold tracking-[0.2em] text-[#a08060]">
              FOLLOW US
            </h5>
            <div className="space-y-3 text-sm text-[#6b5c50]">
              <a href="https://instagram.com" target="_blank" className="block">
                Instagram
              </a>
              <a href="https://threads.net" target="_blank" className="block">
                Threads
              </a>
              <a href="https://line.me" target="_blank" className="block">
                LINE Official
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl border-t border-[#e8ddd4] pt-6 text-center text-xs text-[#b0a090]">
          © 2026 Argent Nest 🥛🤍 · All Rights Reserved
        </div>
      </footer>
    </main>
  );
}
