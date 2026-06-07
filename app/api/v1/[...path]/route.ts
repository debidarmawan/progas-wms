import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_TARGET = (
  process.env.API_PROXY_TARGET ?? "http://localhost:3131"
).replace(/\/$/, "");

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${API_TARGET}/api/v1/${targetPath}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("Content-Type", contentType);
  if (authorization) headers.set("Authorization", authorization);

  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: 502,
        status: "ERROR",
        message: "Backend API tidak dapat dihubungi. Periksa API_PROXY_TARGET.",
        data: null,
      },
      { status: 502 },
    );
  }

  const responseBody = await upstream.text();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
