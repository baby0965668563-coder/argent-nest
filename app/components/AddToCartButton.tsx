"use client";

interface Props {
  product: any;
  selectedOptions?: Record<string, string>;
}

export default function AddToCartButton({
  product,
  selectedOptions = {},
}: Props) {
  function handleAddToCart() {
    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product?.image ||
        (Array.isArray(product?.images) &&
        product.images.length > 0
          ? product.images[0]
          : ""),
      options: selectedOptions,
      quantity: 1,
    };

    existingCart.push(cartItem);

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    alert("已加入購物車 ☁️");
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-3 w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-sm font-medium text-[#6b5c50]"
    >
      加入購物車 ☁️
    </button>
  );
}