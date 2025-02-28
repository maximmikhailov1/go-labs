"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { parseISO } from "date-fns/parseISO"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface Team {
  ID: string
  Name: string
  Code: string
  Members: User[]
}
interface User {
  fullName: string
  groupName:string
}
interface Record {
    id:           number
		lab_name:     string
		lab_date:     string
    lab_number:   string
    class_number: number
		audience:     number
		status:       string
		team_name:    string 
		team_member:  number
}

export function ProfilePage() {
  const [selectedTeam, setSelectedTeam] = useState<string>("solo");
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [joinTeamCode, setJoinTeamCode] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [user, setUser] = useState<User>(() => {
    // Инициализация из localStorage при монтировании
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
    return savedUser ? JSON.parse(savedUser) : { fullName: "", groupName: "" };
  });

  useEffect(() => {
    const loadData = async () => {
      // Загрузка пользователя с кэшированием
      const cachedUser = localStorage.getItem('userProfile');
      if (!cachedUser) {
        await fetchUser();
      }
      
      // Всегда загружаем свежие данные команд
      await fetchTeams();
      await fetchRecords();
    };
    loadData();
  }, []);

  const fetchRecords = async () => {
    try{
      const result = await getUserRecords()
      if (result.success && result.records) {
        setRecords(result.records)
      }
    } catch (error){
      console.log(error)
    }
  }

  const fetchTeams = async () => {
    try {
      const result = await getUserTeams();
      if (result.success && result.teams) {
        setTeams(result.teams);
      }
    } finally {
    }
  };
  
  const fetchUser = async () => {
    const result = await getUser();
    if (result.success && result.user) {
      setUser(result.user);
      // Сохраняем в localStorage
      localStorage.setItem('userProfile', JSON.stringify(result.user));
    }
  };

  async function createTeam(formData: FormData) {
    const teamName = formData.get("teamName")
  
    try {
      const response = await fetch("/api/user/teams", {
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
  
  async function updateTeamName(teamCode: string, newName: string) {
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
  
  async function joinTeam(teamCode: string) {
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
  
  
  async function getUserTeams() {
    try {
      const response = await fetch("/api/user/teams", {
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

  async function getUserRecords(){
    try {
      const response = await fetch("/api/user/records", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        return {success:true, records: data}
      } else {
        const errorData = await response.json()
        return {error: errorData.message || "Ошибка при получении записей"}}
      } catch(error) {
        console.error("Error fetching records:", error)
        return { error : "Произошла ошибка при получении записей"}
      }
    }
  
  async function getUser(){
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
  
  async function leaveTeam(teamCode: string) {
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


  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("teamName", newTeamName)
    const result = await createTeam(formData)
    if (result.success) {
      setNewTeamName("")
      setShowCreateTeam(false)
      fetchTeams()
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await joinTeam(joinTeamCode)
    if (result.success) {
      setJoinTeamCode("")
      fetchTeams()
    }
  }

  const handleUpdateTeamName = async (teamCode: string) => {
    const result = await updateTeamName(teamCode, editTeamName)
    if (result.success) {
      setEditingTeam(null)
      setEditTeamName("")
      fetchTeams()
    }
  }

  const handleLeaveTeam = async (teamCode: string) => {
    const result = await leaveTeam(teamCode)
    if (result.success) {
      fetchTeams()
      if (selectedTeam === teamCode) {
        setSelectedTeam("solo")
      }
    } else {
      console.error("Ошибка при выходе из команды:", result.error)
      // Здесь можно добавить отображение ошибки пользователю
    }
  }

  return (
    <div>
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Левая колонка */}
      <Card className="border-0 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800">👤 Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">ФИО</Label>
              <div className="font-medium text-gray-800 text-lg animate-fade-in">
                {user.fullName || <span className="text-gray-400">Загрузка...</span>}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">{user.groupName || <span>Должность</span>}</Label>
              <div className="font-medium text-gray-800 text-lg animate-fade-in">
                {user.groupName || <span className="text-gray-800">Преподаватель</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Правая колонка */}
      <Card className="border-0 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800">👥 Управление командами</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Присоединиться к команде</Label>
              <form onSubmit={handleJoinTeam} className="flex gap-2">
                <Input
                  placeholder="Введите код команды"
                  value={joinTeamCode}
                  onChange={(e) => setJoinTeamCode(e.target.value)}
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  type="submit"
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Присоединиться
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-500">Мои команды</Label>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateTeam(true)}
                  className="rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать команду
                </Button>
              </div>

              {showCreateTeam && (
                <form onSubmit={handleCreateTeam} className="space-y-3">
                  <Input
                    placeholder="Название команды"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm flex-1"
                    >
                      Создать
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setShowCreateTeam(false)}
                      className="rounded-lg border border-gray-300 hover:bg-gray-50 flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {teams.map((team) => (
                  <div 
                    key={team.ID} 
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {editingTeam === team.Code ? (
                      <div className="flex gap-2">
                        <Input
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          placeholder="Новое название команды"
                          className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateTeamName(team.Code)}
                          className="rounded-lg bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                          Сохранить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTeam(null)
                            setEditTeamName("")
                          }}
                          className="rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{team.Name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Код: <span className="font-mono">{team.Code}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            👥 Участники: {team.Members.map(user => user.fullName).join(", ")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTeam(team.Code)
                              setEditTeamName(team.Name)
                            }}
                            className="text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            Изменить
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleLeaveTeam(team.Code)}
                            className="rounded-lg shadow-sm"
                          >
                            Покинуть
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    {user.groupName && <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
        <div className="border rounded-lg overflow-hidden">
              <Table className="">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {["Дата", "Пара", "Лаба", "Статус"].map((header) => (
                      <TableHead key={header} className="text-gray-600 font-medium py-3">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (

                    <TableRow 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <TableCell className="font-medium text-gray-700">  {record.lab_date ? format(parseISO(record.lab_date), "d MMMM yyyy", { locale: ru }) : "Дата не указана"}</TableCell>
                      <TableCell className="text-gray-600">{record.class_number}</TableCell>
                      <TableCell className="text-gray-600">{record.lab_name}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {(record.status == "active") ? "✅ Выполнено" : "🕒 Записан"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </CardContent>
        </Card>
      </div>
}
    </div>
    

  )
}
