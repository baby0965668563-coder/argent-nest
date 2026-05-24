import { NextResponse } from "next/server";

import CryptoJS from "crypto-js";

function generateCheckMacValue(data: Record<string, any>) {
  const hashKey = process.env.ECPAY_HASH_KEY || "";
  const hashIV = process.env.ECPAY_HASH_IV || "";

  const sorted = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%21/g, "!")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%2a/g, "*");

  return CryptoJS.MD5(encoded)
    .toString()
    .toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const merchantId =
      process.env.ECPAY_MERCHANT_ID || "";

    const returnURL =
      process.env.ECPAY_RETURN_URL || "";

    const clientBackURL =
      process.env.ECPAY_CLIENT_BACK_URL || "";

    const merchantTradeNo =
      `ARGENT${Date.now()}`;

    const merchantTradeDate =
      new Date()
        .toLocaleString("sv-SE")
        .replace("T", " ");

    const totalAmount = Math.max(
      1,
      Number(body.total || 0)
    );

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    const itemName =
      items.length > 0
        ? items
            .map(
              (item: any) =>
                `${item.name} x ${item.quantity}`
            )
            .join("#")
        : "Argent Nest 商品";

    const orderData = {
      MerchantID: merchantId,

      MerchantTradeNo: merchantTradeNo,

      MerchantTradeDate: merchantTradeDate,

      PaymentType: "aio",

      TotalAmount: String(totalAmount),

      TradeDesc: "Argent Nest Order",

      ItemName: itemName,

      ReturnURL: returnURL,

      ClientBackURL: clientBackURL,

      ChoosePayment: "ALL",

      EncryptType: 1,
    };

    const checkMacValue =
      generateCheckMacValue(orderData);

    const finalData = {
      ...orderData,

      CheckMacValue: checkMacValue,
    };

    return NextResponse.json({
      success: true,

      action:
        "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",

      data: finalData,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}