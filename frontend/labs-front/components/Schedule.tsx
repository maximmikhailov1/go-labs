"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Route, EthernetPort, Router } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiUrl } from "@/lib/api"

type Lab = {
  id: number
  number: string
  description: string
  maxStudents: number
  isMandatory?: boolean
  routersRequired: number
  switchesRequired: number
  wirelessRoutersRequired: number
  hpRoutersRequired: number
  hpSwitchesRequired: number
}
type Team = {
  id: number
  name: string
  members: Array<{ id: number }> | number[]
}
type Entries = Array<{lab:Lab, team:Team}>
type ScheduleItem = {
  id: number
  labDate: string
  classNumber: number
  audienceNumber: number
  tutor: {
    id: number
    fullName:string
  }
  switches: number
  routers: number
  wirelessRouters: number
  hpRouters: number
  hpSwitches: number
  entries: Entries
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
            fetch(apiUrl(`/schedules/week?week=${currentWeekIndex}`), { credentials: "include" }),
            fetch(apiUrl("/labs/my"), { credentials: "include" }),
            fetch(apiUrl("/teams"), { credentials: "include" }),
            fetch(apiUrl("/users"), { credentials: "include" })
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

    
          setScheduleData(prev => {
            const newData = [...prev];
            newData[currentWeekIndex] = scheduleData || [];
            return newData;
          });
    
          setUserLabs(userLabsData);
          setUserTeams(userTeamsData || []);
          setUser(user)

        } catch (error) {
          console.error("Ошибка загрузки данных:", error);
        }
      };
    
      loadData();
    }, [currentWeekIndex]);

    const formatFIO = (n: string) => n?.split(' ')[0] + ' ' + n?.split(' ').slice(1).map(p => p[0] + '.').join('');


    const calculateAvailableSlotsInTeamByEntry = (entry: { lab: Lab; team: Team }) => {

      if (!entry.lab) return 0;

      // Считаем общее количество занятых мест
      const totalUsed = entry.team.members.length
      // console.log("totalUsed = ",totalUsed,"maxStudents = ", entry.lab.maxStudents)
      return entry.lab.maxStudents - totalUsed;
    };

    const calculateAvailableSlotsInTeam = (labId: number) => {
      if (!selectedSession) return 0;

      const lab = userLabs.find(l => l.id === labId);
      if (!lab) return 0;

      // Находим все записи для выбранной лабораторной
      const labEntries = selectedSession.entries?.filter(e => e.lab.id === labId) || [];
      // Считаем общее количество занятых мест
      const totalUsed = labEntries.reduce((sum, e) => {
        return sum + (Array.isArray(e.team.members) ? e.team.members.length : 0);
      }, 0);

      return lab.maxStudents * labEntries.length - totalUsed;
    };


    const handleEnroll = async (labId: number | undefined, teamId?: number) => {
      if (!selectedSession) return;
      if (!isEnrollmentAllowed(selectedSession)) return;

      try {
        const response = await fetch(apiUrl("/records/enroll"), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: selectedSession.id,
            labId,
            teamId: teamId || null
          }),
          credentials: "include"
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          const msg = err?.message ?? err?.error ?? (typeof err === "string" ? err : "Ошибка записи")
          if (typeof window !== "undefined" && window.alert) window.alert(msg)
          return
        }
        const updated = await fetch(apiUrl(`/schedules/week?week=${currentWeekIndex}`), { credentials: "include" }).then(r => r.json())
        setScheduleData(prev => {
          const newData = [...prev]
          newData[currentWeekIndex] = updated
          return newData
        })
        setSelectedSession(null)
        setSelectedLab(null)
      } catch (error) {
        console.error("Ошибка записи:", error)
      }
    }
    const groupRecordsByTimeSlot = (records: ScheduleItem[] | null | undefined) => {
      const grouped: { [key: string]: ScheduleItem[] } = {}
      ;(records ?? []).forEach(record => {
        try {
          // Нормализуем дату - берем только часть до 'T'
          const datePart = record.labDate.split('T')[0];
          const timeSlotKey = `${datePart}-${record.classNumber}`;

          if (!grouped[timeSlotKey]) {
            grouped[timeSlotKey] = [];
          }
          grouped[timeSlotKey].push(record);
        } catch (e) {
          console.error('Error processing record:', record, e);
        }
      });

      return grouped;
    };

    // const calculateIfAnyAvailableSlotsInTeamInRecord = (labId: number, record: ScheduleItem) => {
    //   if (!record) return false
    //   const totalUsed = record.entries
    //     .filter(e => e.lab.id === labId)
    //     .reduce((sum, e) => sum + e.team.members.length, 0)
    //
    //   const lab = userLabs.find(l => l.id === labId)
    //   return lab? lab.maxStudents - totalUsed > 0:false
    // }


    const isEnrollmentAllowed = (record: ScheduleItem) => {
      const dateStr = record.labDate?.split?.("T")?.[0] ?? ""
      if (!dateStr) return false
      const labDate = new Date(dateStr + "T00:00:00Z")
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const limit = new Date(today)
      limit.setUTCDate(limit.getUTCDate() + 21)
      if (labDate < today) return false
      if (labDate > limit) return false
      return true
    }

    const isRecordAvailable = (record: ScheduleItem) => {
      if (!userLabs) return false;
      let hasAnyTeamWithSpace = false
      if (record.entries){
         hasAnyTeamWithSpace = record.entries.some(entry => {
          return calculateAvailableSlotsInTeamByEntry(entry) > 0;
        });
      }

      return userLabs.some(lab => {
        // Проверяем оборудование
        const hasEquipment = (
            (record.hpRouters ?? 0) >= lab.hpRoutersRequired &&
            (record.hpSwitches ?? 0) >= lab.hpSwitchesRequired &&
            (record.wirelessRouters ?? 0) >= lab.wirelessRoutersRequired &&
            (record.switches ?? 0) >= lab.switchesRequired &&
            (record.routers ?? 0) >= lab.routersRequired
        );
        // Если есть команды, дополнительно проверяем доступные места
        return hasEquipment || hasAnyTeamWithSpace;
      });
    };

    const teamMemberCount = (team: Team) =>
      Array.isArray(team?.members) ? team.members.length : 0;

    const canEnrollWithTeam = (team: Team): boolean => {
      if (!selectedLab || !selectedSession) return false;
      const size = teamMemberCount(team);
      if (size > selectedLab.maxStudents) return false;
      const hasEquipment =
        selectedLab.routersRequired <= (selectedSession.routers ?? 0) &&
        selectedLab.switchesRequired <= (selectedSession.switches ?? 0) &&
        selectedLab.wirelessRoutersRequired <= (selectedSession.wirelessRouters ?? 0) &&
        selectedLab.hpRoutersRequired <= (selectedSession.hpRouters ?? 0) &&
        selectedLab.hpSwitchesRequired <= (selectedSession.hpSwitches ?? 0);
      const labEntries = selectedSession.entries?.filter(e => e.lab.id === selectedLab.id) ?? [];
      for (const entry of labEntries) {
        const used = teamMemberCount(entry.team);
        const free = selectedLab.maxStudents - used;
        if (size <= free) return true;
      }
      return hasEquipment;
    };

    const isUserScheduled = (record: ScheduleItem) => {
      if (!record.entries || !user) return false;

      return record.entries.some(entry => {
        if (!entry.team || !entry.team.members) return false;

        return entry.team.members.some(member => {
          // Обрабатываем оба варианта: массив чисел и массив объектов
          if (typeof member === 'number') {
            return member === user.id;
          } else if (typeof member === 'object') {
            return member.id === user.id;
          }
          return false;
        });
      });
    };

    const isUserScheduledInSlot = (records: ScheduleItem[]) => {
      return records.some(record => isUserScheduled(record));
    };

    const renderTimeSlots = (date: string) => {
      const currentWeekRecords = (scheduleData ?? [])[currentWeekIndex] || [];
      const groupedRecords = groupRecordsByTimeSlot(currentWeekRecords);

      return TIME_SLOTS.map((slot, index) => {
        const slotNumber = index + 1;
        const timeSlotKey = `${date}-${slotNumber}`;
        const records = groupedRecords[timeSlotKey] || [];

        // Проверяем, записан ли пользователь на любой из записей в этом слоте
        const isScheduledInSlot = isUserScheduledInSlot(records);

        return (
            <div key={index} className="p-4 min-h-[160px] border-b border-gray-200">
              <div className="text-gray-600 font-medium text-sm mb-2">
                {slot} {slotNumber} Пара
              </div>

              {records.map(record => {
                const isAvailable = isRecordAvailable(record);
                const isScheduled = isScheduledInSlot || isUserScheduled(record);
                const canEnroll = isEnrollmentAllowed(record);

                return (
                    <div
                        key={record.id}
                        className={`mb-2 p-2 rounded-lg ${
                            isAvailable && !isScheduled && canEnroll
                                ? "bg-green-100"
                                : "bg-gray-100"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                  <span className="text-sm font-medium">
                    Аудитория {record.audienceNumber}
                  </span>
                          <div className="text-xs text-gray-500">
                            {formatFIO(record.tutor.fullName)}
                          </div>
                        </div>

                        {isAvailable && !isScheduled && canEnroll && (
                            <Button
                                onClick={() => setSelectedSession(record)}
                                size="sm"
                                className="ml-2"
                            >
                              Записаться
                            </Button>
                        )}
                        {isAvailable && !isScheduled && !canEnroll && (
                            <span className="text-xs text-amber-600 ml-2" title="Запись открывается не ранее чем за 3 недели до занятия">
                              Запись недоступна
                            </span>
                        )}
                      </div>

                      {isScheduled && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Вы уже записаны на эту пару
                          </div>
                      )}

                      {!isAvailable && !isScheduled && (
                          <div className="text-xs text-red-500 mt-1">
                            {userTeams?.length > 0
                                ? "Не хватает оборудования, но можно присоединиться к существующей команде"
                                : "Нет свободного оборудования"}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        );
      });
    };

    const toLocalYYYYMMDD = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    }

    const getDaysOfWeek = (weekIndex: number) => {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1)
      startOfWeek.setDate(startOfWeek.getDate() + weekIndex * 7)
      return Array(5).fill(null).map((_, i) => {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        return toLocalYYYYMMDD(day)
      })
    }
  

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

            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Выбор лабораторной работы
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="text-sm text-gray-600 space-y-3 mt-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div><span className="font-medium text-gray-700">Аудитория:</span> {selectedSession?.audienceNumber}</div>
                      <div><span className="font-medium text-gray-700">Преподаватель:</span> {formatFIO(selectedSession?.tutor.fullName as string)}</div>
                    </div>
                    <div className="border-t pt-3">
                      <span className="font-medium text-gray-700 block mb-2">Оборудование в слоте</span>
                      {(() => {
                        const s = selectedSession
                        if (!s) return null
                        const used = (s.entries ?? []).reduce(
                          (acc, e) => ({
                            routers: acc.routers + (e.lab?.routersRequired ?? 0),
                            switches: acc.switches + (e.lab?.switchesRequired ?? 0),
                            wireless: acc.wireless + (e.lab?.wirelessRoutersRequired ?? 0),
                            hpR: acc.hpR + (e.lab?.hpRoutersRequired ?? 0),
                            hpS: acc.hpS + (e.lab?.hpSwitchesRequired ?? 0)
                          }),
                          { routers: 0, switches: 0, wireless: 0, hpR: 0, hpS: 0 }
                        )
                        const total = (name: keyof typeof used) => {
                          const rem = { routers: s.routers ?? 0, switches: s.switches ?? 0, wireless: s.wirelessRouters ?? 0, hpR: s.hpRouters ?? 0, hpS: s.hpSwitches ?? 0 }
                          const k = name === "wireless" ? "wireless" : name === "hpR" ? "hpR" : name === "hpS" ? "hpS" : name
                          return (rem[k as keyof typeof rem] ?? 0) + (used[k as keyof typeof used] ?? 0)
                        }
                        return (
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Route className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-gray-700">Роутеры:</span> <span className="font-medium">{s.routers ?? 0} из {total("routers")}</span></li>
                            <li className="flex items-center gap-2"><EthernetPort className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-gray-700">Коммутаторы:</span> <span className="font-medium">{s.switches ?? 0} из {total("switches")}</span></li>
                            <li className="flex items-center gap-2"><Router className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-gray-700">Беспроводные роутеры:</span> <span className="font-medium">{s.wirelessRouters ?? 0} из {total("wireless")}</span></li>
                            <li className="flex items-center gap-2"><Route className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-gray-700">HP роутеры:</span> <span className="font-medium">{s.hpRouters ?? 0} из {total("hpR")}</span></li>
                            <li className="flex items-center gap-2"><EthernetPort className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-gray-700">HP коммутаторы:</span> <span className="font-medium">{s.hpSwitches ?? 0} из {total("hpS")}</span></li>
                          </ul>
                        )
                      })()}
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              
              <div className="max-h-[60vh] overflow-y-auto pr-2">
              {  userLabs.
      filter(lab => {
      // Проверка оборудования для создания новой команды
      const hasAvailableTeams = calculateAvailableSlotsInTeam(lab.id) > 0;

      // Проверяем оборудование
      const hasEnoughEquipment = (
          (selectedSession?.hpRouters ?? 0) >= lab.hpRoutersRequired &&
          (selectedSession?.hpSwitches ?? 0) >= lab.hpSwitchesRequired &&
          (selectedSession?.wirelessRouters ?? 0) >= lab.wirelessRoutersRequired &&
          (selectedSession?.switches ?? 0) >= lab.switchesRequired &&
          (selectedSession?.routers ?? 0) >= lab.routersRequired
      );

                // Лабораторная работа отображается, если:
      // 1. Есть достаточно оборудования для создания новой команды, ИЛИ
      // 2. Есть неполные команды с доступными местами
      return hasEnoughEquipment || hasAvailableTeams;
    })
    .map(lab => (
          <Button 
            key={lab.id}
            onClick={() => setSelectedLab(lab)}
            className="mb-2 text-white w-full min-h-12 text-left justify-start bg-blue-700 hover:bg-blue-800 py-3"
          >
            <div className="flex-1 p-2 min-w-0 w-full">
              <div className="font-medium text-white truncate flex items-center gap-2">
                <span>{lab.number} — {lab.description}</span>
                {lab.isMandatory === false && (
                  <span className="text-xs font-normal text-blue-200 shrink-0">(необязательная)</span>
                )}
              </div>
              {(() => {
                const available = calculateAvailableSlotsInTeam(lab.id)
                const labEntries = selectedSession?.entries?.filter(e => e.lab.id === lab.id) || []
                const totalSlots = labEntries.length * lab.maxStudents
                const used = labEntries.reduce((s, e) => s + (Array.isArray(e.team.members) ? e.team.members.length : 0), 0)
                return (
                  <div className="text-xs text-blue-100 mt-1">
                    {available > 0 ? (
                      <>Свободно мест: {available} · {used} из {totalSlots || lab.maxStudents} в слоте</>
                    ) : (
                      <>Можно записаться с новой командой{totalSlots > 0 ? ` · ${used} из ${totalSlots}` : ""}</>
                    )}
                  </div>
                )
              })()}
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
                  Максимальный размер команды: {selectedLab.maxStudents}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
              {(userTeams || []).map(team => {
                const canEnroll = canEnrollWithTeam(team);
                const membersCnt = teamMemberCount(team);
                return (
                  <Button
                    key={team.id}
                    disabled={!canEnroll}
                    onClick={() => canEnroll && handleEnroll(selectedLab?.id, team.id)}
                    className={`w-full mb-2 justify-start ${canEnroll ? "bg-gray-50 hover:bg-gray-100" : "opacity-60 cursor-not-allowed bg-gray-100"}`}
                  >
                    <span className={`flex-1 text-left ${canEnroll ? "text-blue-500" : "text-gray-400"}`}>
                      {team.name}
                      <span className="ml-2 text-gray-500">
                        ({membersCnt} участников)
                      </span>
                      {!canEnroll && (
                        <span className="ml-2 text-xs text-gray-400">— нет мест</span>
                      )}
                    </span>
                  </Button>
                );
              })}
                
              
              <Button 
              onClick={() => handleEnroll(selectedLab?.id)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {selectedLab.maxStudents > 1 ? "Создать новую команду или записаться в существующую" : "Записаться индивидуально"}
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
  
