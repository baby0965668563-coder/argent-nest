"use client";

type AddToCartButtonProps = {
  product: any;
  selectedOptions?: Record<string, string>;
};

export default function AddToCartButton({
  product,
  selectedOptions = {},
}: AddToCartButtonProps) {
  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        typeof product.images === "string"
          ? product.images.split(",")[0]?.trim()
          : product.images?.[0],
      quantity: 1,
      selectedOptions,
    };

    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("已加入購物車 🛒");
  }

  return (
    <button
      onClick={addToCart}
      className="w-full rounded-full bg-black text-white py-4 text-sm font-semibold hover:bg-gray-800 transition"
    >
      加入購物車
    </button>
  );
}