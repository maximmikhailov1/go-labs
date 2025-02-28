"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { WrappedLayout } from "@/components/layout/search-params-wrapper"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Проверяем авторизацию
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/auth")
    }
  }, [router])

  return <WrappedLayout/>
}

