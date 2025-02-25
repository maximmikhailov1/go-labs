"use clients"

export async function createTeam(formData: FormData) {
  const teamName = formData.get("teamName")

  try {
    const response = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: teamName }),
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при создании команды" }
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return { error: "Произошла ошибка при создании команды" }
  }
}

export async function updateTeamName(teamCode: string, newName: string) {
  try {
    const response = await fetch(`/api/team?code=${teamCode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при обновлении названия команды" }
    }
  } catch (error) {
    console.error("Error updating team name:", error)
    return { error: "Произошла ошибка при обновлении названия команды" }
  }
}

export async function joinTeam(teamCode: string) {
  try {
    const response = await fetch(`/api/team?code=${teamCode}`, {
      method: "PUT",
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при вступлении в команду" }
    }
  } catch (error) {
    console.error("Error joining team:", error)
    return { error: "Произошла ошибка при вступлении в команду" }
  }
}


export async function getUserTeams() {
  try {
    const response = await fetch("/api/team", {
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, teams: data }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при получении команд" }
    }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return { error: "Произошла ошибка при получении команд" }
  }
}

export async function getUser(){
  try{
    const response = await fetch("/api/user",{
      method: "GET",
      credentials:"include"
    })
    if (response.ok){
      const data = await response.json()
      console.log(data)
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

export async function leaveTeam(teamCode: string) {
  try {
    const response = await fetch(`/api/team?code=${teamCode}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { error: errorData.message || "Ошибка при выходе из команды" }
    }
  } catch (error) {
    console.error("Error leaving team:", error)
    return { error: "Произошла ошибка при выходе из команды" }
  }
}



