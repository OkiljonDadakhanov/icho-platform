"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, X, Users } from "lucide-react"

type Coordinator = {
  name: string
  email: string
  lastSeen: string
}

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([
    {
      name: "Davron Tukhtaev",
      email: "toxtayev.davron@mail.ru",
      lastSeen: "2026-03-18 14:03:48 (password)",
    },
  ])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddCoordinator = (data: Coordinator) => {
    setCoordinators([...coordinators, data])
    setIsAddDialogOpen(false)
  }

  const handleEditCoordinator = (index: number, data: Coordinator) => {
    const updated = [...coordinators]
    updated[index] = data
    setCoordinators(updated)
    setEditingIndex(null)
  }

  const handleDeleteCoordinator = (index: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Coordinators for Uzbekistan</h1>
        </div>
        <p className="text-white/80">The persons below can view and edit team information.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Coordinators</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Person</th>
                <th className="text-left py-3 font-medium">E-mail</th>
                <th className="text-left py-3 font-medium">Last seen</th>
                <th className="text-left py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map((coordinator, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">{coordinator.name}</td>
                  <td className="py-4">
                    <a href={`mailto:${coordinator.email}`} className="text-[#2f3090] hover:underline">
                      {coordinator.email}
                    </a>
                  </td>
                  <td className="py-4 text-muted-foreground">{coordinator.lastSeen}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <EditCoordinatorDialog
                        coordinator={coordinator}
                        index={index}
                        onEdit={handleEditCoordinator}
                        onDelete={handleDeleteCoordinator}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <AddCoordinatorDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddCoordinator} />
        </div>
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-4">About Coordinators</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Coordinators have full access to manage delegation information</li>
          <li>They can add/edit participants, upload documents, and submit travel details</li>
          <li>Each coordinator receives their own login credentials</li>
          <li>You can add multiple coordinators for your delegation</li>
        </ul>
      </Card>
    </div>
  )
}

function AddCoordinatorDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: Coordinator) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    lastSeen: "Never",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({ name: "", email: "", lastSeen: "Never" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
          <Plus className="w-4 h-4 mr-2" />
          Add coordinator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Coordinator</DialogTitle>
          <DialogDescription>Add a new coordinator to your delegation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]">
              Add Coordinator
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCoordinatorDialog({
  coordinator,
  index,
  onEdit,
  onDelete,
}: {
  coordinator: Coordinator
  index: number
  onEdit: (index: number, data: Coordinator) => void
  onDelete: (index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(coordinator)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(index, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coordinator</DialogTitle>
          <DialogDescription>Update coordinator information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${index}`}>Full Name *</Label>
            <Input
              id={`edit-name-${index}`}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-email-${index}`}>Email Address *</Label>
            <Input
              id={`edit-email-${index}`}
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(index)
                setOpen(false)
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
