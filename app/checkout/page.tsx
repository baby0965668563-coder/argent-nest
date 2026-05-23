"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  vipPrice?: number | null;
  isVipPrice?: boolean;
  image?: string;
  quantity: number;
  options?: Record<string, string>;
  note?: string;
  productNote?: string;

  selectedVariant?: {
    name: string;
    price: number;
    vipPrice?: number;
    stock?: number;
  } | null;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [member, setMember] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "",
    shippingMethod: "超商取貨",
    storeName: "",
    storeAddress: "",
    customerNote: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    setCart(savedCart);

    const savedUser =
      localStorage.getItem("argent_user");

    if (savedUser) {
      try {
        const parsedUser =
          JSON.parse(savedUser);

        setMember(parsedUser);

        setForm((prev) => ({
          ...prev,

          name:
            parsedUser?.name || "",

          lineId:
            parsedUser?.line_user_id ||
            "",
        }));
      } catch {
        localStorage.removeItem(
          "argent_user"
        );
      }
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const originalSubtotal =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.originalPrice ||
            item.price ||
            0
        ) *
          Number(
            item.quantity || 1
          ),
      0
    );

  const vipSaved =
    originalSubtotal - subtotal;

  const shippingFee =
    form.shippingMethod ===
    "超商取貨"
      ? 60
      : form.shippingMethod ===
        "宅配"
      ? 130
      : 0;

  const total =
    subtotal + shippingFee;

  function updateForm(
    key: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) {
      alert("請填寫姓名與電話");
      return;
    }

    if (cart.length === 0) {
      alert("購物車是空的");
      return;
    }

    if (
      form.shippingMethod ===
        "超商取貨" &&
      !form.storeName
    ) {
      alert("請填寫超商門市名稱");
      return;
    }

    try {
      setLoading(true);

      // 檢查 variants 庫存
      for (const item of cart) {
        if (
          !item.selectedVariant?.name
        )
          continue;

        const {
          data: productData,
        } = await supabase
          .from("products")
          .select(
            "id, name, variants"
          )
          .eq("id", item.id)
          .single();

        if (!productData)
          continue;

        const variants =
          Array.isArray(
            productData.variants
          )
            ? productData.variants
            : [];

        const currentVariant =
          variants.find(
            (variant: any) =>
              variant.name ===
              item.selectedVariant
                ?.name
          );

        const currentStock =
          Number(
            currentVariant?.stock ||
              0
          );

        if (
          currentStock <
          Number(
            item.quantity || 1
          )
        ) {
          alert(
            `${item.name}（${item.selectedVariant.name}）庫存不足`
          );

          setLoading(false);

          return;
        }
      }

      const orderId =
        crypto.randomUUID();

      const orderToken =
        crypto.randomUUID();

      const { error } =
        await supabase
          .from("orders")
          .insert([
            {
              id: orderId,

              order_token:
                orderToken,

              customer_name:
                form.name,

              phone: form.phone,

              // 這裡改成真正會員 LINE ID
              line_id:
                member?.line_user_id ||
                form.lineId,

              shipping_method: `${
                form.shippingMethod
              }${
                form.shippingMethod ===
                "超商取貨"
                  ? `｜${form.storeName}${
                      form.storeAddress
                        ? `｜${form.storeAddress}`
                        : ""
                    }`
                  : ""
              }`,

              customer_note:
                form.customerNote,

              items: cart,

              total,

              status: "pending",
            },
          ]);

      if (error) {
        console.error(error);

        alert(
          "訂單送出失敗，請檢查 Supabase 欄位"
        );

        return;
      }

      // 扣 variants 庫存
      for (const item of cart) {
        if (
          !item.selectedVariant?.name
        )
          continue;

        const {
          data: productData,
        } = await supabase
          .from("products")
          .select(
            "id, variants"
          )
          .eq("id", item.id)
          .single();

        if (!productData)
          continue;

        const variants =
          Array.isArray(
            productData.variants
          )
            ? productData.variants
            : [];

        const updatedVariants =
          variants.map(
            (variant: any) => {
              if (
                variant.name ===
                item
                  .selectedVariant
                  ?.name
              ) {
                return {
                  ...variant,

                  stock:
                    Math.max(
                      0,
                      Number(
                        variant.stock ||
                          0
                      ) -
                        Number(
                          item.quantity ||
                            1
                        )
                    ),
                };
              }

              return variant;
            }
          );

        await supabase
          .from("products")
          .update({
            variants:
              updatedVariants,
          })
          .eq("id", item.id);
      }

      localStorage.removeItem(
        "cart"
      );

      window.location.href = `/orders/${orderId}?token=${orderToken}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-[#4b4038]">
          填寫收件資料
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_380px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">
              聯絡資料
            </h2>

            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) =>
                  updateForm(
                    "name",
                    e.target.value
                  )
                }
                placeholder="姓名 *"
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <input
                value={form.phone}
                onChange={(e) =>
                  updateForm(
                    "phone",
                    e.target.value
                  )
                }
                placeholder="手機號碼 *"
               className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <input
                value={form.lineId}
                disabled
                placeholder="LINE會員已登入"
               className="w-full rounded-2xl border border-[#e1d3c2] bg-[#f8f3ec] px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <select
                value={
                  form.shippingMethod
                }
                onChange={(e) =>
                  updateForm(
                    "shippingMethod",
                    e.target.value
                  )
                }
               className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
              >
                <option value="超商取貨">
                  超商取貨 $60
                </option>

                <option value="宅配">
                  宅配 $130
                </option>

                <option value="面交">
                  面交 $0
                </option>
              </select>

              {form.shippingMethod ===
                "超商取貨" && (
                <>
                  <input
                    value={
                      form.storeName
                    }
                    onChange={(e) =>
                      updateForm(
                        "storeName",
                        e.target.value
                      )
                    }
                    placeholder="超商門市名稱 *"
                    className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
                  />

                  <input
                    value={
                      form.storeAddress
                    }
                    onChange={(e) =>
                      updateForm(
                        "storeAddress",
                        e.target.value
                      )
                    }
                    placeholder="門市地址（可選）"
                    className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
                  />
                </>
              )}

              <textarea
                value={
                  form.customerNote
                }
                onChange={(e) =>
                  updateForm(
                    "customerNote",
                    e.target.value
                  )
                }
                placeholder="訂單備註"
               className="min-h-[100px] w-full resize-none rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">
              訂單明細
            </h2>

            <div className="space-y-4">
              {cart.map(
                (item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="border-b pb-4"
                  >
                    <p className="font-medium text-[#4b4038]">
                      {item.name}
                    </p>

                    <p className="mt-2 text-sm text-[#4b4038]">
                      NT$
                      {" "}
                      {Number(
                        item.price || 0
                      ).toLocaleString()}
                      {" "}
                      ×
                      {" "}
                      {item.quantity}
                    </p>
                  </div>
                )
              )}

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="mb-4 font-semibold text-[#4b4038]">
                  <span>商品小計</span>

                  <span>
                    NT$
                    {" "}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                {vipSaved > 0 && (
                  <>
                    <div className="mb-4 font-semibold text-[#4b4038]">
                      <span>
                        原價總額
                      </span>

                      <span className="line-through">
                        NT$
                        {" "}
                        {originalSubtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between font-medium text-[#4b4038]">
                      <span>
                        VIP 優惠
                      </span>

                      <span>
                        - NT$
                        {" "}
                        {vipSaved.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                <div  className="mb-4 font-semibold text-[#4b4038]">
                  <span>運費</span>

                  <span>
                    NT$
                    {" "}
                    {shippingFee.toLocaleString()}
                  </span>
                </div>

                <div  className="mb-4 font-semibold text-[#4b4038]">
                  <span>總金額</span>

                  <span>
                    NT$
                    {" "}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={loading}
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
              >
                {loading
                  ? "送出中..."
                  : "送出訂單 ☁️"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
