"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BookOpen, FlaskConical, List, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { apiUrl } from "@/lib/api"

interface Subject {
  id: number
  name: string
  description: string
}

interface Lab {
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
  subjectId: number
}

const SubjectManagement: React.FC = () => {
  const [labNumber, setLabNumber] = useState("")
  const [labDescription, setLabDescription] = useState("")
  const [maxStudents, setMaxStudents] = useState("")
  const [routersRequired, setRoutersRequired] = useState("0")
  const [switchesRequired, setSwitchesRequired] = useState("0")
  const [wirelessRoutersRequired, setWirelessRouterRequired] = useState("0")
  const [hpRoutersRequired, setHpRoutersRequired] = useState("0")
  const [hpSwitchesRequired, setHpSwitchesRequired] = useState("0")

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [labs, setLabs] = useState<Lab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null)
  const [createSubjectDialogOpen, setCreateSubjectDialogOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDescription, setNewSubjectDescription] = useState("")
  const [labIsMandatory, setLabIsMandatory] = useState(true)

  const fetchSubjects = async () => {
    try {
      const response = await fetch(apiUrl("/subjects"), { credentials: "include" })
      if (!response.ok) throw new Error("Ошибка загрузки данных")
      setSubjects(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (!selectedSubject) {
      setLabs([])
      return
    }
    const fetchLabs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(apiUrl(`/labs?subjectId=${selectedSubject.id}`), { credentials: "include" })
        if (!response.ok) throw new Error("Ошибка загрузки лабораторных")
        setLabs(await response.json() || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки лабораторных")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLabs()
  }, [selectedSubject])

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    try {
      setIsLoading(true)
      const response = await fetch(apiUrl("/subjects"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName.trim(), description: newSubjectDescription }),
        credentials: "include"
      })
      if (!response.ok) throw new Error("Ошибка создания предмета")
      const created = await response.json()
      setSubjects((prev) => [...prev, created])
      setNewSubjectName("")
      setNewSubjectDescription("")
      setCreateSubjectDialogOpen(false)
      toast.success("Предмет успешно создан")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании предмета")
      toast.error("Не удалось создать предмет")
    } finally {
      setIsLoading(false)
    }
  }

  // Создание лабораторной
  const handleLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSubject) {
      setError('Выберите предмет для добавления лабораторной')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(apiUrl("/labs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: labNumber,
          description: labDescription,
          maxStudents: Number(maxStudents),
          isMandatory: labIsMandatory,
          routersRequired: Number(routersRequired),
          switchesRequired: Number(switchesRequired),
          wirelessRoutersRequired: Number(wirelessRoutersRequired),
          hpRoutersRequired: Number(hpRoutersRequired),
          hpSwitchesRequired: Number(hpSwitchesRequired),
          subjectId: selectedSubject.id
        }),
        credentials: "include"
      })

      if (!response.ok) throw new Error('Ошибка создания лабораторной')
      setLabs([...labs, await response.json()])
      setLabNumber("")
      setLabDescription("")
      setMaxStudents("")
      setLabIsMandatory(true)
      setRoutersRequired("0")
      setSwitchesRequired("0")
      setWirelessRouterRequired("0")
      setHpRoutersRequired("0")
      setHpSwitchesRequired("0")
      toast.success("Лабораторная работа успешно создана")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании лабораторной')
      toast.error('Не удалось создать лабораторную работу')
    } finally {
      setIsLoading(false)
    }
  }

  // Подтверждение удаления лабораторной
  const confirmDeleteLab = (lab: Lab) => {
    setLabToDelete(lab)
    setIsDeleteDialogOpen(true)
  }

  // Удаление лабораторной
  const handleDeleteLab = async () => {
    if (!labToDelete) return

    try {
      setIsLoading(true)
      const response = await fetch(apiUrl(`/labs/${labToDelete.id}`), {
        method: "DELETE",
        credentials: "include"
      })

      if (!response.ok) throw new Error('Ошибка удаления лабораторной')

      setLabs(labs.filter(lab => lab.id !== labToDelete.id))
      toast.success('Лабораторная работа успешно удалена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении лабораторной')
      toast.error('Не удалось удалить лабораторную работу')
    } finally {
      setIsDeleteDialogOpen(false)
      setLabToDelete(null)
      setIsLoading(false)
    }
  }

  return (
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto p-4 min-h-[calc(100vh-12rem)]">
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы собираетесь удалить лабораторную работу &quot;{labToDelete?.number} - {labToDelete?.description}&quot;.
                Это действие нельзя отменить. Все связанные записи будут также удалены.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteLab}
                  className="bg-red-600 hover:bg-red-700"
              >
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={createSubjectDialogOpen} onOpenChange={setCreateSubjectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать предмет</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Название *</label>
                <Input
                  placeholder="Введите название предмета"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Описание</label>
                <Textarea
                  placeholder="Описание предмета"
                  value={newSubjectDescription}
                  onChange={(e) => setNewSubjectDescription(e.target.value)}
                  className="rounded-lg min-h-[80px]"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateSubjectDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={!newSubjectName.trim()}>
                  Создать
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Боковая панель: список предметов */}
        <aside className="lg:w-64 shrink-0 flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-800 flex items-center gap-2">
              <List className="h-5 w-5 text-purple-600" />
              Предметы
            </span>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateSubjectDialogOpen(true)}
              title="Создать предмет"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <div className="mx-4 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
          )}
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSubject?.id === subject.id ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{subject.name}</span>
                    </div>
                    {subject.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate pl-6">{subject.description}</p>
                    )}
                  </button>
                ))}
                {subjects.length === 0 && (
                  <p className="text-center py-6 text-gray-500 text-sm">Нет предметов</p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Основная зона: форма добавления лабы + список лаб */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <Card className="border-0 shadow-sm rounded-xl bg-white">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-green-600" />
                {selectedSubject ? `Лабораторные: ${selectedSubject.name}` : "Лабораторные"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedSubject ? (
                <>
                  <form onSubmit={handleLabSubmit} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Номер работы *</label>
                        <Input
                          placeholder="Номер лабораторной"
                          value={labNumber}
                          onChange={(e) => setLabNumber(e.target.value)}
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Макс. студентов *</label>
                        <Input
                          type="number"
                          placeholder="Максимум"
                          value={maxStudents}
                          onChange={(e) => setMaxStudents(e.target.value)}
                          className="rounded-lg h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Описание *</label>
                      <Textarea
                        placeholder="Описание лабораторной"
                        value={labDescription}
                        onChange={(e) => setLabDescription(e.target.value)}
                        className="rounded-lg min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Роутеры</label>
                        <Input type="number" value={routersRequired} onChange={(e) => setRoutersRequired(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Свитчи</label>
                        <Input type="number" value={switchesRequired} onChange={(e) => setSwitchesRequired(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Беспроводные</label>
                        <Input type="number" value={wirelessRoutersRequired} onChange={(e) => setWirelessRouterRequired(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">HP роутеры</label>
                        <Input type="number" value={hpRoutersRequired} onChange={(e) => setHpRoutersRequired(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">HP свитчи</label>
                        <Input type="number" value={hpSwitchesRequired} onChange={(e) => setHpSwitchesRequired(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lab-mandatory"
                        checked={labIsMandatory}
                        onChange={(e) => setLabIsMandatory(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="lab-mandatory" className="text-sm font-medium text-gray-700">Обязательная</label>
                    </div>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Добавить лабораторную
                    </Button>
                  </form>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-800 mb-3">Список лабораторных</h3>
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {labs.map((lab) => (
                          <div
                            key={lab.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative flex items-start gap-3"
                          >
                            <FlaskConical className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800">
                                Лабораторная {lab.number}
                                {lab.isMandatory === false && <span className="text-gray-400 text-sm font-normal ml-1">(необяз.)</span>}
                              </h3>
                              <p className="text-gray-600 text-sm mt-0.5">{lab.description}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                Макс. студентов: {lab.maxStudents}
                                {[lab.routersRequired, lab.switchesRequired, lab.wirelessRoutersRequired].some(Boolean) &&
                                  ` · Роутеры: ${lab.routersRequired} · Свитчи: ${lab.switchesRequired}`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 shrink-0"
                              onClick={() => confirmDeleteLab(lab)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {labs.length === 0 && (
                          <p className="text-center py-6 text-gray-500 text-sm">Нет лабораторных для этого предмета</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-center">Выберите предмет слева или создайте новый.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
  )
}

export default SubjectManagement