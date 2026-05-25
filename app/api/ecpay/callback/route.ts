import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {
    const formData =
      await req.formData();

    const data =
      Object.fromEntries(
        formData.entries()
      );

    console.log(
      "ECPAY CALLBACK:",
      data
    );

    return new Response("1|OK");
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
