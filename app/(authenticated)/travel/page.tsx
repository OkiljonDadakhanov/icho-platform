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
import { Plus, Edit, Plane, Calendar, Clock, X } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"

type TravelInfo = {
  date: string
  time: string
  location: string
  flight: string
  members: string[]
}

export default function TravelPage() {
  const [arrivals, setArrivals] = useState<TravelInfo[]>([
    {
      date: "25 Jul 2025",
      time: "17:10",
      location: "Sucre Airport (SRE)",
      flight: "QB584",
      members: [
        "Sunatullo Khojiev",
        "Davron Tukhtaev",
        "Sunnatov Asilbek",
        "Ulug'bek Rakhmatulaev",
        "Salimov Sardor",
        "Timur Kadirbergenov",
      ],
    },
  ])

  const [departures, setDepartures] = useState<TravelInfo[]>([
    {
      date: "04 Aug 2025",
      time: "15:00",
      location: "Sucre Airport (SRE)",
      flight: "QB583",
      members: ["Sunatullo Khojiev"],
    },
  ])

  const allParticipants = mockDelegation.participants.map((p) => `${p.firstName} ${p.lastName}`)

  const missingTravel = mockDelegation.participants.filter(
    (p) =>
      !arrivals.some((a) => a.members.includes(`${p.firstName} ${p.lastName}`)) &&
      !departures.some((d) => d.members.includes(`${p.firstName} ${p.lastName}`))
  )

  const handleAddArrival = (data: TravelInfo) => {
    setArrivals([...arrivals, data])
  }

  const handleEditArrival = (index: number, data: TravelInfo) => {
    const updated = [...arrivals]
    updated[index] = data
    setArrivals(updated)
  }

  const handleDeleteArrival = (index: number) => {
    setArrivals(arrivals.filter((_, i) => i !== index))
  }

  const handleAddDeparture = (data: TravelInfo) => {
    setDepartures([...departures, data])
  }

  const handleEditDeparture = (index: number, data: TravelInfo) => {
    const updated = [...departures]
    updated[index] = data
    setDepartures(updated)
  }

  const handleDeleteDeparture = (index: number) => {
    setDepartures(departures.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Plane className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Travel Schedule for Uzbekistan</h1>
        </div>
        <p className="text-white/80">Please edit the arrival and departure schedule for your delegation.</p>
      </div>

      {missingTravel.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <p className="font-semibold mb-2">The following people have missing travel information:</p>
            <div className="space-y-1">
              {missingTravel.map((person, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>
                    {person.firstName} {person.lastName}
                  </span>
                  <Badge
                    variant="secondary"
                    className={person.role === "Guest" ? "bg-orange-100 text-orange-700" : "bg-gray-100"}
                  >
                    {person.role}
                  </Badge>
                  <span className="text-red-600 text-sm">missing arrival & departure</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Arrivals</h2>
          <AddTravelDialog
            type="arrival"
            participants={allParticipants}
            onAdd={handleAddArrival}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">Location</th>
                <th className="text-left py-3 font-medium">Flight</th>
                <th className="text-left py-3 font-medium">Members in Group</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {arrivals.map((arrival, index) => {
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{arrival.date}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {arrival.time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{arrival.location}</td>
                    <td className="py-4">{arrival.flight}</td>
                    <td className="py-4">
                      <div className="space-y-1">
                        {arrival.members.map((member, idx) => {
                          const participant = mockDelegation.participants.find(
                            (p) => `${p.firstName} ${p.lastName}` === member
                          )
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm">{member}</span>
                              {participant && (
                                <Badge
                                  variant="secondary"
                                  className={
                                    participant.role === "Team Leader"
                                      ? "bg-[#2f3090]/10 text-[#2f3090] text-xs"
                                      : participant.role === "Deputy Leader"
                                        ? "bg-[#4547a9]/10 text-[#4547a9] text-xs"
                                        : participant.role === "Contestant"
                                          ? "bg-[#00795d]/10 text-[#00795d] text-xs"
                                          : participant.role === "Guest"
                                            ? "bg-orange-100 text-orange-700 text-xs"
                                            : "bg-gray-100 text-xs"
                                  }
                                >
                                  {participant.role}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="py-4">
                      <EditTravelDialog
                        type="arrival"
                        travelInfo={arrival}
                        index={index}
                        participants={allParticipants}
                        onEdit={handleEditArrival}
                        onDelete={handleDeleteArrival}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Departures</h2>
          <AddTravelDialog
            type="departure"
            participants={allParticipants}
            onAdd={handleAddDeparture}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">Location</th>
                <th className="text-left py-3 font-medium">Flight</th>
                <th className="text-left py-3 font-medium">Members in Group</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departures.map((departure, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{departure.date}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {departure.time}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">{departure.location}</td>
                  <td className="py-4">{departure.flight}</td>
                  <td className="py-4">
                    <div className="space-y-1">
                      {departure.members.map((member, idx) => {
                        const participant = mockDelegation.participants.find(
                          (p) => `${p.firstName} ${p.lastName}` === member
                        )
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm">{member}</span>
                            {participant && (
                              <Badge
                                variant="secondary"
                                className={
                                  participant.role === "Team Leader"
                                    ? "bg-[#2f3090]/10 text-[#2f3090] text-xs"
                                    : participant.role === "Deputy Leader"
                                      ? "bg-[#4547a9]/10 text-[#4547a9] text-xs"
                                      : participant.role === "Contestant"
                                        ? "bg-[#00795d]/10 text-[#00795d] text-xs"
                                        : participant.role === "IC Member"
                                          ? "bg-purple-100 text-purple-700 text-xs"
                                          : participant.role === "ITC Member"
                                            ? "bg-cyan-100 text-cyan-700 text-xs"
                                            : "bg-gray-100 text-xs"
                                }
                              >
                                {participant.role}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="py-4">
                    <EditTravelDialog
                      type="departure"
                      travelInfo={departure}
                      index={index}
                      participants={allParticipants}
                      onEdit={handleEditDeparture}
                      onDelete={handleDeleteDeparture}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function AddTravelDialog({
  type,
  participants,
  onAdd,
}: {
  type: "arrival" | "departure"
  participants: string[]
  onAdd: (data: TravelInfo) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TravelInfo>({
    date: "",
    time: "",
    location: "",
    flight: "",
    members: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({ date: "", time: "", location: "", flight: "", members: [] })
    setOpen(false)
  }

  const toggleMember = (member: string) => {
    setFormData({
      ...formData,
      members: formData.members.includes(member)
        ? formData.members.filter((m) => m !== member)
        : [...formData.members, member],
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
          <Plus className="w-4 h-4 mr-2" />
          Add {type === "arrival" ? "Arrival" : "Departure"} Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {type === "arrival" ? "Arrival" : "Departure"} Information</DialogTitle>
          <DialogDescription>Add travel information for your delegation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                required
                placeholder="Sucre Airport (SRE)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flight">Flight Number *</Label>
              <Input
                id="flight"
                required
                placeholder="QB584"
                value={formData.flight}
                onChange={(e) => setFormData({ ...formData, flight: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Members *</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {participants.map((member) => (
                  <label key={member} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.members.includes(member)}
                      onChange={() => toggleMember(member)}
                      className="rounded"
                    />
                    <span className="text-sm">{member}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.members.length > 0 && (
              <p className="text-xs text-muted-foreground">{formData.members.length} member(s) selected</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2f3090] hover:bg-[#4547a9]">
              Add {type === "arrival" ? "Arrival" : "Departure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditTravelDialog({
  type,
  travelInfo,
  index,
  participants,
  onEdit,
  onDelete,
}: {
  type: "arrival" | "departure"
  travelInfo: TravelInfo
  index: number
  participants: string[]
  onEdit: (index: number, data: TravelInfo) => void
  onDelete: (index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TravelInfo>(travelInfo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(index, formData)
    setOpen(false)
  }

  const toggleMember = (member: string) => {
    setFormData({
      ...formData,
      members: formData.members.includes(member)
        ? formData.members.filter((m) => m !== member)
        : [...formData.members, member],
    })
  }

  // Convert date format for input
  const formatDateForInput = (dateStr: string) => {
    // If date is in "DD MMM YYYY" format, convert to YYYY-MM-DD
    const parts = dateStr.split(" ")
    if (parts.length === 3) {
      const months: { [key: string]: string } = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      }
      const day = parts[0].padStart(2, "0")
      const month = months[parts[1]] || "01"
      const year = parts[2]
      return `${year}-${month}-${day}`
    }
    return dateStr
  }

  const formatDateFromInput = (dateStr: string) => {
    // Convert YYYY-MM-DD to "DD MMM YYYY"
    const date = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()}`
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
          <DialogTitle>Edit {type === "arrival" ? "Arrival" : "Departure"} Information</DialogTitle>
          <DialogDescription>Update travel information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-date-${index}`}>Date *</Label>
              <Input
                id={`edit-date-${index}`}
                type="date"
                required
                value={formatDateForInput(formData.date)}
                onChange={(e) =>
                  setFormData({ ...formData, date: formatDateFromInput(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-time-${index}`}>Time *</Label>
              <Input
                id={`edit-time-${index}`}
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-location-${index}`}>Location *</Label>
              <Input
                id={`edit-location-${index}`}
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-flight-${index}`}>Flight Number *</Label>
              <Input
                id={`edit-flight-${index}`}
                required
                value={formData.flight}
                onChange={(e) => setFormData({ ...formData, flight: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Members *</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {participants.map((member) => (
                  <label
                    key={member}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(member)}
                      onChange={() => toggleMember(member)}
                      className="rounded"
                    />
                    <span className="text-sm">{member}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.members.length > 0 && (
              <p className="text-xs text-muted-foreground">{formData.members.length} member(s) selected</p>
            )}
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
