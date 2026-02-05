"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, BookOpen } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiUrl } from "@/lib/api"
import { getUser } from "@/app/actions/auth"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const TIME_SLOTS = ["08:50-10:20", "10:35-12:05", "12:35-14:05", "14:15-15:45", "15:55-17:20", "17:30-19:00"]
const PAGE_SIZE = 20

type TutorRecordRow = {
  recordId: number
  labDate: string
  classNumber: number
  audienceNumber: number
  tutorId: number
  tutorFullName: string
  entryId: number
  labId: number
  labNumber: string
  labDescription: string
  labMaxStudents: number
  teamId: number
  teamName: string
  memberId: number
  memberFullName: string
  groupName: string
  status: string
}

type PaginatedResponse = { data: TutorRecordRow[]; totalCount: number }

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Записан",
  needsGrade: "Требует оценки",
  completed: "Выполнена",
  defended: "Защищена",
  no_show: "Неявка",
  cancelled: "Отменено"
}

function isLabDateInPast(labDateStr: string): boolean {
  const d = parseISO(labDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const result: (number | "ellipsis")[] = [1]
  if (currentPage > 3) result.push("ellipsis")
  const start = Math.max(2, currentPage - 2)
  const end = Math.min(totalPages - 1, currentPage + 2)
  for (let i = start; i <= end; i++) {
    if (!result.includes(i)) result.push(i)
  }
  if (currentPage < totalPages - 2) result.push("ellipsis")
  if (totalPages > 1) result.push(totalPages)
  return result
}

type GroupItem = { id: number; name: string }
type TutorItem = { id: number; fullName: string }

const TeacherGrades = () => {
  const [rows, setRows] = useState<TutorRecordRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [tutors, setTutors] = useState<TutorItem[]>([])
  const [filterGroupId, setFilterGroupId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterNeedsGrade, setFilterNeedsGrade] = useState(false)
  const [filterTutorId, setFilterTutorId] = useState<string>("")
  const [labDateFrom, setLabDateFrom] = useState("")
  const [labDateTo, setLabDateTo] = useState("")
  const nextPageCache = useRef<Record<number, PaginatedResponse>>({})
  const filterKey = `${filterGroupId}|${filterTutorId}|${filterStatus}|${filterNeedsGrade}|${labDateFrom}|${labDateTo}`
  const prevFilterKey = useRef(filterKey)

  const fetchPage = useCallback(async (p: number, showLoading = true) => {
    const cached = nextPageCache.current[p]
    if (cached) {
      setRows(cached.data)
      setTotalCount(cached.totalCount)
      setLoading(false)
      return cached
    }
    if (showLoading) setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    params.set("limit", String(PAGE_SIZE))
    if (filterGroupId) params.set("groupId", filterGroupId)
    if (filterTutorId) params.set("tutorId", filterTutorId)
    if (filterNeedsGrade) params.set("needsGrade", "true")
    else if (filterStatus) params.set("status", filterStatus)
    if (labDateFrom) params.set("labDateFrom", labDateFrom)
    if (labDateTo) params.set("labDateTo", labDateTo)
    try {
      const res = await fetch(apiUrl(`/records?${params.toString()}`), { credentials: "include" })
      if (!res.ok) throw new Error("Ошибка загрузки")
      const json: PaginatedResponse = await res.json()
      setRows(json.data ?? [])
      setTotalCount(json.totalCount ?? 0)
      nextPageCache.current[p] = json
      return json
    } catch (e) {
      console.error(e)
      toast.error("Ошибка загрузки данных")
      return null
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [filterGroupId, filterTutorId, filterStatus, filterNeedsGrade, labDateFrom, labDateTo])

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey
      setPage(1)
      nextPageCache.current = {}
      fetchPage(1)
    } else {
      fetchPage(page)
    }
  }, [page, filterKey, fetchPage])

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [groupsRes, tutorsRes, userRes] = await Promise.all([
          fetch(apiUrl("/groups"), { credentials: "include" }),
          fetch(apiUrl("/users/tutors"), { credentials: "include" }),
          getUser()
        ])
        if (groupsRes.ok) setGroups((await groupsRes.json()) ?? [])
        if (tutorsRes.ok) setTutors((await tutorsRes.json()) ?? [])
        if (userRes.success && userRes.user?.id) {
          setFilterTutorId(String(userRes.user.id))
        }
      } catch {
        // optional
      }
    }
    loadFilters()
  }, [])

  useEffect(() => {
    setPage(1)
    nextPageCache.current = {}
  }, [filterGroupId, filterTutorId, filterStatus, filterNeedsGrade, labDateFrom, labDateTo])

  useEffect(() => {
    if (rows.length === 0 || page < 1) return
    const nextP = page + 1
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    if (nextP > totalPages) return
    if (nextPageCache.current[nextP]) return
    const params = new URLSearchParams()
    params.set("page", String(nextP))
    params.set("limit", String(PAGE_SIZE))
    if (filterGroupId) params.set("groupId", filterGroupId)
    if (filterTutorId) params.set("tutorId", filterTutorId)
    if (filterNeedsGrade) params.set("needsGrade", "true")
    else if (filterStatus) params.set("status", filterStatus)
    if (labDateFrom) params.set("labDateFrom", labDateFrom)
    if (labDateTo) params.set("labDateTo", labDateTo)
    fetch(apiUrl(`/records?${params.toString()}`), { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((json: PaginatedResponse | null) => {
        if (json) nextPageCache.current[nextP] = json
      })
      .catch(() => {})
  }, [page, totalCount, rows.length, filterGroupId, filterTutorId, filterStatus, filterNeedsGrade, labDateFrom, labDateTo])

  const handleStatusChange = async (entryId: number, status: string, userId?: number) => {
    const key = userId != null ? `${entryId}-${userId}` : String(entryId)
    setUpdatingKey(key)
    try {
      const body = userId != null ? { status, userId } : { status }
      const res = await fetch(apiUrl(`/records/entries/${entryId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success("Статус обновлён")
        nextPageCache.current = {}
        fetchPage(page)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.message || "Ошибка обновления")
      }
    } catch {
      toast.error("Ошибка обновления статуса")
    } finally {
      setUpdatingKey(null)
    }
  }

  const goToPage = (p: number) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  const formatTime = (classNumber: number) => TIME_SLOTS[classNumber - 1] ?? ""
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  if (loading && rows.length === 0) {
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
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <span className="text-sm text-muted-foreground">Группа:</span>
            <div className="flex flex-wrap gap-1">
              <Button variant={filterGroupId === "" ? "default" : "outline"} size="sm" onClick={() => setFilterGroupId("")}>
                Все
              </Button>
              {groups.map((g) => (
                <Button
                  key={g.id}
                  variant={filterGroupId === String(g.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterGroupId(String(g.id))}
                >
                  {g.name}
                </Button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">Статус:</span>
            <Select
              value={filterNeedsGrade ? "needsGrade" : filterStatus || "all"}
              onValueChange={(v) => {
                if (v === "needsGrade") {
                  setFilterNeedsGrade(true)
                  setFilterStatus("")
                } else {
                  setFilterNeedsGrade(false)
                  setFilterStatus(v === "all" ? "" : v)
                }
              }}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="needsGrade">{STATUS_LABELS.needsGrade}</SelectItem>
                <SelectItem value="scheduled">{STATUS_LABELS.scheduled}</SelectItem>
                <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                <SelectItem value="defended">{STATUS_LABELS.defended}</SelectItem>
                <SelectItem value="no_show">{STATUS_LABELS.no_show}</SelectItem>
                <SelectItem value="cancelled">{STATUS_LABELS.cancelled}</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-2">Преподаватель:</span>
            <Select value={filterTutorId || "all"} onValueChange={(v) => setFilterTutorId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {tutors.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-2">Дата занятия:</span>
            <Input
              type="date"
              className="w-[140px] h-8"
              value={labDateFrom}
              onChange={(e) => setLabDateFrom(e.target.value)}
              placeholder="От"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="date"
              className="w-[140px] h-8"
              value={labDateTo}
              onChange={(e) => setLabDateTo(e.target.value)}
              placeholder="До"
            />
          </div>
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
                  <th className="text-left py-3 px-4 font-medium">Студент</th>
                  <th className="text-left py-3 px-4 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const teamKey = `${row.recordId}-${row.teamId}`
                  const isFirstInTeam = idx === 0 || `${rows[idx - 1].recordId}-${rows[idx - 1].teamId}` !== teamKey
                  const needsGrade = isLabDateInPast(row.labDate) && row.status === "scheduled"
                  const displayStatus = needsGrade ? "Требует оценки" : (STATUS_LABELS[row.status] ?? row.status)
                  const key = `${row.entryId}-${row.memberId}`
                  return (
                    <React.Fragment key={key}>
                      {isFirstInTeam && (
                        <tr className="bg-muted/40">
                          <td colSpan={7} className="py-1.5 px-4 text-xs font-medium text-muted-foreground">
                            Команда: {row.teamName}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-2 px-4 whitespace-nowrap">
                          {format(parseISO(row.labDate), "dd.MM.yyyy", { locale: ru })}
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          {row.classNumber} ({formatTime(row.classNumber)})
                        </td>
                        <td className="py-2 px-4">{row.audienceNumber}</td>
                        <td className="py-2 px-4">{row.tutorFullName}</td>
                        <td className="py-2 px-4">{row.labNumber}</td>
                        <td className="py-2 px-4">
                          {row.memberFullName}
                          {row.groupName ? ` (${row.groupName})` : ""}
                        </td>
                        <td className="py-2 px-4">
                          <Select
                            value={row.status}
                            onValueChange={(v) => handleStatusChange(row.entryId, v, row.memberId)}
                            disabled={updatingKey === key || row.status === "cancelled"}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue>{displayStatus}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {needsGrade ? (
                                <>
                                  <SelectItem value="scheduled" disabled>{STATUS_LABELS.needsGrade}</SelectItem>
                                  <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                                  <SelectItem value="defended">{STATUS_LABELS.defended}</SelectItem>
                                  <SelectItem value="no_show">{STATUS_LABELS.no_show}</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="scheduled">{STATUS_LABELS.scheduled}</SelectItem>
                                  <SelectItem value="completed">{STATUS_LABELS.completed}</SelectItem>
                                  <SelectItem value="defended">{STATUS_LABELS.defended}</SelectItem>
                                  <SelectItem value="no_show">{STATUS_LABELS.no_show}</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    </React.Fragment>
                  )
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Нет записей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Строк: {totalCount} · страница {page} из {totalPages}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                    />
                  </PaginationItem>
                  {getPageNumbers(page, totalPages).map((item, i) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={page === item}
                          onClick={() => goToPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TeacherGrades
