import { NextResponse } from 'next/server';

const DEFAULT_DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbzBitNkcvoaAK7KFPo2dXZxh9WEeIlRaK1HwZOClAvtNmtUS7p1U7JYqJmnAcWKvNumRw/exec";

function getDriveApiUrl() {
  return process.env.NEXT_GOOGLE_DRIVE_API_URL || 
         process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_URL || 
         DEFAULT_DRIVE_API_URL;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const apiUrl = getDriveApiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Drive Proxy Error:", error);
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const apiUrl = getDriveApiUrl();
    const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;

    const response = await fetch(fullUrl, {
      method: 'GET',
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Drive Proxy GET Error:", error);
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
