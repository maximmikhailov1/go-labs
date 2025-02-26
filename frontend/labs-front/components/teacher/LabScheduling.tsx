"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {ru} from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const LabScheduling: React.FC = () => {
  const [date, setDate] = useState<Date>()
  const [classNumber, setClassNumber] = useState("")
  const [audienceNumber, setAudienceNumber] = useState("")
  const [selectedTutor, setSelectedTutor] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Lab scheduled:", { date, classNumber, audienceNumber, selectedTutor })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Планирование лабораторного занятия
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Дата проведения
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Номер пары
              </label>
              <Select onValueChange={setClassNumber} value={classNumber}>
                <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 h-12">
                  <SelectValue placeholder="Выберите номер пары" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem 
                      key={num} 
                      value={num.toString()}
                      className="hover:bg-gray-50"
                    >
                      Пара {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Номер аудитории
              </label>
              <Input
                type="number"
                placeholder="Введите номер аудитории"
                value={audienceNumber}
                onChange={(e) => setAudienceNumber(e.target.value)}
                className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Преподаватель
              </label>
              <Select onValueChange={setSelectedTutor} value={selectedTutor}>
                <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 h-12">
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                  <SelectItem value="tutor1" className="hover:bg-gray-50">
                    Преподаватель 1
                  </SelectItem>
                  <SelectItem value="tutor2" className="hover:bg-gray-50">
                    Преподаватель 2
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-sm"
            >
              Запланировать занятие
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LabScheduling