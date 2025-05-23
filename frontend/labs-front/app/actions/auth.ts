"use client"

export async function signIn(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  try {
    const response = await fetch("/api/v1/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Неверные учетные данные" }
    }
  } catch (error) {
    console.error("Error during sign in:", error)
    return { error: "Произошла ошибка при входе" }
  }
}

export async function checkAuthAndRole() {
  try {
    const response = await fetch("/api/v1/auth/check-auth", {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
      },
      credentials: "include",
    })
    if (response.ok) {
      const data = await response.json()
      return {success: true, role: data.role as "student" | "tutor" | null, isAuthenticated: true}
      
    } else {
      const errorData = await response.json()
      return {error: errorData.message || "Ошибка проверки аутентификации",  isAuthenticated:false, role:null}
    }
  } catch (error) {
    console.error("Ошибка при аутентификации:", error)
    return {error: "Ошибка аутентификации", isAuthenticated: false, role:null}
  }
}

export async function signUp(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")
  const fullName = formData.get("fullName") 
  const signUpCode = formData.get("signUpCode")

  try {
    const response = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fullName, signUpCode }),
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при регистрации" }
    }
  } catch (error) {
    console.error("Error during sign up:", error)
    return { error: "Произошла ошибка при регистрации" }
  }
}

export async function logout() {
  try {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      return { error: "Ошибка при выходе из системы" }
    }
  } catch (error) {
    console.error("Error during logout:", error)
    return { error: "Произошла ошибка при выходе из системы" }
  }
}

export function deleteCookie(name:string){
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export async function enrollInClass(date: string, slotNumber: number, audienceNumber: number) {
  try {
    const response = await fetch("/api/records/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, slotNumber, audienceNumber }),
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при записи на занятие" }
    }
  } catch (error) {
    console.error("Error during class enrollment:", error)
    return { error: "Произошла ошибка при записи на занятие" }
  }
}
export async function getUser(){
  try{
    const response = await fetch("/api/users",{
      method: "GET",
      credentials:"include"
    })
    if (response.ok){
      const data = await response.json()
      return {success: true, user: data}
    } else {
      const errorData = await response.json()
      return {error: errorData.message || "ошибка при получении данных пользователя"}
    }
  } catch (error){
    console.error("error fetching user:", error)
    return { error: "Произошла ошибка при получении пользователя"}
  }
}
