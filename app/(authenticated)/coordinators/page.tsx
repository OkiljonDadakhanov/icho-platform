"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Edit, Users, AlertCircle, CheckCircle2, Upload, FileText, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { preRegistrationService } from "@/lib/services/pre-registration"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Coordinator, CoordinatorUpsertRequest } from "@/lib/types"

export default function CoordinatorsPage() {
  const { user } = useAuth()
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCoordinatorId, setEditingCoordinatorId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"
  const MAX_COORDINATORS = 3

  useEffect(() => {
    fetchCoordinators()
  }, [])

  const fetchCoordinators = async () => {
    try {
      setIsLoading(true)
      const data = await preRegistrationService.getCoordinators()
      setCoordinators(data)
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to fetch coordinators:", err)
      setError("Failed to load coordinator information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCoordinator = async (coordinatorId: string, data: Partial<CoordinatorUpsertRequest>) => {
    try {
      setIsSaving(true)
      await preRegistrationService.updateCoordinator(coordinatorId, data)
      await fetchCoordinators()
      setEditingCoordinatorId(null)
      setError(null)
    } catch (err) {
      console.error("Failed to update coordinator:", err)
      setError("Failed to update coordinator")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCoordinator = async (data: CoordinatorUpsertRequest, passportScan?: File) => {
    try {
      setIsSaving(true)
      await preRegistrationService.createCoordinator(data, passportScan)
      await fetchCoordinators()
      setIsAddDialogOpen(false)
      setError(null)
    } catch (err: any) {
      console.error("Failed to add coordinator:", err)
      setError(err?.message || "Failed to add coordinator")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCoordinator = async (coordinatorId: string) => {
    if (!confirm("Are you sure you want to delete this coordinator?")) return
    try {
      setIsDeleting(coordinatorId)
      await preRegistrationService.deleteCoordinator(coordinatorId)
      await fetchCoordinators()
      setError(null)
    } catch (err) {
      console.error("Failed to delete coordinator:", err)
      setError("Failed to delete coordinator")
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return <Loading message="Loading coordinator information..." />
  }

  if (error && coordinators.length === 0) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Coordinators for {countryName}</h1>
        </div>
        <p className="text-white/80">The coordinators below can view and edit team information.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Coordinators</h2>
          {coordinators.length < MAX_COORDINATORS && (
            <AddCoordinatorDialog
              onAdd={handleAddCoordinator}
              isSaving={isSaving}
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
            />
          )}
        </div>

        {coordinators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No coordinator information registered yet.</p>
            <p className="text-sm mt-2">Please complete the pre-registration to add coordinator details.</p>
            <Button className="mt-4 bg-[#2f3090] hover:bg-[#4547a9]" asChild>
              <a href="/pre-registration">Go to Pre-Registration</a>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Person</th>
                  <th className="text-left py-3 font-medium">Role</th>
                  <th className="text-left py-3 font-medium">E-mail</th>
                  <th className="text-left py-3 font-medium">Phone</th>
                  <th className="text-left py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {coordinators.map((coordinator) => (
                  <tr key={coordinator.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium">
                      {coordinator.full_name}
                    </td>
                    <td className="py-4 text-muted-foreground">{coordinator.role}</td>
                    <td className="py-4">
                      <a href={`mailto:${coordinator.email}`} className="text-[#2f3090] hover:underline">
                        {coordinator.email}
                      </a>
                    </td>
                    <td className="py-4 text-muted-foreground">{coordinator.phone}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <EditCoordinatorDialog
                          coordinator={coordinator}
                          onEdit={(data) => handleUpdateCoordinator(coordinator.id, data)}
                          isSaving={isSaving}
                          open={editingCoordinatorId === coordinator.id}
                          onOpenChange={(open) => setEditingCoordinatorId(open ? coordinator.id : null)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteCoordinator(coordinator.id)}
                          disabled={isDeleting === coordinator.id || coordinator.is_primary}
                          title={coordinator.is_primary ? "Cannot delete primary coordinator" : "Delete coordinator"}
                        >
                          {isDeleting === coordinator.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {coordinators.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Additional Details</h3>
          <div className="space-y-6">
            {coordinators.map((coordinator) => (
              <div key={coordinator.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                <p className="font-medium mb-3">{coordinator.full_name}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium">
                      {coordinator.gender === 'MALE' ? 'Male' : coordinator.gender === 'FEMALE' ? 'Female' : 'Other'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(coordinator.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Passport Number</p>
                    <p className="font-medium font-mono">{coordinator.passport_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Passport Scan</p>
                    {coordinator.passport_scan ? (
                      <div className="flex items-center gap-2 text-[#00795d]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <span className="text-amber-600">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-4">About Coordinators</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>The coordinator has full access to manage delegation information</li>
          <li>They can add/edit participants, upload documents, and submit travel details</li>
          <li>The coordinator receives login credentials for the registration portal</li>
          <li>Coordinator information is submitted during pre-registration</li>
        </ul>
      </Card>
    </div>
  )
}

function EditCoordinatorDialog({
  coordinator,
  onEdit,
  isSaving,
  open,
  onOpenChange,
}: {
  coordinator: Coordinator
  onEdit: (data: Partial<CoordinatorUpsertRequest>) => void
  isSaving: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    full_name: coordinator.full_name,
    role: coordinator.role,
    email: coordinator.email,
    phone: coordinator.phone,
  })
  const [passportScan, setPassportScan] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit({
      ...formData,
      passport_scan: passportScan || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coordinator</DialogTitle>
          <DialogDescription>Update coordinator contact information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
              title="Please enter a valid email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Passport Scan (PDF/JPG/PNG)</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-white rounded-lg border">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                {passportScan ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm truncate">{passportScan.name}</span>
                  </div>
                ) : coordinator.passport_scan ? (
                  <span className="text-sm text-green-600">Already uploaded</span>
                ) : (
                  <span className="text-sm text-gray-500">No file uploaded</span>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-[#2f3090] bg-[#2f3090]/10 px-3 py-1.5 rounded-lg hover:bg-[#2f3090]/20 transition-colors flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {coordinator.passport_scan || passportScan ? "Replace" : "Upload"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPassportScan(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddCoordinatorDialog({
  onAdd,
  isSaving,
  open,
  onOpenChange,
}: {
  onAdd: (data: CoordinatorUpsertRequest, passportScan?: File) => void
  isSaving: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<CoordinatorUpsertRequest>({
    full_name: "",
    role: "",
    gender: "MALE",
    date_of_birth: "",
    passport_number: "",
    email: "",
    phone: "",
    is_primary: false,
  })
  const [passportScan, setPassportScan] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData, passportScan || undefined)
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      role: "",
      gender: "MALE",
      date_of_birth: "",
      passport_number: "",
      email: "",
      phone: "",
      is_primary: false,
    })
    setPassportScan(null)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }}>
      <DialogTrigger asChild>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
          <Plus className="w-4 h-4 mr-2" />
          Add Coordinator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Coordinator</DialogTitle>
          <DialogDescription>Add a new coordinator for your delegation (max 3 per country).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add_full_name">Full Name *</Label>
              <Input
                id="add_full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_role">Role *</Label>
              <Input
                id="add_role"
                required
                placeholder="e.g., Head Mentor, Coordinator"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add_gender">Gender *</Label>
              <select
                id="add_gender"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_dob">Date of Birth *</Label>
              <Input
                id="add_dob"
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add_passport">Passport Number *</Label>
            <Input
              id="add_passport"
              required
              value={formData.passport_number}
              onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add_email">Email Address *</Label>
              <Input
                id="add_email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                title="Please enter a valid email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_phone">Phone Number *</Label>
              <Input
                id="add_phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Passport Scan (PDF/JPG/PNG) *</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-white rounded-lg border">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                {passportScan ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm truncate">{passportScan.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No file uploaded</span>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-[#2f3090] bg-[#2f3090]/10 px-3 py-1.5 rounded-lg hover:bg-[#2f3090]/20 transition-colors flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {passportScan ? "Replace" : "Upload"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required={!passportScan}
                  onChange={(e) => setPassportScan(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={isSaving || !passportScan}>
              {isSaving ? "Adding..." : "Add Coordinator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
