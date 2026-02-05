"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, BookOpen, Plus, Trash2, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiUrl } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Group {
  id: number
  code: string
  name: string
  subject?: {
    id: number
    name: string
  }
}

interface Subject {
  id: number
  name: string
}

interface GroupMember {
  fullName: string
  groupName: string
  completedCount: number
  defendedCount: number
}

const GroupSubjectAssignment: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [membersDialogGroup, setMembersDialogGroup] = useState<Group | null>(null)
  const [membersList, setMembersList] = useState<GroupMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const openMembersDialog = async (group: Group) => {
    setMembersDialogGroup(group)
    setMembersDialogOpen(true)
    setMembersLoading(true)
    setMembersList([])
    try {
      const res = await fetch(apiUrl(`/groups/${group.id}/members`), { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setMembersList(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error("Не удалось загрузить участников")
    } finally {
      setMembersLoading(false)
    }
  }

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          fetch(apiUrl("/groups"), { credentials: "include" }),
          fetch(apiUrl("/subjects"), { credentials: "include" })
        ])

        if (!groupsRes.ok || !subjectsRes.ok) throw new Error('Ошибка загрузки данных')

        setGroups(await groupsRes.json() || [])
        setSubjects(await subjectsRes.json() || [])
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
      const response = await fetch(apiUrl("/groups"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
        credentials: "include"
      })

      if (!response.ok) throw new Error('Ошибка создания группы')

      const newGroup = await response.json()
      setGroups([...groups, newGroup])
      setNewGroupName("")
      toast.success('Группа успешно создана')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании группы')
      toast.error('Не удалось создать группу')
    }
  }

  // Подтверждение удаления
  const confirmDeleteGroup = (group: Group) => {
    setGroupToDelete(group)
    setIsDeleteDialogOpen(true)
  }

  // Удаление группы
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return

    try {
      const response = await fetch(apiUrl(`/groups/${groupToDelete.id}`), {
        method: "DELETE",
        credentials: "include"
      })

      if (!response.ok) throw new Error('Ошибка удаления группы')

      setGroups(groups.filter(group => group.id !== groupToDelete.id))
      toast.success('Группа успешно удалена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении группы')
      toast.error('Не удалось удалить группу')
    } finally {
      setIsDeleteDialogOpen(false)
      setGroupToDelete(null)
    }
  }

  // Изменение предмета
  const handleSubjectChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroupId || !selectedSubjectId) return

    try {
      const response = await fetch(apiUrl("/groups/subject"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: Number(selectedGroupId),
          subjectId: Number(selectedSubjectId)
        }),
        credentials: "include"
      })

      if (!response.ok) throw new Error('Ошибка обновления предмета')

      const updatedGroups = groups.map(group =>
          group.id.toString() === selectedGroupId
              ? { ...group, subject: subjects.find(s => s.id.toString() === selectedSubjectId) }
              : group
      )

      setGroups(updatedGroups)
      toast.success('Предмет успешно назначен группе')

      setSelectedGroupId("")
      setSelectedSubjectId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении предмета')
      toast.error('Не удалось назначить предмет')
    }
  }

  return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Диалог подтверждения удаления */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы собираетесь удалить группу &quot;{groupToDelete?.name}&quot;. Это действие нельзя отменить.
                Все связанные данные (студенты, записи) станут неактивны.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteGroup}
                  className="bg-red-600 hover:bg-red-700"
              >
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Участники группы {membersDialogGroup?.name ?? ""}</DialogTitle>
            </DialogHeader>
            <div className="overflow-auto flex-1 min-h-0">
              {membersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : membersList.length === 0 ? (
                <p className="text-sm text-gray-500">Нет участников или группа не загружена.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">ФИО</th>
                      <th className="text-left py-2 font-medium">Группа</th>
                      <th className="text-right py-2 font-medium">Выполнено</th>
                      <th className="text-right py-2 font-medium">Защищено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersList.map((m, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2">{m.fullName}</td>
                        <td className="py-2">{m.groupName}</td>
                        <td className="py-2 text-right">{m.completedCount}</td>
                        <td className="py-2 text-right">{m.defendedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
                      <div key={group.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <h3 className="font-semibold">{group.name}</h3>
                            <p className="text-sm text-gray-500">Код: {group.code}</p>
                            <p className="text-sm mt-1">
                              Текущий предмет: {group.subject?.name || "Не назначен"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => openMembersDialog(group)}
                                title="Участники группы"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => confirmDeleteGroup(group)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name} ({group.code})
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
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
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