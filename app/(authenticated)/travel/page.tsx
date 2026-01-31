"use client"

import { getErrorMessage } from "@/lib/error-utils"

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
import { Plus, Edit, Plane, Calendar, Clock, X, AlertCircle, PlaneTakeoff, PlaneLanding, Sparkles, Globe } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { travelService } from "@/lib/services/travel"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import type { TravelInfo, Participant } from "@/lib/types"
import { mapRoleToFrontend } from "@/lib/types"

// Common UTC timezone offsets
const TIMEZONE_OPTIONS = [
  "UTC-12", "UTC-11", "UTC-10", "UTC-9", "UTC-8", "UTC-7", "UTC-6", "UTC-5",
  "UTC-4", "UTC-3", "UTC-2", "UTC-1", "UTC+0", "UTC+1", "UTC+2", "UTC+3",
  "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9", "UTC+10", "UTC+11", "UTC+12"
]

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
    } catch (err: unknown) {
      console.error("Failed to fetch data:", err)
      setError(getErrorMessage(err, "Failed to load data"))
    } finally {
      setIsLoading(false)
    }
  }

  const participantsWithTravel = new Set(travelInfos.map(t => t.participant))
  const missingTravel = participants.filter(p => !participantsWithTravel.has(p.id))

  const handleAddTravel = async (participantIds: string[], data: { arrival_datetime: string; arrival_timezone?: string; departure_datetime: string; departure_timezone?: string; flight_number?: string; airline?: string }) => {
    try {
      setIsSaving(true)
      await Promise.all(
        participantIds.map(participantId =>
          travelService.createTravelInfo({
            participant_id: participantId,
            ...data
          })
        )
      )
      await fetchData()
    } catch (err: unknown) {
      console.error("Failed to add travel info:", err)
      setError(getErrorMessage(err, "Failed to add travel information"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTravel = async (id: string, data: Partial<TravelInfo>) => {
    try {
      setIsSaving(true)
      await travelService.updateTravelInfo(id, data)
      await fetchData()
    } catch (err: unknown) {
      console.error("Failed to update travel info:", err)
      setError(getErrorMessage(err, "Failed to update travel information"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTravel = async (id: string) => {
    try {
      setIsSaving(true)
      await travelService.deleteTravelInfo(id)
      await fetchData()
    } catch (err: unknown) {
      console.error("Failed to delete travel info:", err)
      setError(getErrorMessage(err, "Failed to delete travel information"))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading message="Loading travel information..." />
  }

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
              <Plane className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Travel Schedule for {countryName}</h1>
              <p className="text-white/70 mt-1">Please edit the arrival and departure schedule for your delegation.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-2xl font-bold">{travelInfos.length}</span>
              <span className="text-white/70 ml-2 text-sm">Travel Records</span>
            </div>
            <div className="px-4 py-2 bg-[#00795d]/30 rounded-lg backdrop-blur-sm border border-[#00795d]/30 transition-all hover:bg-[#00795d]/50 hover:scale-105">
              <span className="text-xl font-semibold">{participants.length}</span>
              <span className="text-white/70 ml-2 text-sm">Participants</span>
            </div>
            {missingTravel.length > 0 && (
              <div className="px-4 py-2 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-500/20 transition-all hover:bg-red-500/40 hover:scale-105">
                <span className="text-xl font-semibold">{missingTravel.length}</span>
                <span className="text-white/70 ml-2 text-sm">Missing Info</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {missingTravel.length > 0 && (
        <Alert variant="destructive" className="bg-gradient-to-r from-red-50 to-red-50/50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold mb-2">The following participants have missing travel information:</p>
            <div className="flex flex-wrap gap-2">
              {missingTravel.map((person) => (
                <span key={person.id} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg text-sm">
                  {person.full_name}
                  <Badge variant="secondary" className="bg-red-200 text-red-700 text-xs ml-1">
                    {mapRoleToFrontend(person.role)}
                  </Badge>
                </span>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Travel Information</h2>
              <p className="text-sm text-gray-500">{travelInfos.length} travel records</p>
            </div>
          </div>
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
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
              <Plane className="w-10 h-10 text-[#2f3090]/50" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No participants registered yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Add participants first before adding travel information.
            </p>
            <Button className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]" asChild>
              <a href="/team">Add Participants First</a>
            </Button>
          </div>
        ) : travelInfos.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
              <Plane className="w-10 h-10 text-[#2f3090]/50" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No travel information added yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Click "Add Travel Info" to add arrival and departure details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Participant</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <PlaneLanding className="w-4 h-4" /> Arrival
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <PlaneTakeoff className="w-4 h-4" /> Departure
                    </span>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Flight</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Airline</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {travelInfos.map((travel, index) => {
                  const participant = participants.find(p => p.id === travel.participant)
                  if (!participant) return null

                  const role = mapRoleToFrontend(participant.role)

                  return (
                    <tr
                      key={travel.id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#2f3090]/5 hover:to-[#00795d]/5 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{participant.full_name}</p>
                          <Badge
                            className={`font-medium text-xs mt-1 ${
                              role === "Mentor"
                                ? "bg-[#2f3090] text-white"
                                : role === "Student"
                                  ? "bg-[#00795d] text-white"
                                  : role === "Observer"
                                    ? "bg-purple-600 text-white"
                                    : "bg-orange-500 text-white"
                            }`}
                          >
                            {role}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <PlaneLanding className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{new Date(travel.arrival_datetime).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(travel.arrival_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {travel.arrival_timezone && (
                                <span className="ml-1 text-[#2f3090] font-medium">({travel.arrival_timezone})</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <PlaneTakeoff className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{new Date(travel.departure_datetime).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(travel.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {travel.departure_timezone && (
                                <span className="ml-1 text-[#2f3090] font-medium">({travel.departure_timezone})</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {travel.flight_number ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                            {travel.flight_number}
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{travel.airline || '-'}</td>
                      <td className="py-4 px-4">
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
  onAdd: (participantIds: string[], data: { arrival_datetime: string; arrival_timezone?: string; departure_datetime: string; departure_timezone?: string; flight_number?: string; airline?: string }) => void
  isSaving: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [formData, setFormData] = useState({
    arrival_date: "",
    arrival_time: "",
    arrival_timezone: "",
    departure_date: "",
    departure_time: "",
    departure_timezone: "",
    flight_number: "",
    airline: "",
  })

  const availableParticipants = participants.filter(p => !existingTravelParticipants.has(p.id))

  // Validate arrival is before departure
  const getDateTimeError = (): string | null => {
    if (formData.arrival_date && formData.arrival_time && formData.departure_date && formData.departure_time) {
      const arrival = new Date(`${formData.arrival_date}T${formData.arrival_time}`)
      const departure = new Date(`${formData.departure_date}T${formData.departure_time}`)
      if (arrival >= departure) {
        return 'Arrival must be before departure'
      }
    }
    return null
  }

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
      arrival_timezone: formData.arrival_timezone || undefined,
      departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
      departure_timezone: formData.departure_timezone || undefined,
      flight_number: formData.flight_number || undefined,
      airline: formData.airline || undefined,
    })
    setFormData({
      arrival_date: "",
      arrival_time: "",
      arrival_timezone: "",
      departure_date: "",
      departure_time: "",
      departure_timezone: "",
      flight_number: "",
      airline: "",
    })
    setSelectedParticipants([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          disabled={availableParticipants.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Travel Info
          <Sparkles className="w-4 h-4 ml-2 opacity-70" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-xl text-white">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add Travel Information</DialogTitle>
              <DialogDescription>Select participants with the same travel schedule to add their information at once.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium">Select Participants *</Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7 text-[#2f3090]">
                  Select All
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7 text-gray-500">
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
              {availableParticipants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  All participants already have travel information
                </p>
              ) : (
                availableParticipants.map((p) => {
                  const role = mapRoleToFrontend(p.role)
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedParticipants.includes(p.id)}
                        onCheckedChange={() => toggleParticipant(p.id)}
                      />
                      <span className="flex-1 text-gray-700">{p.full_name}</span>
                      <Badge
                        className={`text-xs ${
                          role === "Mentor"
                            ? "bg-[#2f3090] text-white"
                            : role === "Student"
                              ? "bg-[#00795d] text-white"
                              : role === "Observer"
                                ? "bg-purple-600 text-white"
                                : "bg-orange-500 text-white"
                        }`}
                      >
                        {role}
                      </Badge>
                    </label>
                  )
                })
              )}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-sm text-[#2f3090]">
                {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Arrival Date *</Label>
              <Input
                type="date"
                required
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Arrival Time *</Label>
              <Input
                type="time"
                required
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Timezone</Label>
              <Select
                value={formData.arrival_timezone}
                onValueChange={(value) => setFormData({ ...formData, arrival_timezone: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 w-full">
                  <Globe className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Departure Date *</Label>
              <Input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Departure Time *</Label>
              <Input
                type="time"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Timezone</Label>
              <Select
                value={formData.departure_timezone}
                onValueChange={(value) => setFormData({ ...formData, departure_timezone: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 w-full">
                  <Globe className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Flight Number</Label>
              <Input
                placeholder="QB584"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Airline</Label>
              <Input
                placeholder="Uzbekistan Airways"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
          </div>

          {getDateTimeError() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{getDateTimeError()}</p>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]"
              disabled={isSaving || selectedParticipants.length === 0 || !!getDateTimeError()}
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
    arrival_timezone: travel.arrival_timezone || "",
    departure_date: departureDate.toISOString().split('T')[0],
    departure_time: departureDate.toTimeString().slice(0, 5),
    departure_timezone: travel.departure_timezone || "",
    flight_number: travel.flight_number || "",
    airline: travel.airline || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(travel.id, {
      arrival_datetime: `${formData.arrival_date}T${formData.arrival_time}:00`,
      arrival_timezone: formData.arrival_timezone || undefined,
      departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`,
      departure_timezone: formData.departure_timezone || undefined,
      flight_number: formData.flight_number || undefined,
      airline: formData.airline || undefined,
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
      <DialogContent className="w-[95vw] max-w-4xl overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-xl text-white">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Travel Information</DialogTitle>
              <DialogDescription>Update travel information.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Arrival Date *</Label>
              <Input
                type="date"
                required
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Arrival Time *</Label>
              <Input
                type="time"
                required
                value={formData.arrival_time}
                onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Timezone</Label>
              <Select
                value={formData.arrival_timezone}
                onValueChange={(value) => setFormData({ ...formData, arrival_timezone: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 w-full">
                  <Globe className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Departure Date *</Label>
              <Input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Departure Time *</Label>
              <Input
                type="time"
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Timezone</Label>
              <Select
                value={formData.departure_timezone}
                onValueChange={(value) => setFormData({ ...formData, departure_timezone: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 w-full">
                  <Globe className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Flight Number</Label>
              <Input
                placeholder="QB584"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Airline</Label>
              <Input
                placeholder="Uzbekistan Airways"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="border-gray-200 focus:border-[#2f3090] focus:ring-[#2f3090]/20"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(travel.id)
                setOpen(false)
              }}
              disabled={isSaving}
              className="hover:bg-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
