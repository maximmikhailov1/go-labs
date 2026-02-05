"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, EthernetPort, Router, Route, Clock, User, Book, Home } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiUrl } from "@/lib/api"

type ScheduleRecord = {
  id: number
  labDate: string
  classNumber: number
  audienceNumber: number
  hpRouters: number
  hpSwitches: number
  routers: number
  switches: number
  wirelessRouters: number
  tutor: {
    id: number
    fullName: string
  }
  entries: {
    id: number
    team: {
      id: number
      name: string
      members: {
        id: number
        fullName: string
        group: string
      }[]
    }
    lab: {
      id: number
      number: string
      description: string
      maxStudents: number
    }
  }[]
}

const TIME_SLOTS = ["08:50-10:20", "10:35-12:05", "12:35-14:05", "14:15-15:45", "15:55-17:20", "17:30-19:00"]

const AllTeachersSchedule = () => {
  const [weekIndex, setWeekIndex] = useState(0)
  const [weekData, setWeekData] = useState<ScheduleRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ScheduleRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSlotDate, setAddSlotDate] = useState("")
  const [addSlotNumber, setAddSlotNumber] = useState(0)
  const [addAudience, setAddAudience] = useState("")

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const res = await fetch(apiUrl(`/schedules/week?week=${weekIndex}`), { credentials: "include" })
        if (res.ok) setWeekData(await res.json())
        else setWeekData([])
      } catch {
        setWeekData([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchWeek()
  }, [weekIndex])

  const getDaysOfWeek = (w: number) => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - (today.getDay() || 7) + 1)
    start.setDate(start.getDate() + w * 7)
    return Array(5).fill(null).map((_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d.toISOString().split("T")[0]
    })
  }

  const groupBySlot = (records: ScheduleRecord[] | null | undefined) => {
    const g: Record<string, ScheduleRecord[]> = {}
    ;(records ?? []).forEach((r) => {
      const datePart = r.labDate.split("T")[0]
      const key = `${datePart}-${r.classNumber}`
      if (!g[key]) g[key] = []
      g[key].push(r)
    })
    return g
  }

  const openAddDialog = (date: string, classNumber: number) => {
    setAddSlotDate(date)
    setAddSlotNumber(classNumber)
    setAddAudience("")
    setAddDialogOpen(true)
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAudience.trim()) {
      toast.error("Укажите номер аудитории")
      return
    }
    try {
      const res = await fetch(apiUrl("/schedules"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          labDate: addSlotDate + "T12:00:00.000Z",
          classNumber: addSlotNumber,
          audienceNumber: Number(addAudience)
        })
      })
      if (res.ok) {
        toast.success("Занятие добавлено")
        setAddDialogOpen(false)
        const refetch = await fetch(apiUrl(`/schedules/week?week=${weekIndex}`), { credentials: "include" })
        if (refetch.ok) setWeekData(await refetch.json())
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.message || "Ошибка создания")
      }
    } catch {
      toast.error("Ошибка создания занятия")
    }
  }

  const formatTime = (classNumber: number) => {
    const times = [
      "08:50-10:20",
      "10:35-12:05",
      "12:35-14:05",
      "14:15-15:45",
      "15:55-17:20",
      "17:30-19:00"
    ]
    return times[classNumber - 1]
  }
  const handleDeleteRecord = async (entryId: number, memberId: number) => {
    try {
      const response = await fetch(apiUrl("/schedules"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entryId, studentId: memberId })
      })
      if (response.ok) {
        toast.success("Успешно отписан")
        setSelectedRecord(null)
        const res = await fetch(apiUrl(`/schedules/week?week=${weekIndex}`), { credentials: "include" })
        if (res.ok) setWeekData(await res.json())
      } else {
        toast.error("Ошибка при отмене записи")
      }
    } catch {
      toast.error("Произошла ошибка при удалении записи")
    }
  }

  const days = getDaysOfWeek(weekIndex)
  const grouped = groupBySlot(weekData)

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Расписание
        </h1>

        <div className="flex justify-between items-center mb-4 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
            disabled={weekIndex === 0}
          >
            Пред. неделя
          </Button>
          <span className="text-sm text-muted-foreground">Неделя {weekIndex + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekIndex((i) => i + 1)}
            disabled={weekIndex >= 2}
          >
            След. неделя
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-24">Время</th>
                  {days.map((d) => (
                    <th key={d} className="text-left p-2 border-l">
                      {format(parseISO(d), "dd MMM", { locale: ru })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, idx) => {
                  const slotNum = idx + 1
                  return (
                    <tr key={slotNum} className="border-b">
                      <td className="p-2 align-top text-muted-foreground whitespace-nowrap">
                        {slot}
                        <br />
                        <span className="text-xs">Пара {slotNum}</span>
                      </td>
                      {days.map((date) => {
                        const key = `${date}-${slotNum}`
                        const records = grouped[key] ?? []
                        return (
                          <td key={key} className="p-2 border-l align-top min-w-[180px]">
                            <div className="space-y-2">
                              {records.map((r) => (
                                <div
                                  key={r.id}
                                  className="p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer text-left"
                                  onClick={() => setSelectedRecord(r)}
                                >
                                  <div className="font-medium">Ауд. {r.audienceNumber}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {r.tutor.fullName}
                                  </div>
                                  <div className="text-xs">
                                    {(r.entries ?? []).length} запис.
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-8"
                                onClick={() => openAddDialog(date, slotNum)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Диалог добавления занятия в слот */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить занятие</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <div>Дата: {addSlotDate ? format(parseISO(addSlotDate), "d MMMM yyyy", { locale: ru }) : ""}</div>
                <div>Пара: {addSlotNumber} ({TIME_SLOTS[addSlotNumber - 1]})</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Аудитория *</label>
                <Input
                  type="number"
                  placeholder="Номер аудитории"
                  value={addAudience}
                  onChange={(e) => setAddAudience(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Создать</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          {selectedRecord && (
            <>
              <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Book className="h-6 w-6" />
                  Детали занятия
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-1 min-h-0 px-6 pb-6 gap-6">
                {/* Левая панель: инфо о занятии */}
                <div className="shrink-0 w-64 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(parseISO(selectedRecord.labDate), "d MMMM yyyy", { locale: ru })}
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Пара {selectedRecord.classNumber} ({formatTime(selectedRecord.classNumber)})
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      Аудитория {selectedRecord.audienceNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedRecord.tutor.fullName}
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Роутеры: {selectedRecord.routers}
                    </div>
                    <div className="flex items-center gap-2">
                      <EthernetPort className="h-4 w-4" />
                      Коммутаторы: {selectedRecord.switches}
                    </div>
                    <div className="flex items-center gap-2">
                      <Router className="h-4 w-4" />
                      Беспроводные: {selectedRecord.wirelessRouters}
                    </div>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      HP роутеры: {selectedRecord.hpRouters}
                    </div>
                    <div className="flex items-center gap-2">
                      <EthernetPort className="h-4 w-4" />
                      HP коммутаторы: {selectedRecord.hpSwitches}
                    </div>
                  </div>
                </div>

                {/* Правая панель: карточки по лабораторным (скролл) */}
                <div className="flex-1 min-w-0 flex flex-col border-l pl-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Записи по лабораторным</h3>
                  <div className="overflow-y-auto space-y-4 pr-2">
                    {(() => {
                      const entries = selectedRecord.entries ?? []
                      const byLab = new Map<number, typeof entries>()
                      entries.forEach((entry) => {
                        const labId = entry.lab.id
                        if (!byLab.has(labId)) byLab.set(labId, [])
                        byLab.get(labId)!.push(entry)
                      })
                      return Array.from(byLab.entries()).map(([labId, labEntries]) => {
                        const lab = labEntries[0]!.lab
                        const totalEnrolled = labEntries.reduce(
                          (sum, e) => sum + (e.team.members?.length ?? 0),
                          0
                        )
                        const totalMax = labEntries.reduce((sum, e) => sum + e.lab.maxStudents, 0)
                        const allMembers = labEntries.flatMap((e) =>
                          (e.team.members ?? []).map((m) => ({ ...m, entryId: e.id }))
                        )
                        const emptySlots = Math.max(0, totalMax - totalEnrolled)
                        return (
                          <Card key={labId} className="overflow-hidden">
                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                              <div>
                                <CardTitle className="text-base">
                                  Лабораторная {lab.number}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {totalEnrolled}/{totalMax}
                                </p>
                              </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                              <div className="space-y-1.5">
                                {allMembers.map((member) => (
                                  <div
                                    key={`${member.entryId}-${member.id}`}
                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      <span className="truncate">{member.fullName}</span>
                                      <span className="shrink-0 text-muted-foreground">{member.group}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive shrink-0 h-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteRecord(member.entryId, member.id)
                                      }}
                                    >
                                      Удалить
                                    </Button>
                                  </div>
                                ))}
                                {Array.from({ length: emptySlots }).map((_, i) => (
                                  <Skeleton key={`empty-${labId}-${i}`} className="h-10 w-full rounded-md" />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    })()}
                    {(!selectedRecord.entries || selectedRecord.entries.length === 0) && (
                      <p className="text-sm text-muted-foreground">Нет записей</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AllTeachersSchedule