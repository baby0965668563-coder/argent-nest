import { supabase } from "@/lib/supabase";
import ProductQuickView from "./components/ProductQuickView";
import HomeBanner from "./components/HomeBanner";
import ProductImageHover from "./components/ProductImageHover";
import MobileBottomNav from "./components/MobileBottomNav";
import LineAskButton from "./components/LineAskButton";
import LikeButton from "./components/LikeButton";
import TopNoticeBar from "./components/TopNoticeBar";

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
    .order("is_featured", { ascending: false })
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
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  const allProducts = allProductsQuery.data || [];
  const displayProducts = products || [];
  const featuredProducts = allProducts.filter(
    (product: any) => product.is_featured === true
  );

  const getImage = (product: any) => {
    return (
      product?.image ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "")
    );
  };

  const getImages = (product: any) => {
    const firstImage = getImage(product);

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }

    return firstImage ? [firstImage] : [];
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";

  const categories = [
    { label: "全部", emoji: "☁️", desc: "全部商品" },
    { label: "卡通療癒選物", emoji: "🧸", desc: "把小小快樂帶回家。" },
    { label: "微辣韓系穿搭", emoji: "👗", desc: "韓系慵懶感女孩日常。" },
    { label: "飾品包包", emoji: "🎀", desc: "飾品、包包與日常可愛。" },
    { label: "花束甜點", emoji: "🍰", desc: "屬於甜甜日常的小角落。" },
  ];

  function categoryHref(label: string) {
    const params = new URLSearchParams();

    if (label !== "全部") params.set("category", label);
    if (keyword) params.set("q", keyword);

    const queryString = params.toString();
    return queryString ? `/?${queryString}#hot` : "/#hot";
  }

  function getBadge(product: any) {
    const soldOut = product.is_sold_out === true;

    const createdAt = product.created_at ? new Date(product.created_at) : null;
    const now = new Date();

    const diffDays = createdAt
      ? (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    const isNew = diffDays <= 7;

    if (soldOut) return "SOLD OUT";
    if (product.is_featured) return "HOT";
    if (isNew) return "NEW";
    return "PREORDER";
  }

  function stockText(product: any) {
    const soldOut = product.is_sold_out === true;
    const stock = Number(product.stock || 0);

    if (soldOut) {
      return (
        <p className="text-xs text-gray-400">
          目前已售完 ☁️
        </p>
      );
    }

    if (stock > 0) {
      return (
        <>
          <p className="text-xs text-[#2e7d32]">
            現貨 {stock} 件 ☁️
          </p>

          {stock <= 3 && (
            <p className="text-xs text-red-500">
              庫存不多了 ☁️
            </p>
          )}
        </>
      );
    }

    return (
      <p className="text-xs text-[#8b6f5c]">
        預購商品 ☁️
      </p>
    );
  }

  return (
     <main className="min-h-screen bg-[#f8f5f0] overflow-x-hidden pb-20 text-[#2e2e2e] md:pb-0">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd4]/70 bg-[#f8f5f0]/90 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            Argent Nest 🥛🤍
          </a>

          <nav className="flex items-center gap-4 text-sm text-[#6b5c50] md:gap-5">
            <a href="#hot">新品</a>
            <a href="#featured">熱賣</a>
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
      
      <TopNoticeBar />
      <HomeBanner />

      {featuredProducts.length > 0 && (
        <section id="featured" className="px-5 pb-14 md:px-10">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#2e2e2e] px-5 py-7 text-white shadow-[0_10px_35px_rgba(50,35,25,0.16)] md:rounded-[2.5rem] md:p-10">
            <div className="mb-6">
              <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#d8c5b0]">
                Hot Picks
              </p>

              <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                闆娘私心推薦 ☁️
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                這些是最近最值得先看的小可愛，怕錯過可以先收藏。
              </p>
            </div>

            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
              {featuredProducts.slice(0, 10).map((product: any) => {
                const imageSrc = getImage(product);

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="w-[46%] min-w-[150px] max-w-[190px] shrink-0 overflow-hidden rounded-[1.6rem] bg-white text-[#2e2e2e] shadow-sm md:w-56 md:max-w-none"
                  >
                    <div className="relative aspect-[4/5] bg-[#f4eee8]">
                      <div className="absolute left-3 top-3 z-10 rounded-full bg-[#2e2e2e] px-3 py-1 text-[10px] text-white">
                        HOT
                      </div>

                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#b49a88]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-bold leading-6">
                        {product.name}
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#8b6f5c]">
                        NT$ {Number(product.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="categories" className="px-5 pb-14 md:px-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
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

          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible">
            {categories.map((cat) => {
              const active =
                (!category && cat.label === "全部") || category === cat.label;

              return (
                <a
                  key={cat.label}
                  href={categoryHref(cat.label)}
                  className={`min-w-[150px] rounded-[1.6rem] p-5 transition hover:-translate-y-1 md:min-w-0 md:rounded-[2rem] md:p-6 ${
                    active
                      ? "bg-[#2e2e2e] text-white"
                      : "bg-white text-[#2e2e2e]"
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5f0] text-2xl shadow-sm md:h-16 md:w-16 md:text-3xl">
                    {cat.emoji}
                  </div>

                  <h4 className="mb-2 text-base font-bold md:text-lg">
                    {cat.label}
                  </h4>

                  <p
                    className={`text-xs leading-6 md:text-sm md:leading-7 ${
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
          <div className="mb-8">
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
            {displayProducts.map((product: any) => {
              const soldOut = product.is_sold_out === true;
              const imageSrc = getImage(product);
              const badge = getBadge(product);
              const productImages = getImages(product);

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] bg-white/90 shadow-[0_6px_30px_rgba(70,50,35,0.08)] ring-1 ring-[#eaded4] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_50px_rgba(70,50,35,0.16)] md:rounded-[2.2rem]"
                >
                  <a href={`/product/${product.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eee8]">
                      <div
                        className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] backdrop-blur ${
                          badge === "HOT"
                            ? "bg-[#2e2e2e] text-white"
                            : badge === "SOLD OUT"
                            ? "bg-black/75 text-white"
                            : "bg-white/85 text-[#8b6f5c]"
                        }`}
                      >
                        {badge}
                      </div>

                      {imageSrc ? (
                        <ProductImageHover
                          images={productImages}
                          alt={product.name}
                          soldOut={soldOut}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#b49a88]">
                          No Image
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
                        NT$ {Number(product.price || 0).toLocaleString()}
                      </p>

                      {stockText(product)}
                    </div>
                  </a>

                  <div className="px-4 pb-4">
                    <ProductQuickView product={product} />
                    <LineAskButton product={product} />
                    <LikeButton
  productId={product.id}
  initialLikes={Number(product.likes || 0)}
/>
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
                    getImage(allProducts[1]) ||
                    getImage(allProducts[0]) ||
                    fallbackImage
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
                  src={getImage(allProducts[i]) || fallbackImage}
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
              <p>卡通療癒選物</p>
              <p>微辣韓系穿搭</p>
              <p>飾品包包</p>
              <p>花束甜點</p>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-bold tracking-[0.2em] text-[#a08060]">
              NOTICE
            </h5>

            <div className="space-y-3 text-sm leading-7 text-[#6b5c50]">
              <p>全館多為預購商品</p>
              <p>出貨約 14–21 天</p>
              <p>無法等待請勿下單</p>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-bold tracking-[0.2em] text-[#a08060]">
              FOLLOW US
            </h5>

            <div className="space-y-3 text-sm text-[#6b5c50]">
              <a
                href="https://www.instagram.com/argent.nest?igsh=MTF0OG9mam5yZHExeQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                Instagram
              </a>

              <a
                href="https://www.threads.com/@argent.nest?igshid=NTc4MTIwNjQ2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                Threads
              </a>

              <a
                href="https://line.me/R/ti/p/@929santn"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                LINE Official
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl border-t border-[#e8ddd4] pt-6 text-center text-xs text-[#b0a090]">
          © 2026 Argent Nest 🥛🤍 · All Rights Reserved
        </div>
      </footer>

      <MobileBottomNav />
    </main>
  );
}