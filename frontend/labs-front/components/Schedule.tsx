"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Lab = {
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
type Team = {
  ID: number
  Name: string
  Members: Array<{ ID: number }>
}
type Entries = Array<{Lab:Lab, Team:Team}>
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
  Entries: Entries
}

type User = {
  fullName:string
  groupName:string
  id:number
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
    const [userLabs, setUserLabs] = useState<Lab[]>([])
    const [userTeams, setUserTeams] = useState<Team[]>([])
    const [user, setUser] = useState<User | null>(null)
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
    
    useEffect(() => {
      const loadData = async () => {
        try {
          const [scheduleRes, labsRes, teamsRes, userRes] = await Promise.all([
            fetch(`/api/schedule?week=${currentWeekIndex}`),
            fetch('/api/user/labs'),
            fetch('/api/user/teams'),
            fetch('/api/user')
          ]);
    
          const scheduleData = await scheduleRes.json();
          const userLabsData = await labsRes.json();
          const userTeamsData = await teamsRes.json();
          const user = await userRes.json()
    
          // Проверка данных
          if (!Array.isArray(userLabsData)) {
            console.error("Ожидался массив лабораторных работ, получено:", userLabsData);
            return;
          }
          if (!Array.isArray(userTeamsData)) {
            console.error("Ожидался массив команд, получено:", userTeamsData);
            return;
          }
    
          setScheduleData(prev => {
            const newData = [...prev];
            newData[currentWeekIndex] = scheduleData;
            return newData;
          });
    
          setUserLabs(userLabsData);
          setUserTeams(userTeamsData);
          setUser(user)
        } catch (error) {
          console.error("Ошибка загрузки данных:", error);
        }
      };
    
      loadData();
    }, [currentWeekIndex]);

    const formatFIO = (n: string | undefined) => n?.split(' ')[0] + ' ' + n?.split(' ').slice(1).map(p => p[0] + '.').join('');



    const calculateAvailableSlotsInTeam = (labId: number) => {
      if (!selectedSession) return 0
      const totalUsed = selectedSession.Entries
        .filter(e => e.Lab.ID === labId)
        .reduce((sum, e) => sum + e.Team.Members.length, 0)
        
      const lab = userLabs.find(l => l.ID === labId)
      return lab ? lab.MaxStudents - totalUsed : 0
    }


    const handleEnroll = async (labId: number, teamId?: number) => {
      if (!selectedSession) return;

      try {
        const response = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: selectedSession.ID,
            labId,
            teamId: teamId || null // Явно указываем null если команда не выбрана
          })
        });
  
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

    const calculateIfAnyAvailableSlotsInTeamInRecord = (labId: number, record: ScheduleItem) => {
      if (!record) return false
      const totalUsed = record.Entries
        .filter(e => e.Lab.ID === labId)
        .reduce((sum, e) => sum + e.Team.Members.length, 0)
        
      const lab = userLabs.find(l => l.ID === labId)
      return lab? lab.MaxStudents - totalUsed > 0:false
    }


    const isRecordAvailable = (record:ScheduleItem) => {
      return userLabs.filter(lab =>{
        const hasEnoughEquipment:boolean = (
          record.HPRoutersRemaining - lab.HPRoutersRequired >= 0 &&
          record.HPSwitchesRemaining - lab.HPSwitchesRequired >= 0 &&
          record.WirelessRoutersRemaining - lab.WirelessRoutersRequired >= 0 &&
          record.SwitchesRemaining - lab.SwitchesRequired >= 0 &&
          record.RoutersRemaining - lab.RoutersRequired>= 0
        )
        const hasAvailableTeams:boolean = calculateIfAnyAvailableSlotsInTeamInRecord(lab.ID, record)

        return hasEnoughEquipment && hasAvailableTeams
      }).length > 0
    }
    //Это нужно будет заменить на бин поиск и доабвить порядок по дате
    const isUserScheduled = (record:ScheduleItem) => {
      if (record.Entries.filter((entry)=>{
        return (
          (entry.Team.Members.
          filter( (member) => member.ID == (user? user.id : 0)).length) > 0) }
    ).length > 0){
      return true
    }
      return false
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
              
              const isAvailable = isRecordAvailable(record)
              const isScheduled = isUserScheduled(record)
              
              return (
                <div 
                  key={record.ID} 
                  className={`mb-2 p-2 rounded-lg ${isAvailable && !isScheduled ? 'bg-green-100' : 'bg-gray-100'}`}
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
                    
                    {isAvailable && !isScheduled &&
                      <Button 
                        onClick={() => setSelectedSession(record)}
                        size="sm"
                        className="ml-2"
                      >
                        Записаться
                      </Button>
                    }
                  </div>
                  
                  {isScheduled && 
                    <div className="text-xs text-yellow-600 mt-1">
                       Записаны
                       </div>
                  }
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

      <Dialog open={!!selectedSession} onOpenChange={() => {setSelectedSession(null);setSelectedLab(null)}}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:rounded-lg bg-white shadow-xl">
      {!selectedLab ? (

            <div className="space-y-4 ">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  Выбор лабораторной работы
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="font-medium">Аудитория:</span> {selectedSession?.AudienceNumber}
                    </div>
                    <div>
                      <span className="font-medium">Преподаватель:</span> {formatFIO(selectedSession?.Tutor.fullName)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Оборудование:</span>
                      <div className=" pl-5 mt-1 grid-cols-1 gap-1">
                        <div><span>Роутеры: {selectedSession?.RoutersRemaining}</span></div>
                        <div><span>Коммутаторы: {selectedSession?.SwitchesRemaining}</span></div>
                        <div><span>Беспроводные роутеры: {selectedSession?.WirelessRoutersRemaining}</span></div>
                        <div><span>HP Роутеры: {selectedSession?.HPRoutersRemaining}</span></div>
                        <div><span>HP Коммутаторы: {selectedSession?.HPSwitchesRemaining}</span></div>
                      </div>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              
              <div className="max-h-[60vh] overflow-y-auto pr-2">
              {  userLabs
    .filter(lab => {
      // Проверка оборудования для создания новой команды
      const hasEnoughEquipment = 
        lab.RoutersRequired <= (selectedSession?.RoutersRemaining || 0) &&
        lab.SwitchesRequired <= (selectedSession?.SwitchesRemaining || 0) &&
        lab.WirelessRoutersRequired <= (selectedSession?.WirelessRoutersRemaining || 0) &&
        lab.HPRoutersRequired <= (selectedSession?.HPRoutersRemaining || 0) &&
        lab.HPSwitchesRequired <= (selectedSession?.HPSwitchesRemaining || 0);

      // Проверка наличия неполных команд
      const hasAvailableTeams = calculateAvailableSlotsInTeam(lab.ID) > 0;

      // Лабораторная работа отображается, если:
      // 1. Есть достаточно оборудования для создания новой команды, ИЛИ
      // 2. Есть неполные команды с доступными местами
      return hasEnoughEquipment && hasAvailableTeams;
    })
    .map(lab => (
          <Button 
            key={lab.ID}
            onClick={() => setSelectedLab(lab)}
            className="mb-2 text-white w-full h-12 max-h-14 text-left justify-start bg-blue-700 hover:bg-blue-800"
          >
            <div className="flex-1 p-2 min-w-0">
              <div className="font-medium text-white truncate">
                {lab.Number} - {lab.Description}
              </div>
              
              {calculateAvailableSlotsInTeam(lab.ID) > 0 ? (
                <div className="text-xs text-gray-100 mt-1">
                  Свободно мест: {calculateAvailableSlotsInTeam(lab.ID)}
                </div>
              ) : (
                <div className="text-xs text-gray-100 mt-1">
                  Можно записаться с новой командой
                </div>
              )}
            </div>
          </Button>
        ))}
            </div>
          </div>
          ) : (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  Выбор команды
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Максимальный размер команды: {selectedLab.MaxStudents}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
              {userTeams
              .filter(team => {
                // Можно ли добавить в команду
                const canJoinTeam = team.Members.length <= selectedLab.MaxStudents;
                
                // Есть ли оборудование для этой лабораторной
                const hasEquipment = 
                  selectedLab.RoutersRequired <= (selectedSession?.RoutersRemaining || 0) &&
                  selectedLab.SwitchesRequired <= (selectedSession?.SwitchesRemaining || 0) &&
                  selectedLab.WirelessRoutersRequired <= (selectedSession?.WirelessRoutersRemaining || 0) &&
                  selectedLab.HPRoutersRequired <= (selectedSession?.HPRoutersRemaining || 0) &&
                  selectedLab.HPSwitchesRequired <= (selectedSession?.HPSwitchesRemaining || 0);

                return canJoinTeam || hasEquipment;
              })
              .map(team => (
                  <Button
                    key={team.ID}
                    onClick={() => handleEnroll(selectedLab.ID, team.ID)}
                    className="w-full mb-2 justify-start bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="flex-1 text-left text-blue-500">
                      {team.Name} 
                      <span className="ml-2 text-gray-500">
                        ({team.Members.length} участников)
                      </span>
                    </span>
                  </Button>
                ))
                }
                
              
              <Button 
              onClick={() => handleEnroll(selectedLab.ID)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {selectedLab.MaxStudents > 1 ? "Создать новую команду или записаться в существующую" : "Записаться индивидуально"}
            </Button>
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
  )
}

export default Schedule
  
  