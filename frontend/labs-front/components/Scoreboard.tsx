"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Award } from "lucide-react"
import { apiUrl } from "@/lib/api"

type ScoreboardEntry = {
  rank: number
  userId: number
  fullName: string
  completedCount: number
  defendedCount: number
}

const Scoreboard = () => {
  const [list, setList] = useState<ScoreboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const res = await fetch(apiUrl("/scoreboard"), { credentials: "include" })
        if (!res.ok) {
          setError("Не удалось загрузить скорборд")
          return
        }
        const data = await res.json()
        setList(Array.isArray(data) ? data : [])
      } catch {
        setError("Ошибка загрузки")
      } finally {
        setLoading(false)
      }
    }
    fetchScoreboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-red-600">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-xl bg-white">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Скорборд группы
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-medium text-gray-600">Место</TableHead>
              <TableHead className="font-medium text-gray-600">ФИО</TableHead>
              <TableHead className="font-medium text-gray-600 text-right">Выполнено</TableHead>
              <TableHead className="font-medium text-gray-600 text-right">Защищено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((entry) => (
              <TableRow key={entry.userId} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {entry.rank <= 1 && <Medal className="h-5 w-5 text-amber-500" />}
                    {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                    {entry.rank === 3 && <Medal className="h-5 w-5 text-amber-700" />}
                    {entry.rank > 3 && <Award className="h-4 w-4 text-gray-400" />}
                    {entry.rank}
                  </span>
                </TableCell>
                <TableCell className="text-gray-800">{entry.fullName}</TableCell>
                <TableCell className="text-right text-gray-600">{entry.completedCount}</TableCell>
                <TableCell className="text-right text-gray-600 font-medium">{entry.defendedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {list.length === 0 && (
          <p className="text-center text-gray-500 py-8">Пока нет данных для отображения.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default Scoreboard
