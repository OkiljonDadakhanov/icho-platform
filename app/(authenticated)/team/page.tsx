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
import {
  Plus,
  Edit,
  AlertCircle,
  UsersRound,
  Upload,
  Download,
  FileText,
  Check,
  User,
  Mail,
  CreditCard,
  Calendar,
  Shirt,
  UtensilsCrossed,
  Stethoscope,
  Camera,
  FileCheck,
  Trash2,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Participant, ParticipantCreateRequest, Gender, ParticipantRole, TshirtSize, DietaryRequirement } from "@/lib/types"
import { mapRoleToFrontend, mapGenderToFrontend, mapTshirtToFrontend, mapDietaryToFrontend } from "@/lib/types"

// Participant limits per delegation
const PARTICIPANT_LIMITS: Record<string, number | null> = {
  TEAM_LEADER: 2,
  CONTESTANT: 4,
  OBSERVER: 2,
  GUEST: null, // Unlimited
}

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

  // Calculate stats
  const teamLeaders = participants.filter(p => p.role === 'TEAM_LEADER').length
  const contestants = participants.filter(p => p.role === 'CONTESTANT').length
  const observers = participants.filter(p => p.role === 'OBSERVER').length
  const guests = participants.filter(p => p.role === 'GUEST').length

  return (
    <div className="space-y-6">
      {/* Hero Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f3090] via-[#1e2060] to-[#00795d] text-white p-8 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00795d]/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <UsersRound className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Delegation for {countryName}</h1>
              <p className="text-white/70 mt-1">Manage your delegation members for IChO 2026</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-2xl font-bold">{participants.length}</span>
              <span className="text-white/70 ml-2 text-sm">Total</span>
            </div>
            <div className={`px-4 py-2 rounded-lg backdrop-blur-sm border transition-all hover:scale-105 ${teamLeaders >= (PARTICIPANT_LIMITS.TEAM_LEADER ?? Infinity) ? 'bg-red-500/30 border-red-500/30 hover:bg-red-500/50' : 'bg-[#2f3090]/30 border-[#2f3090]/30 hover:bg-[#2f3090]/50'}`}>
              <span className="text-xl font-semibold">{teamLeaders}/{PARTICIPANT_LIMITS.TEAM_LEADER ?? '?'}</span>
              <span className="text-white/70 ml-2 text-sm">Leaders</span>
            </div>
            <div className={`px-4 py-2 rounded-lg backdrop-blur-sm border transition-all hover:scale-105 ${contestants >= (PARTICIPANT_LIMITS.CONTESTANT ?? Infinity) ? 'bg-red-500/30 border-red-500/30 hover:bg-red-500/50' : 'bg-[#00795d]/30 border-[#00795d]/30 hover:bg-[#00795d]/50'}`}>
              <span className="text-xl font-semibold">{contestants}/{PARTICIPANT_LIMITS.CONTESTANT ?? '?'}</span>
              <span className="text-white/70 ml-2 text-sm">Contestants</span>
            </div>
            <div className={`px-4 py-2 rounded-lg backdrop-blur-sm border transition-all hover:scale-105 ${observers >= (PARTICIPANT_LIMITS.OBSERVER ?? Infinity) ? 'bg-red-500/30 border-red-500/30 hover:bg-red-500/50' : 'bg-purple-500/20 border-purple-500/20 hover:bg-purple-500/40'}`}>
              <span className="text-xl font-semibold">{observers}/{PARTICIPANT_LIMITS.OBSERVER ?? '?'}</span>
              <span className="text-white/70 ml-2 text-sm">Observers</span>
            </div>
            <div className="px-4 py-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/20 transition-all hover:bg-orange-500/40 hover:scale-105">
              <span className="text-xl font-semibold">{guests}</span>
              <span className="text-white/70 ml-2 text-sm">Guests</span>
            </div>
          </div>
        </div>
      </div>

      {isLocked && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The deadline for editing member details has passed. Please contact the organisers if you still need to make
            edits.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="animate-in shake duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <UsersRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Delegation Members</h2>
              <p className="text-sm text-gray-500">{participants.length} members registered</p>
            </div>
          </div>
          {!isLocked && (
            <AddMemberDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onAdd={handleAddMember}
              isSaving={isSaving}
              roleCounts={{ teamLeaders, contestants, observers, guests }}
            />
          )}
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
              <UsersRound className="w-10 h-10 text-[#2f3090]/50" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No participants registered yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Start building your delegation by clicking the "Add Member" button above.
              You can add team leaders, contestants, observers, and guests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Photo</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Passport</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">DOB</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Gender</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Shirt</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Diet</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => {
                  const role = mapRoleToFrontend(participant.role)
                  const nameParts = participant.full_name.split(' ')
                  const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                    : participant.full_name.substring(0, 2).toUpperCase()

                  return (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#2f3090]/5 hover:to-[#00795d]/5 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <PhotoUploadCell
                          participant={participant}
                          initials={initials}
                          onUpload={handlePhotoUpload}
                          disabled={isLocked}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`font-medium transition-all duration-200 group-hover:scale-105 ${
                            role === "Team Leader"
                              ? "bg-[#2f3090] text-white hover:bg-[#2f3090]/90"
                              : role === "Contestant"
                                ? "bg-[#00795d] text-white hover:bg-[#00795d]/90"
                                : role === "Observer"
                                  ? "bg-purple-600 text-white hover:bg-purple-500"
                                  : "bg-orange-500 text-white hover:bg-orange-400"
                          }`}
                        >
                          {role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                            <AvatarImage src={participant.profile_photo} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-gray-800">{participant.full_name}</span>
                            {participant.badge_name && (
                              <p className="text-xs text-gray-500">Badge: {participant.badge_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {participant.passport_number}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(participant.date_of_birth).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {mapTshirtToFrontend(participant.tshirt_size)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          {mapDietaryToFrontend(participant.dietary_requirements)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {!isLocked && (
                          <EditMemberDialog
                            participant={participant}
                            onEdit={handleEditMember}
                            onDelete={handleDeleteMember}
                            isSaving={isSaving}
                            roleCounts={{ teamLeaders, contestants, observers, guests }}
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
      <Avatar className="w-11 h-11 ring-2 ring-white shadow-md">
        <AvatarImage src={participant.profile_photo} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center gap-2 group/photo">
      <Avatar className="w-11 h-11 ring-2 ring-white shadow-md transition-all duration-200 group-hover/photo:ring-[#2f3090]">
        <AvatarImage src={participant.profile_photo} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`photo-upload-${participant.id}`}
      />
      <label htmlFor={`photo-upload-${participant.id}`} className="cursor-pointer">
        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#2f3090] hover:text-white transition-all duration-200 group-hover/photo:scale-110">
          <Upload className="w-3.5 h-3.5" />
        </div>
      </label>
    </div>
  )
}

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
  isSaving,
  roleCounts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: ParticipantCreateRequest) => void
  isSaving: boolean
  roleCounts: { teamLeaders: number; contestants: number; observers: number; guests: number }
}) {
  // Check if roles have reached their limits
  const isRoleDisabled = (role: ParticipantRole) => {
    const limit = PARTICIPANT_LIMITS[role]
    if (limit === null || limit === undefined) return false // Unlimited or unknown role
    switch (role) {
      case 'TEAM_LEADER': return roleCounts.teamLeaders >= limit
      case 'CONTESTANT': return roleCounts.contestants >= limit
      case 'OBSERVER': return roleCounts.observers >= limit
      default: return false
    }
  }
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
  const [commitmentForm, setCommitmentForm] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) return
    if (!formData.role || !formData.gender || !formData.tshirt_size || !formData.dietary_requirements) return
    if (!formData.email || !formData.regulations_accepted) return
    if (!passportScan || !profilePhoto || !consentForm || !commitmentForm) return

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
      commitment_form_signed: commitmentForm,
    })
    // Reset form
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
    setCommitmentForm(null)
    setCurrentStep(1)
  }

  const canProceedStep1 = formData.first_name && formData.last_name && formData.email && formData.passport_number && formData.date_of_birth && formData.role && formData.gender
  const canProceedStep2 = formData.tshirt_size && formData.dietary_requirements && (formData.dietary_requirements !== 'OTHER' || formData.other_dietary_requirements)
  const canSubmit = canProceedStep1 && canProceedStep2 && passportScan && profilePhoto && consentForm && commitmentForm && formData.regulations_accepted

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen)
      if (!newOpen) setCurrentStep(1)
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
          <Sparkles className="w-4 h-4 ml-2 opacity-70" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-xl text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add New Member</DialogTitle>
              <DialogDescription>Add a new member to your delegation</DialogDescription>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 px-4">
            {[
              { num: 1, label: "Personal Info", icon: User },
              { num: 2, label: "Preferences", icon: Shirt },
              { num: 3, label: "Documents", icon: FileText },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep || (step.num === 2 && canProceedStep1) || (step.num === 3 && canProceedStep1 && canProceedStep2)) {
                      setCurrentStep(step.num)
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    currentStep === step.num
                      ? "bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white shadow-lg scale-105"
                      : currentStep > step.num
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm hidden sm:inline">{step.label}</span>
                  <span className="font-medium text-sm sm:hidden">{step.num}</span>
                </button>
                {idx < 2 && (
                  <ChevronRight className={`w-5 h-5 mx-2 ${currentStep > step.num ? "text-green-500" : "text-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4">
          {/* Step 1: Personal Information */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 1 ? "block" : "hidden"}`}>
            <div className="bg-gradient-to-r from-[#2f3090]/5 to-[#00795d]/5 p-4 rounded-xl border border-[#2f3090]/10">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#2f3090]" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-600 flex items-center gap-1">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    required
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-600 flex items-center gap-1">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    required
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="paternal_name" className="text-gray-600">
                    Paternal Name <span className="text-gray-400 text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="paternal_name"
                    placeholder="Optional"
                    value={formData.paternal_name}
                    onChange={(e) => setFormData({ ...formData, paternal_name: e.target.value })}
                    className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge_name" className="text-gray-600">
                    Name for Badge <span className="text-gray-400 text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="badge_name"
                    placeholder="Display name on badge"
                    value={formData.badge_name}
                    onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                    className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Contact & Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="participant@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport_number" className="text-gray-600 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Passport Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="passport_number"
                    required
                    placeholder="FA8475924"
                    value={formData.passport_number}
                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-600 flex items-center gap-1">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as ParticipantRole })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEAM_LEADER" disabled={isRoleDisabled('TEAM_LEADER')}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2f3090]"></span>
                          Team Leader {isRoleDisabled('TEAM_LEADER') && `(${roleCounts.teamLeaders}/${PARTICIPANT_LIMITS.TEAM_LEADER} max)`}
                        </span>
                      </SelectItem>
                      <SelectItem value="CONTESTANT" disabled={isRoleDisabled('CONTESTANT')}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00795d]"></span>
                          Contestant {isRoleDisabled('CONTESTANT') && `(${roleCounts.contestants}/${PARTICIPANT_LIMITS.CONTESTANT} max)`}
                        </span>
                      </SelectItem>
                      <SelectItem value="OBSERVER" disabled={isRoleDisabled('OBSERVER')}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          Observer {isRoleDisabled('OBSERVER') && `(${roleCounts.observers}/${PARTICIPANT_LIMITS.OBSERVER} max)`}
                        </span>
                      </SelectItem>
                      <SelectItem value="GUEST">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Guest
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-600 flex items-center gap-1">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
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
            </div>
          </div>

          {/* Step 2: Preferences */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 2 ? "block" : "hidden"}`}>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-amber-600" />
                Apparel & Dietary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tshirt_size" className="text-gray-600 flex items-center gap-1">
                    <Shirt className="w-3 h-3" /> T-shirt Size <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tshirt_size}
                    onValueChange={(value) => setFormData({ ...formData, tshirt_size: value as TshirtSize })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-amber-500 focus:ring-amber-500/20">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary_requirements" className="text-gray-600 flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3" /> Dietary Requirements <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.dietary_requirements}
                    onValueChange={(value) => setFormData({ ...formData, dietary_requirements: value as DietaryRequirement })}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-amber-500 focus:ring-amber-500/20">
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
                <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="other_dietary_requirements" className="text-gray-600 flex items-center gap-1">
                    Please specify <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="other_dietary_requirements"
                    required
                    placeholder="Describe your dietary requirements"
                    value={formData.other_dietary_requirements}
                    onChange={(e) => setFormData({ ...formData, other_dietary_requirements: e.target.value })}
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                Medical Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="medical_requirements" className="text-gray-600">
                  Medical Requirements <span className="text-gray-400 text-xs">(optional)</span>
                </Label>
                <Input
                  id="medical_requirements"
                  placeholder="Any allergies, medical conditions, or special requirements"
                  value={formData.medical_requirements}
                  onChange={(e) => setFormData({ ...formData, medical_requirements: e.target.value })}
                  className="border-gray-200 focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                />
                <p className="text-xs text-gray-500">This information will be kept confidential and shared only with medical staff if needed.</p>
              </div>
            </div>
          </div>

          {/* Step 3: Documents */}
          <div className={`space-y-4 transition-all duration-300 ${currentStep === 3 ? "block" : "hidden"}`}>
            {/* Required Documents Upload */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-violet-600" />
                Upload Required Documents
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Passport Scan */}
                <FileUploadField
                  id="passport_scan"
                  label="Passport Scan"
                  required
                  accept="image/*,.pdf"
                  file={passportScan}
                  onChange={setPassportScan}
                  icon={<CreditCard className="w-4 h-4" />}
                  color="violet"
                />

                {/* Profile Photo */}
                <FileUploadField
                  id="profile_photo"
                  label="Profile Photo (passport-style)"
                  required
                  accept="image/*"
                  file={profilePhoto}
                  onChange={setProfilePhoto}
                  icon={<Camera className="w-4 h-4" />}
                  color="violet"
                />

                {/* Consent Form */}
                <FileUploadField
                  id="consent_form"
                  label="Signed Consent Form"
                  required
                  accept="image/*,.pdf"
                  file={consentForm}
                  onChange={setConsentForm}
                  icon={<FileText className="w-4 h-4" />}
                  color="violet"
                />

                {/* Commitment Form */}
                <FileUploadField
                  id="commitment_form"
                  label="Signed Commitment Form"
                  required
                  accept="image/*,.pdf"
                  file={commitmentForm}
                  onChange={setCommitmentForm}
                  icon={<FileCheck className="w-4 h-4" />}
                  color="violet"
                />
              </div>
            </div>

            {/* Regulations Acceptance */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    id="regulations_accepted"
                    checked={formData.regulations_accepted}
                    onChange={(e) => setFormData({ ...formData, regulations_accepted: e.target.checked })}
                    className="w-5 h-5 rounded border-sky-300 text-[#2f3090] focus:ring-[#2f3090]/20 transition-all cursor-pointer"
                    required
                  />
                </div>
                <Label htmlFor="regulations_accepted" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  I have read and agree to the <span className="font-semibold text-[#2f3090]">IChO 2026 regulations and rules</span>.
                  I understand and accept all terms and conditions. <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="hover:bg-gray-100"
                >
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSaving || !canSubmit}
                  className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Add Member
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FileUploadField({
  id,
  label,
  required,
  accept,
  file,
  onChange,
  icon,
  color = "violet",
}: {
  id: string
  label: string
  required?: boolean
  accept: string
  file: File | null
  onChange: (file: File | null) => void
  icon: React.ReactNode
  color?: "violet" | "emerald" | "blue"
}) {
  const colorClasses = {
    violet: {
      bg: "bg-violet-100",
      border: "border-violet-200 hover:border-violet-400",
      icon: "text-violet-600",
    },
    emerald: {
      bg: "bg-emerald-100",
      border: "border-emerald-200 hover:border-emerald-400",
      icon: "text-emerald-600",
    },
    blue: {
      bg: "bg-blue-100",
      border: "border-blue-200 hover:border-blue-400",
      icon: "text-blue-600",
    },
  }

  const colors = colorClasses[color]

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-600 flex items-center gap-1.5 text-sm">
        <span className={colors.icon}>{icon}</span>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className={`relative flex items-center gap-3 p-3 bg-white rounded-lg border ${colors.border} transition-all duration-200 hover:shadow-sm`}>
        <div className={`p-2 ${colors.bg} rounded-lg`}>
          <Upload className={`w-4 h-4 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No file selected</span>
          )}
        </div>
        <Input
          id={id}
          type="file"
          accept={accept}
          required={required && !file}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Browse
        </span>
      </div>
    </div>
  )
}

function EditMemberDialog({
  participant,
  onEdit,
  onDelete,
  isSaving,
  roleCounts,
}: {
  participant: Participant
  onEdit: (id: string, data: Partial<ParticipantCreateRequest>) => void
  onDelete: (id: string) => void
  isSaving: boolean
  roleCounts: { teamLeaders: number; contestants: number; observers: number; guests: number }
}) {
  // Check if roles have reached their limits (excluding current participant's role)
  const isRoleDisabled = (role: ParticipantRole) => {
    // If the participant already has this role, it's not disabled
    if (participant.role === role) return false
    const limit = PARTICIPANT_LIMITS[role]
    if (limit === null || limit === undefined) return false // Unlimited or unknown role
    switch (role) {
      case 'TEAM_LEADER': return roleCounts.teamLeaders >= limit
      case 'CONTESTANT': return roleCounts.contestants >= limit
      case 'OBSERVER': return roleCounts.observers >= limit
      default: return false
    }
  }
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
  const [commitmentForm, setCommitmentForm] = useState<File | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(participant.id, {
      ...formData,
      other_dietary_requirements: formData.dietary_requirements === 'OTHER' ? formData.other_dietary_requirements : undefined,
      passport_scan: passportScan || undefined,
      profile_photo: profilePhoto || undefined,
      consent_form_signed: consentForm || undefined,
      commitment_form_signed: commitmentForm || undefined,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#2f3090] hover:bg-gradient-to-r hover:from-[#2f3090]/10 hover:to-[#00795d]/10 transition-all duration-200"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-[#2f3090]/20">
              <AvatarImage src={participant.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white font-medium">
                {participant.first_name?.[0]}{participant.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">Edit Member</DialogTitle>
              <DialogDescription>Update information for {participant.full_name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div className="bg-gradient-to-r from-[#2f3090]/5 to-[#00795d]/5 p-4 rounded-xl border border-[#2f3090]/10">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2f3090]" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-600">First Name *</Label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="border-gray-200 focus:border-[#2f3090]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Last Name *</Label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="border-gray-200 focus:border-[#2f3090]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-600">Paternal Name</Label>
                <Input
                  value={formData.paternal_name}
                  onChange={(e) => setFormData({ ...formData, paternal_name: e.target.value })}
                  className="border-gray-200 focus:border-[#2f3090]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Name for Badge</Label>
                <Input
                  placeholder="Display name on badge"
                  value={formData.badge_name}
                  onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                  className="border-gray-200 focus:border-[#2f3090]"
                />
              </div>
            </div>
          </div>

          {/* Contact & Identity */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-600">Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Passport Number *</Label>
                <Input
                  required
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
                  className="border-gray-200 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-600">Date of Birth *</Label>
                <Input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as ParticipantRole })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEAM_LEADER" disabled={isRoleDisabled('TEAM_LEADER')}>
                      Team Leader {isRoleDisabled('TEAM_LEADER') && `(${PARTICIPANT_LIMITS.TEAM_LEADER}/${PARTICIPANT_LIMITS.TEAM_LEADER} max)`}
                    </SelectItem>
                    <SelectItem value="CONTESTANT" disabled={isRoleDisabled('CONTESTANT')}>
                      Contestant {isRoleDisabled('CONTESTANT') && `(${PARTICIPANT_LIMITS.CONTESTANT}/${PARTICIPANT_LIMITS.CONTESTANT} max)`}
                    </SelectItem>
                    <SelectItem value="OBSERVER" disabled={isRoleDisabled('OBSERVER')}>
                      Observer {isRoleDisabled('OBSERVER') && `(${PARTICIPANT_LIMITS.OBSERVER}/${PARTICIPANT_LIMITS.OBSERVER} max)`}
                    </SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-amber-600" />
              Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-600">T-shirt Size *</Label>
                <Select
                  value={formData.tshirt_size}
                  onValueChange={(value) => setFormData({ ...formData, tshirt_size: value as TshirtSize })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">Dietary Requirements *</Label>
                <Select
                  value={formData.dietary_requirements}
                  onValueChange={(value) => setFormData({ ...formData, dietary_requirements: value as DietaryRequirement })}
                >
                  <SelectTrigger className="border-gray-200">
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
            </div>

            {formData.dietary_requirements === 'OTHER' && (
              <div className="space-y-2 mt-4">
                <Label className="text-gray-600">Please specify *</Label>
                <Input
                  required
                  value={formData.other_dietary_requirements}
                  onChange={(e) => setFormData({ ...formData, other_dietary_requirements: e.target.value })}
                  className="border-amber-200"
                />
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label className="text-gray-600">Medical Requirements</Label>
              <Input
                placeholder="Any allergies, medical conditions, or special requirements"
                value={formData.medical_requirements}
                onChange={(e) => setFormData({ ...formData, medical_requirements: e.target.value })}
                className="border-gray-200"
              />
            </div>
          </div>

          {/* Update Documents */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-600" />
              Update Documents <span className="text-gray-400 text-sm font-normal">(optional)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <FileUploadFieldEdit
                label="Passport Scan"
                hasExisting={!!participant.passport_scan}
                file={passportScan}
                onChange={setPassportScan}
                accept="image/*,.pdf"
              />
              <FileUploadFieldEdit
                label="Profile Photo"
                hasExisting={!!participant.profile_photo}
                file={profilePhoto}
                onChange={setProfilePhoto}
                accept="image/*"
              />
              <FileUploadFieldEdit
                label="Consent Form"
                hasExisting={!!participant.consent_form_signed}
                file={consentForm}
                onChange={setConsentForm}
                accept="image/*,.pdf"
              />
              <FileUploadFieldEdit
                label="Commitment Form"
                hasExisting={!!participant.commitment_form_signed}
                file={commitmentForm}
                onChange={setCommitmentForm}
                accept="image/*,.pdf"
              />
            </div>
          </div>

          {/* Regulations */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id={`regulations_accepted_${participant.id}`}
                checked={formData.regulations_accepted}
                onChange={(e) => setFormData({ ...formData, regulations_accepted: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-sky-300 text-[#2f3090] focus:ring-[#2f3090]/20"
              />
              <Label htmlFor={`regulations_accepted_${participant.id}`} className="text-sm text-gray-700 cursor-pointer">
                I have read and agree to the IChO 2026 regulations and rules
              </Label>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving}
                className="hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                <span className="text-sm text-red-600 font-medium">Confirm delete?</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDelete(participant.id)
                    setOpen(false)
                  }}
                  disabled={isSaving}
                >
                  Yes, delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FileUploadFieldEdit({
  label,
  hasExisting,
  file,
  onChange,
  accept,
}: {
  label: string
  hasExisting: boolean
  file: File | null
  onChange: (file: File | null) => void
  accept: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-all">
      <div className="p-2 bg-violet-100 rounded-lg">
        <FileText className="w-4 h-4 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-700 text-sm">{label}</p>
        {file ? (
          <div className="flex items-center gap-2 mt-1">
            <Check className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-500 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-0.5 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>
        ) : hasExisting ? (
          <span className="text-xs text-green-600">Already uploaded</span>
        ) : (
          <span className="text-xs text-gray-500">No file</span>
        )}
      </div>
      <label className="cursor-pointer">
        <span className="text-xs font-medium text-[#2f3090] bg-[#2f3090]/10 px-3 py-1.5 rounded-lg hover:bg-[#2f3090]/20 transition-colors">
          {hasExisting || file ? "Replace" : "Upload"}
        </span>
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
    </div>
  )
}
