"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ru } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Tutor {
  ID: string
  fullName: string
}

const LabScheduling: React.FC = () => {
  const [date, setDate] = useState<Date>()
  const [classNumber, setClassNumber] = useState("")
  const [audienceNumber, setAudienceNumber] = useState("")
  const [selectedTutorId, setSelectedTutorId] = useState("")
  const [selectedTutorName, setSelectedTutorName] = useState("")
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoadingTutors, setIsLoadingTutors] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('/api/tutors')
        if (!response.ok) {
          throw new Error('Ошибка загрузки преподавателей')
        }
        setTutors(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setIsLoadingTutors(false)
      }
    }

    fetchTutors()
  }, [])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!date) errors.date = "Выберите дату"
    if (!classNumber) errors.classNumber = "Выберите номер пары"
    if (!audienceNumber) errors.audienceNumber = "Введите номер аудитории"
    if (!selectedTutorId) errors.tutor = "Выберите преподавателя"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleTutorChange = (value: string) => {
    const selectedTutor = tutors.find(tutor => tutor.ID === value);
    if (selectedTutor) {
      setSelectedTutorId(selectedTutor.ID);
      setSelectedTutorName(selectedTutor.fullName);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "LabDate": date,
          "ClassNumber": Number(classNumber),
          "AudienceNumber": Number(audienceNumber),
          "TutorID": Number(selectedTutorId)
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании занятия')
      }
      setDate(undefined);
      setClassNumber("");
      setAudienceNumber("");
      setSelectedTutorId("");
      setSelectedTutorName("");
      setFormErrors({});
      toast.success("Занятие успешно запланировано")
      console.log("Занятие успешно запланировано")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Планирование аудиторного занятия
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Дата проведения *
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
              {formErrors.date && (
                <p className="text-sm text-red-500">{formErrors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Номер пары *
              </label>
              <Select 
                onValueChange={setClassNumber} 
                value={classNumber}
              >
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
              {formErrors.classNumber && (
                <p className="text-sm text-red-500">{formErrors.classNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Номер аудитории *
              </label>
              <Input
                type="number"
                placeholder="Введите номер аудитории"
                value={audienceNumber}
                onChange={(e) => setAudienceNumber(e.target.value)}
                className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
              />
              {formErrors.audienceNumber && (
                <p className="text-sm text-red-500">{formErrors.audienceNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Преподаватель *
              </label>
              {isLoadingTutors ? (
                <Skeleton className="h-12 w-full rounded-lg" />
              ) : (
                <Select 
                  onValueChange={handleTutorChange} 
                  value={selectedTutorId}
                >
                  <SelectTrigger className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 h-12">
                    <SelectValue placeholder="Выберите преподавателя">
                      {selectedTutorName || "Выберите преподавателя"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                    {tutors.map((tutor) => (
                      <SelectItem 
                        key={tutor.ID} 
                        value={tutor.ID}
                        className="hover:bg-gray-50"
                      >
                        {tutor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formErrors.tutor && (
                <p className="text-sm text-red-500">{formErrors.tutor}</p>
              )}
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