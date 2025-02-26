import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Проверяем куки авторизации
  const token = request.cookies.get("token")?.value
  const isAuthPage = request.nextUrl.pathname === "/auth"

  // Если пользователь не авторизован и не на странице авторизации
  if (!token && !isAuthPage) {
    // Сохраняем текущий URL перед редиректом
    const url = new URL("/auth", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Если пользователь авторизован и пытается зайти на страницу авторизации
  if (token && isAuthPage) {
    // Получаем URL для возврата или используем главную страницу
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/"
    return NextResponse.redirect(new URL(callbackUrl, request.url))
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

