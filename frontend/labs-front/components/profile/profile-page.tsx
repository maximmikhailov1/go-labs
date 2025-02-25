"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createTeam, joinTeam, getUserTeams, updateTeamName, leaveTeam, getUser } from "@/app/actions/team"
import { Plus } from "lucide-react"

interface Team {
  ID: string
  Name: string
  Code: string
  Members: User[]
}

interface User {
  FullName:string
  GroupName:string
}

interface Record {
  date: string
  slot: number
  lab: string
  team: string
  completed: boolean
}

export function ProfilePage() {
  const [selectedTeam, setSelectedTeam] = useState<string>("solo")
  const [teams, setTeams] = useState<Team[]>([])
  const [user, setUser] = useState<User>({FullName:"Idiot Kudryashev",GroupName:"Debili"});
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [joinTeamCode, setJoinTeamCode] = useState("")
  const [records, setRecords] = useState<Record[]>([])
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [editTeamName, setEditTeamName] = useState("")

  useEffect(() => {
    fetchTeams()
    fetchUser()
  }, [])


  const fetchUser = async() => {
    const result = await getUser()
    if (result.success && result.user) {
      setUser(result.user)
    }
    
  }

  const fetchTeams = async () => {
    const result = await getUserTeams()
    if (result.success && result.teams) {
      setTeams(result.teams)
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
    <div className="w-full container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ФИО</Label>
                <div className="font-medium">{user.FullName}</div>
              </div>
              <div>
                <Label>Группа</Label>
                <div className="font-medium">{user.GroupName}</div>
              </div>
            </div>

            <div>
              <Label>Текущая команда</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Соло</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.ID} value={team.Code}>
                      {team.Name} ({team.Code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Пара</TableHead>
                  <TableHead>Лаба</TableHead>
                  <TableHead>Команда</TableHead>
                  <TableHead>Выполнил?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.slot}</TableCell>
                    <TableCell>{record.lab}</TableCell>
                    <TableCell>{record.team}</TableCell>
                    <TableCell>{record.completed ? "Да" : "Нет"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Управление командами</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Присоединиться к команде</Label>
              <form onSubmit={handleJoinTeam} className="flex gap-2">
                <Input
                  placeholder="Введите код команды"
                  value={joinTeamCode}
                  onChange={(e) => setJoinTeamCode(e.target.value)}
                />
                <Button type="submit">Вступить</Button>
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Мои команды</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateTeam(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать команду
                </Button>
              </div>

              {showCreateTeam && (
                <form onSubmit={handleCreateTeam} className="space-y-2">
                  <Input
                    placeholder="Название команды"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Создать</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowCreateTeam(false)}>
                      Отмена
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.ID} className="p-2 border rounded-lg">
                    {editingTeam === team.Code ? (
                      <div className="flex gap-2">
                        <Input
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          placeholder="Новое название команды"
                        />
                        <Button size="sm" onClick={() => handleUpdateTeamName(team.Code)}>
                          Сохранить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTeam(null)
                            setEditTeamName("")
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{team.Name}</div>
                          <div className="text-sm text-muted-foreground">Код: {team.Code}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTeam(team.Code)
                              setEditTeamName(team.Name)
                            }}
                          >
                            Изменить
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleLeaveTeam(team.Code)}>
                            Покинуть
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">Участники: {team.Members.map(user => user.FullName).join(", ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

