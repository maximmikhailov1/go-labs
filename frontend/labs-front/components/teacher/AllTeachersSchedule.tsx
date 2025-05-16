"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, EthernetPort, Router, Route, Clock, User, Book, Home, Users, Filter, X } from "lucide-react"
import { format, parseISO, isWithinInterval } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {DateRange} from "react-day-picker";

type Record = {
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
        group: {
          name: string
        }
      }[]
    }
    lab: {
      id: number
      number: string
      description: string
    }
  }[]
}

const AllTeachersSchedule = () => {
  const [scheduleData, setScheduleData] = useState<Record[]>([])
  const [filteredData, setFilteredData] = useState<Record[]>([])
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Фильтры
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [tutorFilter, setTutorFilter] = useState("")
  const [audienceFilter, setAudienceFilter] = useState("")
  const [timeSlotFilter, setTimeSlotFilter] = useState("")

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/records')
        const data = await response.json()
        setScheduleData(data)
        setFilteredData(data)
      } catch (error) {
        console.error("Ошибка загрузки расписания:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  // Применение фильтров
  useEffect(() => {
    let result = [...scheduleData]

    if (dateRange?.from && dateRange?.to) {
      result = result.filter(record => {
        const recordDate = new Date(record.labDate)
        return isWithinInterval(recordDate, {
          start: dateRange.from as Date,
          end: dateRange.to as Date
        })
      })
    }

    // Фильтр по преподавателю
    if (tutorFilter) {
      result = result.filter(record =>
          record.tutor.fullName.toLowerCase().includes(tutorFilter.toLowerCase())
      )
    }

    // Фильтр по аудитории
    if (audienceFilter) {
      result = result.filter(record =>
          record.audienceNumber == Number(audienceFilter)
      )
    }

    // Фильтр по временному слоту
    if (timeSlotFilter) {
      result = result.filter(record =>
          record.classNumber.toString() === timeSlotFilter
      )
    }

    setFilteredData(result)
  }, [dateRange, tutorFilter, audienceFilter, timeSlotFilter, scheduleData])

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

  const handleDeleteRecord = async (recordId: number, memberId: number) => {
    try {
      const response = await fetch("/api/schedules", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({"entryId": recordId, "studentId": memberId})
      });

      if (response.ok) {
        toast.success("успешно отписан")
      } else {
        toast.error("ошибка при отмене записи")
        console.error('Ошибка при удалении записи');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const clearFilters = () => {
    setDateRange(undefined)
    setTutorFilter("")
    setAudienceFilter("")
    setTimeSlotFilter("")
  }

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Расписание преподавателей
        </h1>

        {/* Панель фильтров */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium">Фильтры</h3>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Фильтр по дате */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                      <>
                        {format(dateRange.from, "dd.MM.yyyy")}
                        {dateRange?.to ? ` - ${format(dateRange.to, "dd.MM.yyyy")}` : ''}
                      </>
                  ) : (
                      <span>Выберите даты</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Фильтр по преподавателю */}
            <Input
                placeholder="Фильтр по преподавателю"
                value={tutorFilter}
                onChange={(e) => setTutorFilter(e.target.value)}
                className="max-w-xs"
            />

            {/* Фильтр по аудитории */}
            <Input
                placeholder="Фильтр по аудитории"
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="max-w-xs"
            />

            {/* Фильтр по времени */}
            <Select value={timeSlotFilter} onValueChange={setTimeSlotFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Выберите время" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">08:50-10:20</SelectItem>
                <SelectItem value="2">10:35-12:05</SelectItem>
                <SelectItem value="3">12:35-14:05</SelectItem>
                <SelectItem value="4">14:15-15:45</SelectItem>
                <SelectItem value="5">15:55-17:20</SelectItem>
                <SelectItem value="6">17:30-19:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
              ))
          ) : filteredData.length > 0 ? (
              filteredData.map(record => (
                  <Card
                      key={record.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold">{record.tutor.fullName}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(parseISO(record.labDate), "d MMMM yyyy", { locale: ru })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatTime(record.classNumber)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>Аудитория {record.audienceNumber}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center gap-2 pt-2 border-t">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                  {record.entries?.length} команд
                </span>
                    </CardFooter>
                  </Card>
              ))
          ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Ничего не найдено по выбранным фильтрам
              </div>
          )}
        </div>

      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Book className="h-6 w-6" />
                  Детали занятия
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {format(parseISO(selectedRecord.labDate), "d MMMM yyyy", { locale: ru })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {formatTime(selectedRecord.classNumber)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Аудитория {selectedRecord.audienceNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedRecord.tutor.fullName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Свободных маршрутизаторов {selectedRecord.routers}
                  </div>
                  <div className="flex items-center gap-2">
                    <EthernetPort className="h-5 w-5" />
                    Свободных коммутаторов {selectedRecord.switches}
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Свободных HP маршрутизаторов {selectedRecord.hpRouters}
                  </div>
                  <div className="flex items-center gap-2">
                    <EthernetPort className="h-5 w-5" />
                    Свободных HP коммутаторов {selectedRecord.hpSwitches}
                  </div>
                  <div className="flex items-center gap-2">
                    <Router className="h-5 w-5" />
                    Свободных беспроводных маршрутизаторов {selectedRecord.wirelessRouters}
                  </div>
                  
                  
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Записавшиеся команды:
                  </h3>
                  <div className="space-y-3">
                    {selectedRecord.entries?.map(entry => (
                      <Card key={entry.id}>
                        <CardHeader className="pb-2">
                        <div className="text-sm text-gray-600">
                            Лабораторная работа: {entry.lab.number} - {entry.lab.description}
                          </div>
                        </CardHeader>
                        <CardContent>

                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Участники:</div>
                            <div className="space-y-1">
                              {entry.team.members?.map(member => (
                                <div 
                                  key={member.id}
                                  className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded"
                                >
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{member.fullName}</span>
                                  <span>{member.group.name}</span>
                                  <button
                                    onClick={() => handleDeleteRecord(entry.id, member.id)}
                                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                  >
                                    <span>Удалить запись</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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