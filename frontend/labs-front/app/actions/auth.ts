"use client"

export async function signIn(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  try {
    const response = await fetch("/api/signin", {
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

export async function signUp(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const middleName = formData.get("middleName")
  const groupCode = formData.get("groupCode")

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, firstName, lastName, middleName, groupCode }),
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
    const response = await fetch("/api/logout", {
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

export async function enrollInClass(date: string, slotNumber: number) {
    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, slotNumber }),
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
  