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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto p-4">
        {/* Диалог подтверждения удаления */}
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

        {/* Диалог создания предмета */}
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

        {/* Левая колонка - лабораторные по выбранному предмету */}
        <div className="space-y-8">
          <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow h-[800px]">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-6 w-6 text-green-600" />
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  {selectedSubject ? `Лабораторные для "${selectedSubject.name}"` : "Лабораторные"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {selectedSubject ? (
                  <form onSubmit={handleLabSubmit} className="space-y-5">
                    {/* Форма создания лабораторной */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Номер работы *</label>
                        <Input
                            placeholder="Номер лабораторной"
                            value={labNumber}
                            onChange={(e) => setLabNumber(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Макс. студентов *</label>
                        <Input
                            type="number"
                            placeholder="Максимальное количество"
                            value={maxStudents}
                            onChange={(e) => setMaxStudents(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Описание работы *</label>
                      <Textarea
                          placeholder="Подробное описание лабораторной"
                          value={labDescription}
                          onChange={(e) => setLabDescription(e.target.value)}
                          className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Роутеры *</label>
                        <Input
                            type="number"
                            placeholder="Количество роутеров"
                            value={routersRequired}
                            onChange={(e) => setRoutersRequired(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Свитчи *</label>
                        <Input
                            type="number"
                            placeholder="Количество свитчей"
                            value={switchesRequired}
                            onChange={(e) => setSwitchesRequired(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Беспроводные маршрутизаторы *</label>
                        <Input
                            type="number"
                            placeholder="Количество беспроводных маршрутизаторов"
                            value={wirelessRoutersRequired}
                            onChange={(e) => setWirelessRouterRequired(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">HP маршрутизаторы</label>
                        <Input
                            type="number"
                            placeholder="Количество"
                            value={hpRoutersRequired}
                            onChange={(e) => setHpRoutersRequired(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">HP коммутаторы</label>
                        <Input
                            type="number"
                            placeholder="Количество"
                            value={hpSwitchesRequired}
                            onChange={(e) => setHpSwitchesRequired(e.target.value)}
                            className="rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
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
                      <label htmlFor="lab-mandatory" className="text-sm font-medium text-gray-700">
                        Обязательная лабораторная
                      </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-lg bg-green-600 hover:bg-green-700 h-12 text-lg shadow-sm"
                    >
                      Создать лабораторную
                    </Button>
                  </form>
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <BookOpen className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-center">Выберите предмет в списке справа или создайте новый.</p>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - список лабораторных (всегда видимый блок) */}
        <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow h-[800px]">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-green-600" />
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Лабораторные работы
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!selectedSubject ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FlaskConical className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-center">Выберите предмет для просмотра лабораторных.</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 h-[700px] overflow-y-auto">
                {labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow relative"
                  >
                    <div className="flex items-start gap-3">
                      <FlaskConical className="h-5 w-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          Лабораторная {lab.number}
                          {lab.isMandatory === false && (
                            <span className="ml-2 text-xs font-normal text-gray-400">(необязательная)</span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{lab.description}</p>
                        <div className="text-gray-500 text-sm mt-2">
                          Макс. студентов: {lab.maxStudents}
                          {lab.routersRequired ? `  | Роутеры: ${lab.routersRequired}` : ""}
                          {lab.switchesRequired ? `  | Свитчи: ${lab.switchesRequired}` : ""}
                          {lab.wirelessRoutersRequired ? `  | Беспроводные: ${lab.wirelessRoutersRequired}` : ""}
                          {lab.hpSwitchesRequired ? `  | HP Свитчи: ${lab.hpSwitchesRequired}` : ""}
                          {lab.hpRoutersRequired ? `  | HP Роутеры: ${lab.hpRoutersRequired}` : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 absolute top-2 right-2"
                        onClick={() => confirmDeleteLab(lab)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {labs.length === 0 && (
                  <div className="text-center py-6 text-gray-500">Нет лабораторных для этого предмета</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список предметов */}
        <div className="space-y-8">
          <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow h-[800px]">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <List className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-2xl font-semibold text-gray-800">
                    Список предметов
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  className="rounded-full h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCreateSubjectDialogOpen(true)}
                  title="Создать предмет"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                  <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                    {error}
                  </div>
              )}

              {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <Skeleton className="h-5 w-1/3 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="space-y-4 h-[700px] overflow-y-auto">
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject)}
                            className={`p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${
                                selectedSubject?.id === subject.id ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-blue-500 mt-1" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">{subject.name}</h3>
                              <p className="text-gray-600 text-sm mt-1">{subject.description}</p>
                            </div>
                          </div>
                        </div>
                    ))}
                    {subjects.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          Нет созданных предметов
                        </div>
                    )}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

export default SubjectManagement