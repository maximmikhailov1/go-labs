"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { enrollInClass } from "@/app/actions/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"


type ScheduleItem = {
  ID: number
  LabDate: string
  ClassNumber: number
  AudienceNumber: number
  Tutor: {
    ID: number
    fullName:string
  }
  SwitchesRemaining: number
  RoutersRemaining: number
  WirelessRoutersRemaining: number
  HPRoutersRemaining: number
  HPSwitchesRemaining: number
  Entries: Array<{
    Lab: {
      ID: number
      Number: string
      Description: string
      MaxStudents: number
      RoutersRequired: number
      SwitchesRequired: number
      WirelessRoutersRequired: number
      HPRoutersRequired: number
      HPSwitchesRequired: number
    }
    Team: {
      ID: number
      Name: string
      Members: Array<{ ID: number }>
    }
  }>
}

type WeekSchedule = ScheduleItem[]

const TIME_SLOTS = [
  "08:50-10:20",
  "10:35-12:05", 
  "12:35-14:05", 
  "14:15-15:45", 
  "15:55-17:20", 
  "17:30-19:00"]

  const WEEKDAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]

  const Schedule = () => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
    const [scheduleData, setScheduleData] = useState<WeekSchedule[]>([])
  
    const [selectedSession, setSelectedSession] = useState<ScheduleItem | null>(null)
    const [userLabs, setUserLabs] = useState<any[]>([])
    const [userTeams, setUserTeams] = useState<any[]>([])
    const [selectedLab, setSelectedLab] = useState<any | null>(null)
    
    useEffect(() => {
      const loadData = async () => {
        try {
          const [scheduleRes, labsRes, teamsRes] = await Promise.all([
            fetch(`/api/schedule?week=${currentWeekIndex}`),
            fetch('/api/user/labs'),
            fetch('/api/user/teams')
          ]);
    
          const scheduleData = await scheduleRes.json();
          const userLabsData = await labsRes.json();
          const userTeamsData = await teamsRes.json();
    
          // Обновляем состояние
          setScheduleData(prev => {
            const newData = [...prev];
            newData[currentWeekIndex] = scheduleData;
            return newData;
          });
    
          setUserLabs(userLabsData);
          setUserTeams(userTeamsData);
        } catch (error) {
          console.error("Ошибка загрузки данных:", error);
        }
      };
    
      loadData();
    }, [currentWeekIndex]);

    const formatFIO = (n: string | undefined) => n?.split(' ')[0] + ' ' + n?.split(' ').slice(1).map(p => p[0] + '.').join('');

    const calculateAvailableSlots = (labId: number) => {
      if (!selectedSession) return 0
      const totalUsed = selectedSession.Entries
        .filter(e => e.Lab.ID === labId)
        .reduce((sum, e) => sum + e.Team.Members.length, 0)
        
      const lab = userLabs.find(l => l.ID === labId)
      return lab ? lab.MaxStudents - totalUsed : 0
    }

    const calculateNumberOfTeamsInSlot = (labId: number) => {
      if (!selectedSession) return 0
      const totalUsed = selectedSession.Entries
        .filter(e => e.Lab.ID === labId).length

      return totalUsed
    }

    const handleEnroll = async (labId: number, teamId?: number) => {
      if (!selectedSession) return
  
      try {
        const response = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: selectedSession.ID,
            labId,
            teamId
          })
        })
  
        if (response.ok) {
          const updated = await fetch(`/api/schedule?week=${currentWeekIndex}`).then(r => r.json())
          setScheduleData(prev => {
            const newData = [...prev]
            newData[currentWeekIndex] = updated
            return newData
          })
          setSelectedSession(null)
          setSelectedLab(null)
        }
      } catch (error) {
        console.error("Ошибка записи:", error)
      }
    }
    const groupRecordsByTimeSlot = (records: ScheduleItem[]) => {
      const grouped: { [key: string]: ScheduleItem[] } = {};
  
      records.forEach(record => {
        const date = new Date(record.LabDate).toISOString().split('T')[0];
        const timeSlotKey = `${date}-${record.ClassNumber}`;
        
        if (!grouped[timeSlotKey]) {
          grouped[timeSlotKey] = [];
        }
        grouped[timeSlotKey].push(record);
      });
  
      return grouped;
    }
    
    const renderTimeSlots = (date: string) => {
      const currentWeekRecords = scheduleData[currentWeekIndex] || [];
      const groupedRecords = groupRecordsByTimeSlot(currentWeekRecords);
      
      return TIME_SLOTS.map((slot, index) => {
        const slotNumber = index + 1;
        const timeSlotKey = `${date}-${slotNumber}`;
        const records = groupedRecords[timeSlotKey] || [];
  
        return (
          <div 
            key={index} 
            className="p-4 min-h-[160px] border-b border-gray-200"
          >
            <div className="text-gray-600 font-medium text-sm mb-2">{slot} {index + 1} Пара</div>
            
            {records.map(record => {
              const isAvailable = record.RoutersRemaining > 0 || record.SwitchesRemaining > 0;
              
              return (
                <div 
                  key={record.ID} 
                  className={`mb-2 p-2 rounded-lg ${isAvailable ? 'bg-green-50' : 'bg-gray-100'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">
                        Аудитория {record.AudienceNumber}
                      </span>
                      <div className="text-xs text-gray-500">
                        {typeof record.Tutor === 'object' 
                          ? formatFIO(record.Tutor.fullName)
                          : record.Tutor}
                      </div>
                    </div>
                    
                    {isAvailable && (
                      <Button 
                        onClick={() => setSelectedSession(record)}
                        size="sm"
                        className="ml-2"
                      >
                        Записаться
                      </Button>
                    )}
                  </div>
                  
                  {!isAvailable && (
                    <div className="text-xs text-red-500 mt-1">
                      Нет свободного оборудования
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      });
    };
  
    const getDaysOfWeek = (weekIndex: number) => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekIndex * 7);
      
      return Array(5).fill(null).map((_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day.toISOString().split("T")[0];
      });
    };
  

    return (
      <div className="w-full max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between mb-6 gap-4">
          <Button
          onClick={() => {
            setCurrentWeekIndex((prev) => Math.max((prev - 1), 0));
          }}
          disabled={currentWeekIndex === 0}
          size="lg"
          className="text-base bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Предыдущая неделя
        </Button>
        <Button
          onClick={() => {
            setCurrentWeekIndex((prev) => prev + 1)}}
          disabled={currentWeekIndex === 2}
          size="lg"
          className="text-base bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
        >            
        Следующая неделя
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {getDaysOfWeek(currentWeekIndex).map((date, index) => (
          <div key={index} className="border rounded-lg bg-white">
            <div className="bg-gray-50 p-4 border-b">
              <div className="font-bold text-lg">{WEEKDAYS[index]}</div>
              <div className="text-sm">
                {new Date(date).toLocaleDateString('ru-RU')}
              </div>
            </div>
            {renderTimeSlots(date)}
          </div>
        ))}
      </div>
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          {!selectedLab ? (
            <>
              <DialogHeader>
                <DialogTitle>Выберите лабораторную работу</DialogTitle>
                <DialogDescription>
                  Доступное оборудование: 
                  Роутеры: {selectedSession?.RoutersRemaining}, 
                  Коммутаторы: {selectedSession?.SwitchesRemaining},
                  Аудитория: {selectedSession?.AudienceNumber}<br/>
                  Преподаватель: {formatFIO(selectedSession?.Tutor.fullName)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-2">
                {(userLabs
                  .filter(lab => 
                    lab.RoutersRequired <= (selectedSession?.RoutersRemaining || 0) &&
                    lab.SwitchesRequired <= (selectedSession?.SwitchesRemaining || 0) &&
                    lab.WirelessRoutersRequired <= (selectedSession?.WirelessRoutersRemaining || 0) &&
                    lab.HPRoutersRequired <= (selectedSession?.HPRoutersRemaining || 0) &&
                    lab.HPSwitchesRequired <= (selectedSession?.HPSwitchesRemaining || 0)
                  ).length != 0 
                  &&userLabs
                  .filter(lab => 
                    lab.RoutersRequired <= (selectedSession?.RoutersRemaining || 0) &&
                    lab.SwitchesRequired <= (selectedSession?.SwitchesRemaining || 0) &&
                    lab.WirelessRoutersRequired <= (selectedSession?.WirelessRoutersRemaining || 0) &&
                    lab.HPRoutersRequired <= (selectedSession?.HPRoutersRemaining || 0) &&
                    lab.HPSwitchesRequired <= (selectedSession?.HPSwitchesRemaining || 0)
                  )) || (userLabs.filter(lab => calculateNumberOfTeamsInSlot(lab.ID))
                )
                  .map(lab => (
                    <Button 
                      key={lab.ID}
                      onClick={() => setSelectedLab(lab)}
                    >
                      {lab.Number} - {lab.Description}
                      {(calculateNumberOfTeamsInSlot(lab.ID) != 0)&&`(Свободно мест в записавшейся команде: ${calculateAvailableSlots(lab.ID)})
                      (Записано команд: ${calculateNumberOfTeamsInSlot(lab.ID)})`}
                    </Button>
                  ))}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Выберите команду</DialogTitle>
                <DialogDescription>
                  Максимальный размер команды: {selectedLab.MaxStudents}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-2">
                {userTeams
                  .filter(team => 
                    team.Members.length <= calculateAvailableSlots(selectedLab.ID)
                  )
                  .map(team => (
                    <Button
                      key={team.ID}
                      onClick={() => handleEnroll(selectedLab.ID, team.ID)}
                      
                    >
                      {team.Name} ({team.Members.length} участников)
                    </Button>
                  ))}
                
                <Button 
                  onClick={() => handleEnroll(selectedLab.ID)}
                  variant="outline"
                >
                  Записаться одному
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Schedule
  
  