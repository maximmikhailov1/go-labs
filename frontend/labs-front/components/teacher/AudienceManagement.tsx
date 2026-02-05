"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Building2, Plus, Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiUrl } from "@/lib/api"

interface Audience {
  id: number
  number: string
  routers: number
  switches: number
  wirelessRouters: number
  hpRouters: number
  hpSwitches: number
  createdAt: string
}

const defaultForm = {
  number: "",
  routers: 0,
  switches: 0,
  wirelessRouters: 0,
  hpRouters: 0,
  hpSwitches: 0
}

const AudienceManagement = () => {
  const [list, setList] = useState<Audience[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchList = async () => {
    try {
      const res = await fetch(apiUrl("/audiences"), { credentials: "include" })
      if (res.ok) setList(await res.json())
    } catch {
      toast.error("Ошибка загрузки аудиторий")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const openCreate = () => {
    setForm(defaultForm)
    setCreateOpen(true)
  }

  const openEdit = (a: Audience) => {
    setForm({
      number: a.number,
      routers: a.routers,
      switches: a.switches,
      wirelessRouters: a.wirelessRouters,
      hpRouters: a.hpRouters,
      hpSwitches: a.hpSwitches
    })
    setEditId(a.id)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.number.trim()) {
      toast.error("Введите номер аудитории")
      return
    }
    try {
      const res = await fetch(apiUrl("/audiences"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success("Аудитория создана")
        setCreateOpen(false)
        fetchList()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.message || "Ошибка создания")
      }
    } catch {
      toast.error("Ошибка создания")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId == null || !form.number.trim()) return
    try {
      const res = await fetch(apiUrl(`/audiences/${editId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success("Аудитория обновлена")
        setEditId(null)
        fetchList()
      } else {
        toast.error("Ошибка обновления")
      }
    } catch {
      toast.error("Ошибка обновления")
    }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    try {
      const res = await fetch(apiUrl(`/audiences/${deleteId}`), {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        toast.success("Аудитория удалена")
        setDeleteId(null)
        fetchList()
      } else {
        toast.error("Ошибка удаления")
      }
    } catch {
      toast.error("Ошибка удаления")
    }
  }

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Номер аудитории *</label>
        <Input
          value={form.number}
          onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          placeholder="Например 201"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Роутеры</label>
          <Input
            type="number"
            min={0}
            value={form.routers}
            onChange={(e) => setForm((f) => ({ ...f, routers: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Коммутаторы</label>
          <Input
            type="number"
            min={0}
            value={form.switches}
            onChange={(e) => setForm((f) => ({ ...f, switches: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Беспроводные роутеры</label>
          <Input
            type="number"
            min={0}
            value={form.wirelessRouters}
            onChange={(e) => setForm((f) => ({ ...f, wirelessRouters: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">HP роутеры</label>
          <Input
            type="number"
            min={0}
            value={form.hpRouters}
            onChange={(e) => setForm((f) => ({ ...f, hpRouters: Number(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">HP коммутаторы</label>
          <Input
            type="number"
            min={0}
            value={form.hpSwitches}
            onChange={(e) => setForm((f) => ({ ...f, hpSwitches: Number(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditId(null) }}>
          Отмена
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-blue-600" />
        Управление аудиториями
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Аудитории</CardTitle>
          <Button size="sm" onClick={openCreate} className="gap-1">
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">Нет аудиторий. Нажмите «Добавить».</p>
          ) : (
            <div className="space-y-3">
              {list.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30"
                >
                  <div>
                    <div className="font-medium">Аудитория {a.number}</div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span>Роутеры: {a.routers}</span>
                      <span>Коммутаторы: {a.switches}</span>
                      <span>Беспроводные: {a.wirelessRouters}</span>
                      <span>HP роутеры: {a.hpRouters}</span>
                      <span>HP коммутаторы: {a.hpSwitches}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Редактировать">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(a.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить аудиторию</DialogTitle>
          </DialogHeader>
          {renderForm(handleCreate, "Создать")}
        </DialogContent>
      </Dialog>

      <Dialog open={editId != null} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать аудиторию</DialogTitle>
          </DialogHeader>
          {editId != null && renderForm(handleUpdate, "Сохранить")}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить аудиторию?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Аудитория будет удалена. Занятия, привязанные к ней по номеру, не изменятся.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AudienceManagement
