"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, PencilLine, Users } from "lucide-react"

interface TabsDemoProps {
  onLogin: (role: "student" | "tutor") => void
}

export const TabsDemo: React.FC<TabsDemoProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    fullName: "",
    signUpCode: "",
  })

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("username", loginData.username)
    formData.append("password", loginData.password)
    // Assuming signIn is defined elsewhere and handles the actual sign-in logic
    // and returns a promise with a result object.
    const signIn = async (formData: FormData) => {
      try {
        const response = await fetch("/api/signin", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { success: false, error: errorData.message || "Ошибка входа" }
        }

        const result = await response.json()
        return { success: true, role: result.role } // Assuming the server returns { success: true, role: "student" | "tutor" }
      } finally{
        
      }
    }

    const result = await signIn(formData)
    if (result.success) {
      // Предположим, что роль возвращается с сервера или определяется на клиенте
      const userRole = result.role || "student" // По умолчанию "student", если роль не определена
      onLogin(userRole as "student" | "tutor")
    } else {
      console.error("Ошибка входа:", result.error)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })
      if (response.ok) {
        console.log("Регистрация выполнена успешно")
        // Здесь можно добавить логику для обработки успешной регистрации
      } else {
        console.error("Ошибка регистрации")
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error)
    }
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 h-12 rounded-xl bg-gray-100 p-1">
          <TabsTrigger 
            value="login" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Lock className="h-4 w-4 mr-2" />
            Вход
          </TabsTrigger>
          <TabsTrigger 
            value="register" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <PencilLine className="h-4 w-4 mr-2" />
            Регистрация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="border-0 shadow-sm rounded-xl">
            <form onSubmit={handleLoginSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-blue-600" />
                  Добро пожаловать
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Введите свои учетные данные для входа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-gray-600">Логин</Label>
                  <Input
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="Введите ваш логин"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-600">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-sm"
                >
                  Войти
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="border-0 shadow-sm rounded-xl">
            <form onSubmit={handleRegisterSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Создать аккаунт
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Заполните форму для регистрации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-gray-600">Логин</Label>
                  <Input
                    id="register-username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="Придумайте логин"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-600">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-firstname" className="text-gray-600">ФИО</Label>
                  <Input
                    id="register-firstname"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-groupcode" className="text-gray-600">Код группы</Label>
                  <Input
                    id="register-groupcode"
                    value={registerData.signUpCode}
                    onChange={(e) => setRegisterData({ ...registerData, signUpCode: e.target.value })}
                    className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="Введите код группы"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-sm"
                >
                  Зарегистрироваться
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
