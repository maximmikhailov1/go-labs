"use client"

import { useRouter } from "next/navigation"
import { TabsDemo } from "@/components/tabs-demo"

export default function AuthPage() {
  const router = useRouter()

  const handleLogin = () => {
    // После успешного входа перенаправляем пользователя на главную страницу
    router.push("/")
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <TabsDemo onLogin={handleLogin} />
    </div>
  )
}

