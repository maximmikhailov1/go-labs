"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, EthernetPort, Router, Route, Clock, User, Book, Home, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

type Record = {
  ID: number
  LabDate: string
  ClassNumber: number
  AudienceNumber: string
  HPRoutersRemaining: number
  HPSwitchesRemaining: number
  RoutersRemaining: number
  SwitchesRemaining: number
  WirelessRoutersRemaining: number

  Tutor: {
    ID: number
    fullName: string
  }
  Entries: {
    ID: number
    Team: {
      ID: number
      Name: string
      Members: {
        ID: number
        fullName: string
        Group:{
          Name:string
        }
      }[]
    }
    Lab: {
      ID: number
      Number: string
      Description: string
    }
  }[]
}

const AllTeachersSchedule = () => {
  const [scheduleData, setScheduleData] = useState<Record[]>([])
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/user/records')
        const data = await response.json()
        setScheduleData(data)
      } catch (error) {
        console.error("Ошибка загрузки расписания:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-blue-600" />
        Расписание преподавателей
      </h1>

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
        ) : (
          scheduleData.map(record => (
            <Card 
              key={record.ID}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRecord(record)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{record.Tutor.fullName}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{format(parseISO(record.LabDate), "d MMMM yyyy", { locale: ru })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatTime(record.ClassNumber)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span>Аудитория {record.AudienceNumber}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center gap-2 pt-2 border-t">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {record.Entries?.length} команд
                </span>
              </CardFooter>
            </Card>
          ))
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
                    {format(parseISO(selectedRecord.LabDate), "d MMMM yyyy", { locale: ru })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {formatTime(selectedRecord.ClassNumber)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Аудитория {selectedRecord.AudienceNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedRecord.Tutor.fullName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Свободных маршуртизаторов {selectedRecord.RoutersRemaining}
                  </div>
                  <div className="flex items-center gap-2">
                    <EthernetPort className="h-5 w-5" />
                    Свободных коммутаторов {selectedRecord.SwitchesRemaining}
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Свободных HP маршуртизаторов {selectedRecord.HPRoutersRemaining}
                  </div>
                  <div className="flex items-center gap-2">
                    <EthernetPort className="h-5 w-5" />
                    Свободных HP коммутаторов {selectedRecord.HPSwitchesRemaining}
                  </div>
                  <div className="flex items-center gap-2">
                    <Router className="h-5 w-5" />
                    Свободных беспроводных маршрутизаторов {selectedRecord.WirelessRoutersRemaining}
                  </div>
                  
                  
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Записавшиеся команды:
                  </h3>
                  <div className="space-y-3">
                    {selectedRecord.Entries?.map(entry => (
                      <Card key={entry.ID}>
                        <CardHeader className="pb-2">
                          <div className="font-medium">{entry.Team.Name}</div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            Лабораторная работа: {entry.Lab.Number} - {entry.Lab.Description}
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Участники:</div>
                            <div className="space-y-1">
                              {entry.Team.Members.map(member => (
                                <div 
                                  key={member.ID}
                                  className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded"
                                >
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{member.fullName}</span>
                                  <span>{member.Group.Name}</span>
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