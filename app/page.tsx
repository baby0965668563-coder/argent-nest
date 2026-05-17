import { supabase } from "@/lib/supabase";
import Link from "next/link";
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

  const { data: products, error } = await query;

  if (error) {
    console.error(error);
  }

  const categories = [
    "全部",
    "卡通療癒選物",
    "微辣韓系穿搭",
    "飾品包包",
    "花束甜點",
  ];

  return (
    <main className="min-h-screen bg-[#f8f3ec] text-[#3f332b]">
      <section className="px-5 pt-12 pb-8 text-center">
        <p className="text-sm tracking-[0.35em] text-[#a88973]">
          ARGENT NEST
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-[0.08em]">
          ARGENT NEST 🥛🤍
        </h1>

        <p className="mt-5 text-base leading-8 text-[#7a6658]">
          療癒系女孩選物店
          <br />
          卡通萌物・韓系穿搭・日常小物・花束甜點
        </p>
      </section>

      <section className="px-5 pb-6">
        <form className="mx-auto flex max-w-xl gap-3" action="/">
          <input
            name="q"
            defaultValue={keyword}
            placeholder="搜尋商品..."
            className="w-full rounded-full border border-[#e3d4c8] bg-white px-6 py-4 text-base outline-none"
          />

          <button
            type="submit"
            className="rounded-full bg-[#3f332b] px-6 py-4 text-base font-semibold text-white"
          >
            搜尋
          </button>
        </form>
      </section>

      <section className="flex gap-3 overflow-x-auto px-5 pb-7">
        {categories.map((item) => (
          <Link
            key={item}
            href={item === "全部" ? "/" : `/?category=${encodeURIComponent(item)}`}
            className={`shrink-0 rounded-full px-5 py-3 text-base ${
              (category || "全部") === item
                ? "bg-[#3f332b] text-white"
                : "border border-[#e3d4c8] bg-white text-[#7a6658]"
            }`}
          >
            {item}
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-5 px-5 pb-20 md:grid-cols-4">
        {products && products.length > 0 ? (
          products.map((product: any) => {
            const imageSrc =
              product.image_url ||
              product.image ||
              (Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "");

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[2rem] bg-white shadow-sm"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-square bg-[#efe5dc]">
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

                  <div className="p-4">
                    <p className="line-clamp-2 text-base font-bold">
                      {product.name}
                    </p>

                    <p className="mt-2 text-sm text-[#9a8170]">
                      {product.category}
                    </p>

                    <p className="mt-3 text-xl font-black text-[#3f332b]">
                      ${Number(product.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  <ProductQuickView product={product} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 rounded-3xl bg-white p-8 text-center text-sm text-[#8a7566] md:col-span-4">
            目前沒有商品
          </div>
        )}
      </section>
    </main>
  );
}