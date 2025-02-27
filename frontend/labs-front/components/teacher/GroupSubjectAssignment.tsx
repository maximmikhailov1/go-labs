"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, BookOpen, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Group {
  ID: number
  Code: string
  Name: string
  Subject?: {
    ID: number
    Name: string
  }
}

interface Subject {
  ID: number
  Name: string
}

const GroupSubjectAssignment: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/subjects')
        ])
        
        if (!groupsRes.ok || !subjectsRes.ok) throw new Error('Ошибка загрузки данных')
        
        setGroups(await groupsRes.json())
        setSubjects(await subjectsRes.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Создание группы
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName) return

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName })
      })

      if (!response.ok) throw new Error('Ошибка создания группы')
      
      const newGroup = await response.json()
      setGroups([...groups, newGroup])
      setNewGroupName("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании группы')
    }
  }

  // Изменение предмета
  const handleSubjectChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroupId || !selectedSubjectId) return

    try {
      const response = await fetch('/api/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          subjectId: selectedSubjectId
        })
      })

      if (!response.ok) throw new Error('Ошибка обновления предмета')
      
      // Обновляем список групп
      const updatedGroups = groups.map(group => 
        group.ID.toString() === selectedGroupId
          ? { ...group, Subject: subjects.find(s => s.ID.toString() === selectedSubjectId) }
          : group
      )
      setGroups(updatedGroups)
      
      setSelectedGroupId("")
      setSelectedSubjectId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении предмета')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Форма создания группы */}
      <Card className="border-0 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Plus className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Создание новой группы
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleCreateGroup} className="flex gap-4">
            <Input
              placeholder="Название группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Создать группу
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Список групп */}
      <Card className="border-0 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Список групп
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.ID} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{group.Name}</h3>
                      <p className="text-sm text-gray-500">Код: {group.Code}</p>
                      <p className="text-sm mt-1">
                        Текущий предмет: {group.Subject?.Name || 'Не назначен'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Назначение предмета */}
      <Card className="border-0 shadow-sm rounded-xl bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Назначение предмета группе
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && <div className="text-red-500 p-3 bg-red-50 rounded-lg">{error}</div>}

          <form onSubmit={handleSubjectChange} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Группа</label>
                <Select 
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите группу" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.ID} value={group.ID.toString()}>
                        {group.Name} ({group.Code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Предмет</label>
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.ID} value={subject.ID.toString()}>
                        {subject.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedGroupId || !selectedSubjectId}
            >
              Назначить предмет
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default GroupSubjectAssignment