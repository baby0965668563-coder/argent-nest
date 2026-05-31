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
    .order("is_featured", { ascending: false })
    .order("likes", { ascending: false })
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
    .order("is_featured", { ascending: false })
    .order("likes", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  const isVisibleProduct = (product: any) =>
    product?.is_active !== false && product?.status !== false;

  const allProducts = (allProductsQuery.data || []).filter(isVisibleProduct);
  const displayProducts = (products || []).filter(isVisibleProduct);

  const featuredProducts = allProducts.filter(
    (product: any) => product.is_featured === true
  );

  const newestProducts = [...allProducts]
    .sort((a: any, b: any) => {
      return (
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
      );
    })
    .slice(0, 6);

  const healingProducts = allProducts
    .filter((product: any) => product.category === "卡通療癒選物")
    .slice(0, 4);

  const clothesProducts = allProducts
    .filter((product: any) => product.category === "微辣韓系穿搭")
    .slice(0, 4);

  const accessoriesProducts = allProducts
    .filter((product: any) => product.category === "飾品包包")
    .slice(0, 4);

  const flowerProducts = allProducts
    .filter((product: any) => product.category === "花束甜點")
    .slice(0, 4);

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

  function getVariantStock(product: any) {
    const variants = Array.isArray(product?.variants) ? product.variants : [];

    if (variants.length === 0) return null;

    return variants.reduce((sum: number, variant: any) => {
      return sum + Number(variant.stock || 0);
    }, 0);
  }

  function getProductStock(product: any) {
    const variantStock = getVariantStock(product);

    if (variantStock !== null) return variantStock;

    return Number(product.stock || 0);
  }

  function getBadge(product: any) {
    const soldOut =
      product.is_sold_out === true || product.can_order === false;

    const stock = getProductStock(product);

    const createdAt = product.created_at ? new Date(product.created_at) : null;
    const now = new Date();

    const diffDays = createdAt
      ? (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    const isNew = diffDays <= 7;

    if (soldOut) return "SOLD OUT";
    if (stock > 0) return "IN STOCK";
    if (product.is_featured) return "HOT";
    if (isNew) return "NEW";
    return "PREORDER";
  }

  function stockText(product: any) {
    const soldOut =
      product.is_sold_out === true || product.can_order === false;

    const stock = getProductStock(product);
    const hasVariants =
      Array.isArray(product?.variants) && product.variants.length > 0;

    if (soldOut) {
      return <p className="text-xs text-gray-400">目前已售完 ☁️</p>;
    }

    if (stock > 0) {
      return (
        <>
          <p className="text-xs text-[#2e7d32]">
            {hasVariants
              ? `款式合計現貨 ${stock} 件 ☁️`
              : `現貨 ${stock} 件 ☁️`}
          </p>

          {stock <= 3 && (
            <p className="text-xs text-red-500">庫存不多了 ☁️</p>
          )}
        </>
      );
    }

    return <p className="text-xs text-[#8b6f5c]">預購商品 ☁️</p>;
  }

  function ProductMiniCard({ product }: { product: any }) {
    const imageSrc = getImage(product);
    const badge = getBadge(product);

    return (
      <a
        href={`/product/${product.id}`}
        className="overflow-hidden rounded-[2rem] bg-white text-left shadow-sm transition hover:-translate-y-1"
      >
        <div className="relative aspect-square overflow-hidden bg-[#f4eee8]">
          <div
            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] backdrop-blur ${
              badge === "SOLD OUT"
                ? "bg-black/75 text-white"
                : badge === "HOT"
                ? "bg-[#2e2e2e] text-white"
                : badge === "IN STOCK"
                ? "bg-green-100 text-green-700"
                : badge === "PREORDER"
                ? "bg-[#fff2e5] text-[#b07255]"
                : "bg-white/85 text-[#8b6f5c]"
            }`}
          >
            {badge === "IN STOCK"
              ? "現貨"
              : badge === "PREORDER"
              ? "預購"
              : badge}
          </div>

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#b49a88]">
              No Image
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#4b4038]">
            {product.name}
          </p>

          <p className="mt-2 font-bold text-[#8b6f5c]">
            NT$ {Number(product.price || 0).toLocaleString()}
          </p>

          <div className="mt-2">{stockText(product)}</div>
        </div>
      </a>
    );
  }

  function CategoryProductSection({
    title,
    emoji,
    href,
    products,
  }: {
    title: string;
    emoji: string;
    href: string;
    products: any[];
  }) {
    if (products.length === 0) return null;

    return (
      <section className="px-5 pb-14 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#a08060]">
                Category Pick
              </p>

              <h3 className="text-2xl font-bold tracking-tight text-[#4b4038] md:text-3xl">
                {emoji} {title}
              </h3>
            </div>

            <a href={href} className="text-sm text-[#8b6f5c]">
              查看更多 →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.map((product: any) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f5f0] pb-20 text-[#2e2e2e] md:pb-0">
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

      <section className="px-5 pb-14 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          <a
            href="/#hot"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <p className="text-2xl">🧸</p>
            <p className="mt-3 font-semibold text-[#4b4038]">
              卡通療癒選物
            </p>
            <p className="mt-1 text-sm text-[#8c7b70]">
              三麗鷗・迪士尼・娃娃
            </p>
          </a>

          <a
            href="/#hot"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <p className="text-2xl">🖤</p>
            <p className="mt-3 font-semibold text-[#4b4038]">
              微辣韓系穿搭
            </p>
            <p className="mt-1 text-sm text-[#8c7b70]">慵懶感・奶油色系</p>
          </a>

          <a
            href="/#hot"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <p className="text-2xl">🎀</p>
            <p className="mt-3 font-semibold text-[#4b4038]">飾品包包</p>
            <p className="mt-1 text-sm text-[#8c7b70]">女孩日常小物</p>
          </a>

          <a
            href="/#hot"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <p className="text-2xl">🌷</p>
            <p className="mt-3 font-semibold text-[#4b4038]">花束甜點</p>
            <p className="mt-1 text-sm text-[#8c7b70]">節日限定系列</p>
          </a>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section id="featured" className="px-5 pb-14 md:px-10">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#2e2e2e] px-5 py-8 text-white shadow-[0_10px_35px_rgba(50,35,25,0.16)] md:p-10">
            <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#d8c5b0]">
              Hot Picks
            </p>

            <h3 className="text-2xl font-black tracking-tight md:text-3xl">
              闆娘私心推薦 ☁️
            </h3>

            <p className="mt-3 text-sm leading-7 text-white/65">
              最近最值得先看的小可愛，怕錯過可以先收藏。
            </p>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {featuredProducts.slice(0, 10).map((product: any) => (
                <ProductMiniCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {newestProducts.length > 0 && (
        <CategoryProductSection
          title="最近上架"
          emoji="☁️"
          href="/#hot"
          products={newestProducts.slice(0, 4)}
        />
      )}

      <CategoryProductSection
        title="卡通療癒選物"
        emoji="🧸"
        href="/#hot"
        products={healingProducts}
      />

      <CategoryProductSection
        title="微辣韓系穿搭"
        emoji="🖤"
        href="/#hot"
        products={clothesProducts}
      />

      <CategoryProductSection
        title="飾品包包"
        emoji="🎀"
        href="/#hot"
        products={accessoriesProducts}
      />

      <CategoryProductSection
        title="花束甜點"
        emoji="🌷"
        href="/#hot"
        products={flowerProducts}
      />

      <section id="categories" className="px-5 pb-14 md:px-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#a08060]">
              Categories
            </p>

            <h3 className="text-3xl font-bold tracking-tight">
              逛逛屬於妳的小世界 ☁️
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5">
            {categories.map((cat) => {
              const active =
                (!category && cat.label === "全部") || category === cat.label;

              return (
                <a
                  key={cat.label}
                  href={categoryHref(cat.label)}
                  className={`min-w-[150px] rounded-[1.6rem] p-5 ${
                    active
                      ? "bg-[#2e2e2e] text-white"
                      : "bg-white text-[#2e2e2e]"
                  }`}
                >
                  <div className="mb-4 text-3xl">{cat.emoji}</div>
                  <h4 className="mb-2 font-bold">{cat.label}</h4>
                  <p
                    className={`text-xs leading-6 ${
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
          </form>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {displayProducts.map((product: any) => {
              const soldOut =
                product.is_sold_out === true || product.can_order === false;

              const imageSrc = getImage(product);
              const badge = getBadge(product);
              const productImages = getImages(product);

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] bg-white/90 shadow-[0_6px_30px_rgba(70,50,35,0.08)] ring-1 ring-[#eaded4]"
                >
                  <a href={`/product/${product.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eee8]">
                      <div
                        className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] ${
                          badge === "HOT"
                            ? "bg-[#2e2e2e] text-white"
                            : badge === "SOLD OUT"
                            ? "bg-black/75 text-white"
                            : badge === "IN STOCK"
                            ? "bg-green-100 text-green-700"
                            : badge === "PREORDER"
                            ? "bg-[#fff2e5] text-[#b07255]"
                            : "bg-white/85 text-[#8b6f5c]"
                        }`}
                      >
                        {badge === "IN STOCK"
                          ? "現貨"
                          : badge === "PREORDER"
                          ? "預購"
                          : badge}
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
              NOTICE
            </h5>

            <div className="space-y-3 text-sm leading-7 text-[#6b5c50]">
              <p>預購約 14–21 天</p>
              <p>無法等待請勿下單</p>
              <p>收貨請全程開箱錄影</p>
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
