"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, BookOpen } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiUrl } from "@/lib/api"

const TIME_SLOTS = ["08:50-10:20", "10:35-12:05", "12:35-14:05", "14:15-15:45", "15:55-17:20", "17:30-19:00"]

type RecordItem = {
  id: number
  labDate: string
  classNumber: number
  audienceNumber: number
  tutor: { id: number; fullName: string }
  entries: {
    id: number
    status: string
    lab: { id: number; number: string; description: string; maxStudents: number }
    team: {
      id: number
      name: string
      members: { id: number; fullName: string; group: string }[]
    }
  }[]
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Не выполнена",
  completed: "Выполнена",
  defended: "Защищена"
}

const TeacherGrades = () => {
  const [data, setData] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchRecords = async () => {
    try {
      const res = await fetch(apiUrl("/records"), { credentials: "include" })
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error(e)
      toast.error("Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleStatusChange = async (entryId: number, status: string) => {
    setUpdatingId(entryId)
    try {
      const res = await fetch(apiUrl(`/records/entries/${entryId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success("Статус обновлён")
        fetchRecords()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.message || "Ошибка обновления")
      }
    } catch {
      toast.error("Ошибка обновления статуса")
    } finally {
      setUpdatingId(null)
    }
  }

  const formatTime = (classNumber: number) => TIME_SLOTS[classNumber - 1] ?? ""

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Журнал оценок
        </h1>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        Журнал оценок
      </h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Занятия и записи
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Дата</th>
                  <th className="text-left py-3 px-4 font-medium">Пара</th>
                  <th className="text-left py-3 px-4 font-medium">Аудитория</th>
                  <th className="text-left py-3 px-4 font-medium">Преподаватель</th>
                  <th className="text-left py-3 px-4 font-medium">Лабораторная</th>
                  <th className="text-left py-3 px-4 font-medium">Команда</th>
                  <th className="text-left py-3 px-4 font-medium">Участники</th>
                  <th className="text-left py-3 px-4 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {data.flatMap((record) =>
                  (record.entries ?? []).map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-4 whitespace-nowrap">
                        {format(parseISO(record.labDate), "dd.MM.yyyy", { locale: ru })}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        {record.classNumber} ({formatTime(record.classNumber)})
                      </td>
                      <td className="py-2 px-4">{record.audienceNumber}</td>
                      <td className="py-2 px-4">{record.tutor.fullName}</td>
                      <td className="py-2 px-4">
                        {entry.lab.number} — {entry.lab.description}
                      </td>
                      <td className="py-2 px-4">{entry.team.name}</td>
                      <td className="py-2 px-4">
                        {(entry.team.members ?? []).map((m) => m.fullName).join(", ") || "—"}
                      </td>
                      <td className="py-2 px-4">
                        <Select
                          value={entry.status || "scheduled"}
                          onValueChange={(v) => handleStatusChange(entry.id, v)}
                          disabled={updatingId === entry.id}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">{STATUS_LABELS.scheduled}</SelectItem>
                            <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                            <SelectItem value="defended">{STATUS_LABELS.defended}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Нет записей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TeacherGrades
