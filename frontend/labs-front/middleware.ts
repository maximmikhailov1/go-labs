import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
  return `${proto}://${host}`
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown"
  const ts = new Date().toISOString()
  console.warn(`[MW] REQ ${method} ${path} ip=${ip} ts=${ts}`)

  const token = request.cookies.get("token")?.value
  const isAuthPage = path === "/auth"

  if (!token && !isAuthPage) {
    const base = getBaseUrl(request)
    const url = new URL("/auth", base)
    url.searchParams.set("callbackUrl", path)
    console.warn(`[MW] REDIRECT to /auth path=${path} ip=${ip} ts=${ts} url=${url.toString()}`)
    return NextResponse.redirect(url)
  }

  if (token && isAuthPage) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/"
    const base = getBaseUrl(request)
    const url = new URL(callbackUrl, base)
    console.warn(`[MW] REDIRECT to callback path=${callbackUrl} ip=${ip} ts=${ts} url=${url.toString()}`)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Обновляем конфигурацию middleware для обработки всех маршрутов приложения
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

