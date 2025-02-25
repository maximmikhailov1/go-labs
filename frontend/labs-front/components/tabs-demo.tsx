"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsDemoProps {
  onLogin: (role: "student" | "tutor") => void
}

export const TabsDemo: React.FC<TabsDemoProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    fullName:"",
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
      } catch (error: any) {
        return { success: false, error: error.message || "Ошибка при отправке данных" }
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
    <Tabs defaultValue="login" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Вход</TabsTrigger>
        <TabsTrigger value="register">Регистрация</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <form onSubmit={handleLoginSubmit}>
            <CardHeader>
              <CardTitle>Вход</CardTitle>
              <CardDescription>Введите свои учетные данные для входа в систему.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="login-username">Логин</Label>
                <Input
                  id="login-username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Войти</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card>
          <form onSubmit={handleRegisterSubmit}>
            <CardHeader>
              <CardTitle>Регистрация</CardTitle>
              <CardDescription>Заполните форму для создания новой учетной записи.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="register-username">Логин</Label>
                <Input
                  id="register-username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-firstname">Имя</Label>
                <Input
                  id="register-firstname"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-groupcode">Код Группы</Label>
                <Input
                  id="register-groupcode"
                  value={registerData.signUpCode}
                  onChange={(e) => setRegisterData({ ...registerData, signUpCode: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Зарегистрироваться</Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

