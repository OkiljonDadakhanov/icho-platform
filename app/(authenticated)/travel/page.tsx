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
import { Plus, Edit, Plane, Calendar, Clock, X, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { travelService } from "@/lib/services/travel"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import type { TravelInfo, Participant } from "@/lib/types"
import { mapRoleToFrontend } from "@/lib/types"

export default function TravelPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [travelInfos, setTravelInfos] = useState<TravelInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [participantsData, travelData] = await Promise.all([
        participantsService.getAllParticipants(),
        travelService.getAllTravelInfo()
      ])
      setParticipants(participantsData)
      setTravelInfos(travelData)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  // Find participants without travel info
  const participantsWithTravel = new Set(travelInfos.map(t => t.participant))
  const missingTravel = participants.filter(p => !participantsWithTravel.has(p.id))

  const handleAddTravel = async (participantIds: string[], data: { arrival_datetime: string; departure_datetime: string; flight_number?: string; airline?: string }) => {
    try {
      setIsSaving(true)
      // Create travel info for all selected participants
      await Promise.all(
        participantIds.map(participantId =>
          travelService.createTravelInfo({
            participant_id: participantId,
            ...data
          })
        )
      )
      await fetchData()
    } catch (err) {
      console.error("Failed to add travel info:", err)
      setError("Failed to add travel information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTravel = async (id: string, data: Partial<TravelInfo>) => {
    try {
      setIsSaving(true)
      await travelService.updateTravelInfo(id, data)
      await fetchData()
    } catch (err) {
      console.error("Failed to update travel info:", err)
      setError("Failed to update travel information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTravel = async (id: string) => {
    try {
      setIsSaving(true)
      await travelService.deleteTravelInfo(id)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete travel info:", err)
      setError("Failed to delete travel information")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading message="Loading travel information..." />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Plane className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Travel Schedule for {countryName}</h1>
        </div>
        <p className="text-white/80">Please edit the arrival and departure schedule for your delegation.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {missingTravel.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">The following participants have missing travel information:</p>
            <div className="space-y-1">
              {missingTravel.map((person) => (
                <div key={person.id} className="flex items-center gap-2">
                  <span>{person.full_name}</span>
                  <Badge variant="secondary" className="bg-gray-100 text-xs">
                    {mapRoleToFrontend(person.role)}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Travel Information ({travelInfos.length})</h2>
          {participants.length > 0 && (
            <AddTravelDialog
              participants={participants}
              existingTravelParticipants={participantsWithTravel}
              onAdd={handleAddTravel}
              isSaving={isSaving}
            />
          )}
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No participants registered yet.</p>
            <Button className="mt-4" variant="outline" asChild>
              <a href="/team">Add Participants First</a>
            </Button>
          </div>
        ) : travelInfos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No travel information added yet.</p>
            <p className="text-sm mt-2">Click "Add Travel Info" to add arrival and departure details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Participant</th>
                  <th className="text-left py-3 font-medium">Arrival</th>
                  <th className="text-left py-3 font-medium">Departure</th>
                  <th className="text-left py-3 font-medium">Flight</th>
                  <th className="text-left py-3 font-medium">Airline</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {travelInfos.map((travel) => {
                  const participant = participants.find(p => p.id === travel.participant)
                  if (!participant) return null

                  return (
                    <tr key={travel.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{participant.full_name}</p>
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            {mapRoleToFrontend(participant.role)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{new Date(travel.arrival_datetime).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(travel.arrival_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{new Date(travel.departure_datetime).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(travel.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono">{travel.flight_number || '-'}</td>
                      <td className="py-4">{travel.airline || '-'}</td>
                      <td className="py-4">
                        <EditTravelDialog
                          travel={travel}
                          onEdit={handleUpdateTravel}
                          onDelete={handleDeleteTravel}
                          isSaving={isSaving}
                        />
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

function AddTravelDialog({
  participants,
  existingTravelParticipants,
  onAdd,
  isSaving,
}: {
  participants: Participant[]
  existingTravelParticipants: Set<string>
  onAdd: (participantIds: string[], data: { arrival_datetime: string; departure_datetime: string; flight_number?: string; airline?: string }) => void
  isSaving: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [formData, setFormData] = useState({
    arrival_date: "",
    arrival_time: "",
    departure_date: "",
    departure_time: "",
    flight_number: "",
    airline: "",
  })

  const availableParticipants = participants.filter(p => !existingTravelParticipants.has(p.id))

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    )
  }

  const selectAll = () => {
    setSelectedParticipants(availableParticipants.map(p => p.id))
  }

  const deselectAll = () => {
    setSelectedParticipants([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedParticipants.length === 0) return

    onAdd(selectedParticipants, {
      arrival_datetime: `${formData.arrival_date}T${formData.arrival_time}:00`,
      departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
      flight_number: formData.flight_number || undefined,
      airline: formData.airline || undefined,
    })
    setFormData({
      arrival_date: "",
      arrival_time: "",
      departure_date: "",
      departure_time: "",
      flight_number: "",
      airline: "",
    })
    setSelectedParticipants([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]" disabled={availableParticipants.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Add Travel Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Travel Information</DialogTitle>
          <DialogDescription>Select participants with the same travel schedule to add their information at once.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Participants *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs h-7"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="text-xs h-7"
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {availableParticipants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  All participants already have travel information
                </p>
              ) : (
                availableParticipants.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedParticipants.includes(p.id)}
                      onCheckedChange={() => toggleParticipant(p.id)}
                    />
                    <span className="flex-1">{p.full_name}</span>
                    <Badge variant="secondary" className="bg-gray-100 text-xs">
                      {mapRoleToFrontend(p.role)}
                    </Badge>
                  </label>
                ))
              )}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arrival Date *</Label>
              <Input
                type="date"
                required
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Arrival Time *</Label>
              <Input
                type="time"
                required
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date *</Label>
              <Input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Departure Time *</Label>
              <Input
                type="time"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Flight Number</Label>
              <Input
                placeholder="QB584"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Airline</Label>
              <Input
                placeholder="Uzbekistan Airways"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2f3090] hover:bg-[#4547a9]"
              disabled={isSaving || selectedParticipants.length === 0}
            >
              {isSaving ? "Saving..." : `Add Travel Info${selectedParticipants.length > 1 ? ` (${selectedParticipants.length})` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditTravelDialog({
  travel,
  onEdit,
  onDelete,
  isSaving,
}: {
  travel: TravelInfo
  onEdit: (id: string, data: Partial<TravelInfo>) => void
  onDelete: (id: string) => void
  isSaving: boolean
}) {
  const [open, setOpen] = useState(false)
  const arrivalDate = new Date(travel.arrival_datetime)
  const departureDate = new Date(travel.departure_datetime)

  const [formData, setFormData] = useState({
    arrival_date: arrivalDate.toISOString().split('T')[0],
    arrival_time: arrivalDate.toTimeString().slice(0, 5),
    departure_date: departureDate.toISOString().split('T')[0],
    departure_time: departureDate.toTimeString().slice(0, 5),
    flight_number: travel.flight_number || "",
    airline: travel.airline || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(travel.id, {
      arrival_datetime: `${formData.arrival_date}T${formData.arrival_time}:00`,
      departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
      flight_number: formData.flight_number || undefined,
      airline: formData.airline || undefined,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Travel Information</DialogTitle>
          <DialogDescription>Update travel information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arrival Date *</Label>
              <Input
                type="date"
                required
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Arrival Time *</Label>
              <Input
                type="time"
                required
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date *</Label>
              <Input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Departure Time *</Label>
              <Input
                type="time"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Flight Number</Label>
              <Input
                placeholder="QB584"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Airline</Label>
              <Input
                placeholder="Uzbekistan Airways"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(travel.id)
                setOpen(false)
              }}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
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
