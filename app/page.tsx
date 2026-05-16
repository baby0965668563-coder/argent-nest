import { supabase } from "@/lib/supabase";
import ProductQuickView from "./components/ProductQuickView";

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
            </div>
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
              最近大家都在偷偷收藏 ☁️
            </h3>
          </div>

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
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[2.2rem] bg-white/90 shadow-[0_6px_30px_rgba(70,50,35,0.08)] ring-1 ring-[#eaded4]"
                >
                  <a href={`/product/${product.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eee8]">
                      <div className="absolute left-3 top-3 z-10 rounded-full bg-white/85 px-3 py-1 text-[10px] text-[#8b6f5c] backdrop-blur">
                        {soldOut
                          ? "SOLD OUT"
                          : isNew
                          ? "NEW"
                          : "PREORDER"}
                      </div>

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
                            soldOut
                              ? "opacity-60 grayscale"
                              : ""
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

                  <div className="px-4 pb-4">
                    <ProductQuickView product={product} />
                  </div>
                </div>
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

      <footer className="border-t border-[#e8ddd4] bg-[#f6f1eb] px-5 py-16 md:px-10">
        <div className="mx-auto max-w-6xl text-center text-xs text-[#b0a090]">
          © 2026 Argent Nest 🥛🤍 · All Rights Reserved
        </div>
      </footer>
    </main>
  );
}
