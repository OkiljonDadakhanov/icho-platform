"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, AlertCircle, UsersRound, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Participant, ParticipantCreateRequest, Gender, ParticipantRole, TshirtSize, DietaryRequirement } from "@/lib/types"
import { mapRoleToFrontend, mapGenderToFrontend, mapTshirtToFrontend, mapDietaryToFrontend, mapRoleToBackend, mapGenderToBackend, mapTshirtToBackend, mapDietaryToBackend } from "@/lib/types"

export default function TeamPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const countryName = user?.country?.name || "Your Country"
  const isLocked = false // This could come from workflow status API

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      setIsLoading(true)
      const data = await participantsService.getAllParticipants()
      setParticipants(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch participants:", err)
      setError("Failed to load participants")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async (data: ParticipantCreateRequest) => {
    try {
      setIsSaving(true)
      setError(null)
      await participantsService.createParticipant(data)
      await fetchParticipants()
      setIsAddDialogOpen(false)
      toast.success("Participant added successfully")
    } catch (err: unknown) {
      console.error("Failed to add participant:", err)
      const message = (err as { message?: string })?.message || "Failed to add participant. Please try again.";
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditMember = async (id: string, data: Partial<ParticipantCreateRequest>) => {
    try {
      setIsSaving(true)
      setError(null)
      await participantsService.updateParticipant(id, data)
      await fetchParticipants()
      toast.success("Participant updated successfully")
    } catch (err: unknown) {
      console.error("Failed to update participant:", err)
      const message = (err as { message?: string })?.message || "Failed to update participant. Please try again.";
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      setIsSaving(true)
      setError(null)
      await participantsService.deleteParticipant(id)
      await fetchParticipants()
      toast.success("Participant deleted successfully")
    } catch (err: unknown) {
      console.error("Failed to delete participant:", err)
      const message = (err as { message?: string })?.message || "Failed to delete participant. Please try again.";
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (participantId: string, file: File) => {
    try {
      await participantsService.uploadProfilePhoto(participantId, file)
      await fetchParticipants()
    } catch (err: unknown) {
      console.error("Failed to upload photo:", err)
      const message = (err as { message?: string })?.message || "Failed to upload photo. Please try again.";
      setError(message)
    }
  }

  if (isLoading) {
    return <Loading message="Loading team..." />
  }

  if (error && participants.length === 0) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <UsersRound className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Delegation for {countryName}</h1>
        </div>
        <p className="text-white/80">Please edit the members of your delegation.</p>
      </div>

      {isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The deadline for editing member details has passed. Please contact the organisers if you still need to make
            edits.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Members in your delegation ({participants.length})</h2>
          {!isLocked && (
            <AddMemberDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onAdd={handleAddMember}
              isSaving={isSaving}
            />
          )}
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No participants registered yet.</p>
            <p className="text-sm mt-2">Click "Add Member" to add participants to your delegation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Photo</th>
                  <th className="text-left py-3 font-medium">Position</th>
                  <th className="text-left py-3 font-medium">Person</th>
                  <th className="text-left py-3 font-medium">Passport No</th>
                  <th className="text-left py-3 font-medium">DOB</th>
                  <th className="text-left py-3 font-medium">Gender</th>
                  <th className="text-left py-3 font-medium">Shirt</th>
                  <th className="text-left py-3 font-medium">Diet</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const role = mapRoleToFrontend(participant.role)
                  const nameParts = participant.full_name.split(' ')
                  const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                    : participant.full_name.substring(0, 2).toUpperCase()

                  return (
                    <tr key={participant.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <PhotoUploadCell
                          participant={participant}
                          initials={initials}
                          onUpload={handlePhotoUpload}
                          disabled={isLocked}
                        />
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="secondary"
                          className={
                            role === "Team Leader"
                              ? "bg-[#2f3090]/10 text-[#2f3090]"
                              : role === "Contestant"
                                ? "bg-[#00795d]/10 text-[#00795d]"
                                : role === "Observer"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                          }
                        >
                          {role}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.profile_photo} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{participant.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-xs">{participant.passport_number}</td>
                      <td className="py-4">{new Date(participant.date_of_birth).toLocaleDateString()}</td>
                      <td className="py-4">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-4">{mapTshirtToFrontend(participant.tshirt_size)}</td>
                      <td className="py-4">{mapDietaryToFrontend(participant.dietary_requirements)}</td>
                      <td className="py-4">
                        {!isLocked && (
                          <EditMemberDialog
                            participant={participant}
                            onEdit={handleEditMember}
                            onDelete={handleDeleteMember}
                            isSaving={isSaving}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function PhotoUploadCell({
  participant,
  initials,
  onUpload,
  disabled,
}: {
  participant: Participant
  initials: string
  onUpload: (participantId: string, file: File) => void
  disabled: boolean
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      onUpload(participant.id, file)
    }
  }

  if (disabled) {
    return (
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant.profile_photo} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant.profile_photo} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`photo-upload-${participant.id}`}
      />
      <label htmlFor={`photo-upload-${participant.id}`} className="cursor-pointer">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
          <span>
            <Upload className="w-3 h-3" />
          </span>
        </Button>
      </label>
    </div>
  )
}

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: ParticipantCreateRequest) => void
  isSaving: boolean
}) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    paternal_name: "",
    badge_name: "",
    role: "" as ParticipantRole | "",
    date_of_birth: "",
    gender: "" as Gender | "",
    tshirt_size: "" as TshirtSize | "",
    dietary_requirements: "" as DietaryRequirement | "",
    other_dietary_requirements: "",
    passport_number: "",
    medical_requirements: "",
    email: "",
    regulations_accepted: false,
  })
  const [passportScan, setPassportScan] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [consentForm, setConsentForm] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) return
    if (!formData.role || !formData.gender || !formData.tshirt_size || !formData.dietary_requirements) return
    if (!formData.email || !formData.regulations_accepted) return
    if (!passportScan || !profilePhoto || !consentForm) return

    onAdd({
      first_name: formData.first_name,
      last_name: formData.last_name,
      paternal_name: formData.paternal_name || undefined,
      badge_name: formData.badge_name || undefined,
      role: formData.role as ParticipantRole,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender as Gender,
      tshirt_size: formData.tshirt_size as TshirtSize,
      dietary_requirements: formData.dietary_requirements as DietaryRequirement,
      other_dietary_requirements: formData.dietary_requirements === 'OTHER' ? formData.other_dietary_requirements : undefined,
      passport_number: formData.passport_number,
      medical_requirements: formData.medical_requirements || undefined,
      email: formData.email,
      regulations_accepted: formData.regulations_accepted,
      passport_scan: passportScan,
      profile_photo: profilePhoto,
      consent_form_signed: consentForm,
    })
    setFormData({
      first_name: "",
      last_name: "",
      paternal_name: "",
      badge_name: "",
      role: "",
      date_of_birth: "",
      gender: "",
      tshirt_size: "",
      dietary_requirements: "",
      other_dietary_requirements: "",
      passport_number: "",
      medical_requirements: "",
      email: "",
      regulations_accepted: false,
    })
    setPassportScan(null)
    setProfilePhoto(null)
    setConsentForm(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Add a new member to your delegation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paternal_name">Paternal Name (optional)</Label>
              <Input
                id="paternal_name"
                placeholder="Optional"
                value={formData.paternal_name}
                onChange={(e) => setFormData({ ...formData, paternal_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge_name">Name for Badge</Label>
              <Input
                id="badge_name"
                placeholder="Name to display on badge (optional)"
                value={formData.badge_name}
                onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="participant@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_number">Passport Number *</Label>
              <Input
                id="passport_number"
                required
                placeholder="FA8475924"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as ParticipantRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                  <SelectItem value="CONTESTANT">Contestant</SelectItem>
                  <SelectItem value="OBSERVER">Observer</SelectItem>
                  <SelectItem value="GUEST">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tshirt_size">T-shirt Size *</Label>
              <Select
                value={formData.tshirt_size}
                onValueChange={(value) => setFormData({ ...formData, tshirt_size: value as TshirtSize })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietary_requirements">Dietary Requirements *</Label>
              <Select
                value={formData.dietary_requirements}
                onValueChange={(value) => setFormData({ ...formData, dietary_requirements: value as DietaryRequirement })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HALAL">Halal</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="KOSHER">Kosher</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.dietary_requirements === 'OTHER' && (
            <div className="space-y-2">
              <Label htmlFor="other_dietary_requirements">Please specify dietary requirements *</Label>
              <Input
                id="other_dietary_requirements"
                required
                placeholder="Describe your dietary requirements"
                value={formData.other_dietary_requirements}
                onChange={(e) => setFormData({ ...formData, other_dietary_requirements: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="medical_requirements">Medical Requirements</Label>
            <Input
              id="medical_requirements"
              placeholder="Any allergies, medical conditions, or special requirements (optional)"
              value={formData.medical_requirements}
              onChange={(e) => setFormData({ ...formData, medical_requirements: e.target.value })}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Required Documents</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passport_scan">Passport Scan *</Label>
                <Input
                  id="passport_scan"
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setPassportScan(e.target.files?.[0] || null)}
                />
                {passportScan && <p className="text-sm text-muted-foreground">{passportScan.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_photo">Profile Photo (passport-style) *</Label>
                <Input
                  id="profile_photo"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                />
                {profilePhoto && <p className="text-sm text-muted-foreground">{profilePhoto.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consent_form">Signed Consent Form *</Label>
                <Input
                  id="consent_form"
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setConsentForm(e.target.files?.[0] || null)}
                />
                {consentForm && <p className="text-sm text-muted-foreground">{consentForm.name}</p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="regulations_accepted"
                checked={formData.regulations_accepted}
                onChange={(e) => setFormData({ ...formData, regulations_accepted: e.target.checked })}
                className="mt-1"
                required
              />
              <Label htmlFor="regulations_accepted" className="text-sm font-normal">
                I have read and agree to the IChO 2026 regulations and rules *
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditMemberDialog({
  participant,
  onEdit,
  onDelete,
  isSaving,
}: {
  participant: Participant
  onEdit: (id: string, data: Partial<ParticipantCreateRequest>) => void
  onDelete: (id: string) => void
  isSaving: boolean
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: participant.first_name || "",
    last_name: participant.last_name || "",
    paternal_name: participant.paternal_name || "",
    badge_name: participant.badge_name || "",
    role: participant.role,
    date_of_birth: participant.date_of_birth,
    gender: participant.gender,
    tshirt_size: participant.tshirt_size,
    dietary_requirements: participant.dietary_requirements,
    other_dietary_requirements: participant.other_dietary_requirements || "",
    passport_number: participant.passport_number,
    medical_requirements: participant.medical_requirements || "",
    email: participant.email || "",
    regulations_accepted: participant.regulations_accepted,
  })
  const [passportScan, setPassportScan] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [consentForm, setConsentForm] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(participant.id, {
      ...formData,
      other_dietary_requirements: formData.dietary_requirements === 'OTHER' ? formData.other_dietary_requirements : undefined,
      passport_scan: passportScan || undefined,
      profile_photo: profilePhoto || undefined,
      consent_form_signed: consentForm || undefined,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update member information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paternal Name (optional)</Label>
              <Input
                value={formData.paternal_name}
                onChange={(e) => setFormData({ ...formData, paternal_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name for Badge</Label>
              <Input
                placeholder="Name to display on badge (optional)"
                value={formData.badge_name}
                onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Passport Number *</Label>
              <Input
                required
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as ParticipantRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                  <SelectItem value="CONTESTANT">Contestant</SelectItem>
                  <SelectItem value="OBSERVER">Observer</SelectItem>
                  <SelectItem value="GUEST">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>T-shirt Size *</Label>
              <Select
                value={formData.tshirt_size}
                onValueChange={(value) => setFormData({ ...formData, tshirt_size: value as TshirtSize })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dietary Requirements *</Label>
              <Select
                value={formData.dietary_requirements}
                onValueChange={(value) => setFormData({ ...formData, dietary_requirements: value as DietaryRequirement })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HALAL">Halal</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="KOSHER">Kosher</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Medical Requirements</Label>
              <Input
                placeholder="Any allergies, medical conditions, or special requirements (optional)"
                value={formData.medical_requirements}
                onChange={(e) => setFormData({ ...formData, medical_requirements: e.target.value })}
              />
            </div>
          </div>

          {formData.dietary_requirements === 'OTHER' && (
            <div className="space-y-2">
              <Label>Please specify dietary requirements *</Label>
              <Input
                required
                placeholder="Describe your dietary requirements"
                value={formData.other_dietary_requirements}
                onChange={(e) => setFormData({ ...formData, other_dietary_requirements: e.target.value })}
              />
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Update Documents (optional)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Passport Scan {participant.passport_scan ? "(already uploaded)" : ""}</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPassportScan(e.target.files?.[0] || null)}
                />
                {passportScan && <p className="text-sm text-muted-foreground">New: {passportScan.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>Profile Photo {participant.profile_photo ? "(already uploaded)" : ""}</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                />
                {profilePhoto && <p className="text-sm text-muted-foreground">New: {profilePhoto.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>Consent Form {participant.consent_form_signed ? "(already uploaded)" : ""}</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setConsentForm(e.target.files?.[0] || null)}
                />
                {consentForm && <p className="text-sm text-muted-foreground">New: {consentForm.name}</p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={`regulations_accepted_${participant.id}`}
                checked={formData.regulations_accepted}
                onChange={(e) => setFormData({ ...formData, regulations_accepted: e.target.checked })}
                className="mt-1"
              />
              <Label htmlFor={`regulations_accepted_${participant.id}`} className="text-sm font-normal">
                I have read and agree to the IChO 2026 regulations and rules
              </Label>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(participant.id)
                setOpen(false)
              }}
              disabled={isSaving}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
