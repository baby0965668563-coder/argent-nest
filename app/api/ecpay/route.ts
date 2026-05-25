import { NextResponse } from "next/server";

function generateCheckMacValue(data: Record<string, any>) {
  const hashKey =
    process.env.ECPAY_HASH_KEY || "";

  const hashIv =
    process.env.ECPAY_HASH_IV || "";

  const sorted = Object.keys(data)
    .sort()
    .map(
      (key) =>
        `${key}=${data[key]}`
    )
    .join("&");

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIv}`;

  const encoded = encodeURIComponent(
    raw
  )
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");

  return encoded;
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const merchantID =
      process.env
        .ECPAY_MERCHANT_ID ||
      "3002607";

    const merchantTradeNo =
      `AN${Date.now()}`;

    const merchantTradeDate =
      new Date()
        .toLocaleString("zh-TW", {
          hour12: false,
        })
        .replace(/\//g, "/");

    const orderData = {
      MerchantID: merchantID,

      MerchantTradeNo:
        merchantTradeNo,

      MerchantTradeDate:
        merchantTradeDate,

      PaymentType: "aio",

      TotalAmount: String(
        Math.round(
          body.total || 0
        )
      ),

      TradeDesc:
        "Argent Nest Order",

      ItemName:
        body.items
          ?.map(
            (item: any) =>
              item.name
          )
          .join("#") ||
        "商品訂單",

      ReturnURL:
        process.env
          .ECPAY_RETURN_URL || "",

      ChoosePayment:
        "Credit",

      ClientBackURL:
        process.env
          .ECPAY_CLIENT_BACK_URL ||
        "",

      EncryptType: "1",
    };

    const checkMacValue =
      generateCheckMacValue(
        orderData
      );

    return NextResponse.json({
      success: true,

      action:
        "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",

      params: {
        ...orderData,

        CheckMacValue:
          checkMacValue,
      },
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
