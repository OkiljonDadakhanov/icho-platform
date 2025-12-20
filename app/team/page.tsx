"use client"

import { useState } from "react"
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
import { Plus, Edit, AlertCircle, UsersRound, Upload, X, ImageIcon } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Participant = {
  firstName: string
  lastName: string
  role: string
  yearOfBirth: number
  gender: string
  tshirtSize: string
  dietary: string
  passportNumber: string
  photoUrl?: string
}

export default function TeamPage() {
  const isLocked = false
  const [participants, setParticipants] = useState<Participant[]>(
    mockDelegation.participants.map((p) => ({
      ...p,
      photoUrl: undefined,
    }))
  )
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddMember = (data: Omit<Participant, "photoUrl"> & { photo?: File }) => {
    const newParticipant: Participant = {
      ...data,
      photoUrl: data.photo ? URL.createObjectURL(data.photo) : undefined,
    }
    setParticipants([...participants, newParticipant])
    setIsAddDialogOpen(false)
  }

  const handleEditMember = (index: number, data: Omit<Participant, "photoUrl"> & { photo?: File }) => {
    const updated = [...participants]
    updated[index] = {
      ...data,
      photoUrl: data.photo ? URL.createObjectURL(data.photo) : updated[index].photoUrl,
    }
    setParticipants(updated)
    setEditingIndex(null)
  }

  const handleDeleteMember = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (index: number, file: File) => {
    const updated = [...participants]
    updated[index].photoUrl = URL.createObjectURL(file)
    setParticipants(updated)
  }

  const uploadedPhotosCount = participants.filter((p) => p.photoUrl).length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <UsersRound className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Delegation for Uzbekistan</h1>
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

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Members in your delegation</h2>
          {!isLocked && (
            <AddMemberDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onAdd={handleAddMember}
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Photo</th>
                <th className="text-left py-3 font-medium">Position</th>
                <th className="text-left py-3 font-medium">Person</th>
                <th className="text-left py-3 font-medium">Passport No</th>
                <th className="text-left py-3 font-medium">YOB</th>
                <th className="text-left py-3 font-medium">Gender</th>
                <th className="text-left py-3 font-medium">Shirt</th>
                <th className="text-left py-3 font-medium">Diet</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <PhotoUploadCell
                      participant={participant}
                      index={index}
                      onUpload={handlePhotoUpload}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="py-4">
                    <Badge
                      variant="secondary"
                      className={
                        participant.role === "Team Leader"
                          ? "bg-[#2f3090]/10 text-[#2f3090]"
                          : participant.role === "Deputy Leader"
                            ? "bg-[#4547a9]/10 text-[#4547a9]"
                            : participant.role === "Contestant"
                              ? "bg-[#00795d]/10 text-[#00795d]"
                              : participant.role === "IC Member"
                                ? "bg-purple-100 text-purple-700"
                                : participant.role === "ITC Member"
                                  ? "bg-cyan-100 text-cyan-700"
                                  : "bg-orange-100 text-orange-700"
                      }
                    >
                      {participant.role}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.photoUrl} />
                        <AvatarFallback className="text-xs">
                          {participant.firstName[0]}
                          {participant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {participant.firstName} {participant.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs">{participant.passportNumber}</td>
                  <td className="py-4">{participant.yearOfBirth}</td>
                  <td className="py-4">{participant.gender}</td>
                  <td className="py-4">{participant.tshirtSize} (male fit)</td>
                  <td className="py-4">{participant.dietary}</td>
                  <td className="py-4">
                    {!isLocked && (
                      <div className="flex items-center gap-2">
                        <EditMemberDialog
                          participant={participant}
                          index={index}
                          onEdit={handleEditMember}
                          onDelete={handleDeleteMember}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Required Documents</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Consent Forms</p>
              <p className="text-sm text-muted-foreground">Signed consent form for each participant</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              {participants.length - 1}/{participants.length} Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Passport Scans</p>
              <p className="text-sm text-muted-foreground">Clear scan of passport photo page</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              {participants.length}/{participants.length} Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Profile Photos</p>
              <p className="text-sm text-muted-foreground">Passport-style photo for each participant</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              {uploadedPhotosCount}/{participants.length} Uploaded
            </Badge>
          </div>
        </div>
      </Card>

      {!isLocked && (
        <div className="flex justify-end">
          <Button size="lg" className="bg-[#00795d] hover:bg-[#009973]">
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  )
}

function PhotoUploadCell({
  participant,
  index,
  onUpload,
  disabled,
}: {
  participant: Participant
  index: number
  onUpload: (index: number, file: File) => void
  disabled: boolean
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      onUpload(index, file)
    }
  }

  if (disabled) {
    return (
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant.photoUrl} />
        <AvatarFallback className="text-xs">
          {participant.firstName[0]}
          {participant.lastName[0]}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant.photoUrl} />
        <AvatarFallback className="text-xs">
          {participant.firstName[0]}
          {participant.lastName[0]}
        </AvatarFallback>
      </Avatar>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`photo-upload-${index}`}
      />
      <label htmlFor={`photo-upload-${index}`} className="cursor-pointer">
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: Omit<Participant, "photoUrl"> & { photo?: File }) => void
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    yearOfBirth: new Date().getFullYear() - 20,
    gender: "",
    tshirtSize: "",
    dietary: "",
    passportNumber: "",
    photo: undefined as File | undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      firstName: "",
      lastName: "",
      role: "",
      yearOfBirth: new Date().getFullYear() - 20,
      gender: "",
      tshirtSize: "",
      dietary: "",
      passportNumber: "",
      photo: undefined,
    })
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
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Leader">Team Leader</SelectItem>
                  <SelectItem value="Deputy Leader">Deputy Leader</SelectItem>
                  <SelectItem value="Contestant">Contestant</SelectItem>
                  <SelectItem value="Observer">Observer</SelectItem>
                  <SelectItem value="Guest">Guest</SelectItem>
                  <SelectItem value="IC Member">IC Member</SelectItem>
                  <SelectItem value="ISC Member">ISC Member</SelectItem>
                  <SelectItem value="ITC Member">ITC Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number *</Label>
              <Input
                id="passportNumber"
                required
                placeholder="FA8475924"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                pattern="[A-Z0-9]+"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearOfBirth">Year of Birth *</Label>
              <Input
                id="yearOfBirth"
                type="number"
                required
                min="1950"
                max={new Date().getFullYear()}
                value={formData.yearOfBirth}
                onChange={(e) => setFormData({ ...formData, yearOfBirth: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tshirtSize">T-shirt Size *</Label>
              <Select
                value={formData.tshirtSize}
                onValueChange={(value) => setFormData({ ...formData, tshirtSize: value })}
                required
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
              <Label htmlFor="dietary">Dietary Requirements *</Label>
              <Select
                value={formData.dietary}
                onValueChange={(value) => setFormData({ ...formData, dietary: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="kosher">Kosher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                id="photo"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData({ ...formData, photo: file })
                }}
                className="hidden"
              />
              <label htmlFor="photo" className="cursor-pointer">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formData.photo ? formData.photo.name : "Click to upload photo"}
                </p>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]">
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditMemberDialog({
  participant,
  index,
  onEdit,
  onDelete,
}: {
  participant: Participant
  index: number
  onEdit: (index: number, data: Omit<Participant, "photoUrl"> & { photo?: File }) => void
  onDelete: (index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: participant.firstName,
    lastName: participant.lastName,
    role: participant.role,
    yearOfBirth: participant.yearOfBirth,
    gender: participant.gender,
    tshirtSize: participant.tshirtSize,
    dietary: participant.dietary,
    passportNumber: participant.passportNumber,
    photo: undefined as File | undefined,
  })

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update member information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-firstName-${index}`}>First Name *</Label>
              <Input
                id={`edit-firstName-${index}`}
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-lastName-${index}`}>Last Name *</Label>
              <Input
                id={`edit-lastName-${index}`}
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-role-${index}`}>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Leader">Team Leader</SelectItem>
                  <SelectItem value="Deputy Leader">Deputy Leader</SelectItem>
                  <SelectItem value="Contestant">Contestant</SelectItem>
                  <SelectItem value="Observer">Observer</SelectItem>
                  <SelectItem value="Guest">Guest</SelectItem>
                  <SelectItem value="IC Member">IC Member</SelectItem>
                  <SelectItem value="ISC Member">ISC Member</SelectItem>
                  <SelectItem value="ITC Member">ITC Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-passportNumber-${index}`}>Passport Number *</Label>
              <Input
                id={`edit-passportNumber-${index}`}
                required
                placeholder="FA8475924"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                pattern="[A-Z0-9]+"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-yearOfBirth-${index}`}>Year of Birth *</Label>
              <Input
                id={`edit-yearOfBirth-${index}`}
                type="number"
                required
                min="1950"
                max={new Date().getFullYear()}
                value={formData.yearOfBirth}
                onChange={(e) => setFormData({ ...formData, yearOfBirth: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-gender-${index}`}>Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-tshirtSize-${index}`}>T-shirt Size *</Label>
              <Select
                value={formData.tshirtSize}
                onValueChange={(value) => setFormData({ ...formData, tshirtSize: value })}
                required
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
            <div className="space-y-2">
              <Label htmlFor={`edit-dietary-${index}`}>Dietary Requirements *</Label>
              <Select
                value={formData.dietary}
                onValueChange={(value) => setFormData({ ...formData, dietary: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="kosher">Kosher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-photo-${index}`}>Profile Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                id={`edit-photo-${index}`}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData({ ...formData, photo: file })
                }}
                className="hidden"
              />
              <label htmlFor={`edit-photo-${index}`} className="cursor-pointer">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formData.photo ? formData.photo.name : "Click to upload or change photo"}
                </p>
              </label>
            </div>
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
