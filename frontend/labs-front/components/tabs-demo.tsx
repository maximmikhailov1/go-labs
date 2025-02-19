"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signIn, signUp } from "@/app/actions/auth"

export function TabsDemo() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    groupCode: "",
  })

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("username", loginData.username)
    formData.append("password", loginData.password)
    const result = await signIn(formData)
    if (result.success) {
      router.push("/")
    } else {
      console.error("Ошибка входа:", result.error)
      // Здесь можно добавить обратную связь для пользователя
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(registerData).forEach(([key, value]) => {
      formData.append(key, value)
    })
    const result = await signUp(formData)
    if (result.success) {
      router.push("/")
    } else {
      console.error("Ошибка регистрации:", result.error)
      // Здесь можно добавить обратную связь для пользователя
    }
  }

  return (
    <Tabs defaultValue="login" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Вход</TabsTrigger>
        <TabsTrigger value="register">Регистрация</TabsTrigger>
      </TabsList>
      <div className="mt-4 h-[500px]">
        {" "}
        {/* Увеличенная высота контейнера */}
        <TabsContent value="login">
          <Card className="h-full">
            <form onSubmit={handleLoginSubmit} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Вход</CardTitle>
                <CardDescription>Введите свои учетные данные для входа в систему.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Логин</Label>
                  <Input
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
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
                <Button type="submit" className="w-full">
                  Войти
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card className="h-full">
            <form onSubmit={handleRegisterSubmit} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>Заполните форму для создания новой учетной записи.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow overflow-y-auto">
                {Object.entries(registerData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`register-${key}`}>{key}</Label>
                    <Input
                      id={`register-${key}`}
                      type={key === "password" ? "password" : "text"}
                      value={value}
                      onChange={(e) => setRegisterData({ ...registerData, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Зарегистрироваться
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}

