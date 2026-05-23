import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: "缺少 code 或 redirectUri" },
        { status: 400 }
      );
    }

    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    if (!channelId || !channelSecret) {
      return NextResponse.json(
        { error: "LINE 環境變數尚未設定" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "LINE token exchange failed" },
      { status: 500 }
    );
  }
}
