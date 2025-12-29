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
import { Edit, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { preRegistrationService } from "@/lib/services/pre-registration"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Coordinator } from "@/lib/types"

export default function CoordinatorsPage() {
  const { user } = useAuth()
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    fetchCoordinator()
  }, [])

  const fetchCoordinator = async () => {
    try {
      setIsLoading(true)
      const data = await preRegistrationService.getCoordinator()
      setCoordinator(data)
      setError(null)
    } catch (err: unknown) {
      const error = err as { status?: number }
      if (error.status === 404) {
        setCoordinator(null)
        setError(null)
      } else {
        console.error("Failed to fetch coordinator:", err)
        setError("Failed to load coordinator information")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCoordinator = async (data: Partial<Coordinator>) => {
    try {
      setIsSaving(true)
      await preRegistrationService.updateCoordinator(data)
      await fetchCoordinator()
      setIsEditDialogOpen(false)
      setError(null)
    } catch (err) {
      console.error("Failed to update coordinator:", err)
      setError("Failed to update coordinator")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading message="Loading coordinator information..." />
  }

  if (error && !coordinator) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Coordinator for {countryName}</h1>
        </div>
        <p className="text-white/80">The person below can view and edit team information.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Coordinator</h2>
        </div>

        {!coordinator ? (
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
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">{coordinator.full_name}</td>
                  <td className="py-4 text-muted-foreground">{coordinator.role}</td>
                  <td className="py-4">
                    <a href={`mailto:${coordinator.email}`} className="text-[#2f3090] hover:underline">
                      {coordinator.email}
                    </a>
                  </td>
                  <td className="py-4 text-muted-foreground">{coordinator.phone}</td>
                  <td className="py-4">
                    <EditCoordinatorDialog
                      coordinator={coordinator}
                      onEdit={handleUpdateCoordinator}
                      isSaving={isSaving}
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {coordinator && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Additional Details</h3>
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
  onEdit: (data: Partial<Coordinator>) => void
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(formData)
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
