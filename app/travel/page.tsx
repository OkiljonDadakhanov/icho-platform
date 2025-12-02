import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Plane, Calendar, Clock } from "lucide-react"
import { mockDelegation, mockTravelInfo } from "@/lib/mock-data"

export default function TravelPage() {
  const missingTravel = mockDelegation.participants.filter(
    (p) =>
      !mockTravelInfo.arrivals.some((a) => a.members.includes(p.firstName + " " + p.lastName)) &&
      !mockTravelInfo.departures.some((d) => d.members.includes(p.firstName + " " + p.lastName)),
  )

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
          <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
            <Plus className="w-4 h-4 mr-2" />
            Add Arrival Information
          </Button>
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
              {mockTravelInfo.arrivals.map((arrival, index) => (
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
                          (p) => `${p.firstName} ${p.lastName}` === member,
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
                    <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Departures</h2>
          <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
            <Plus className="w-4 h-4 mr-2" />
            Add Departure Information
          </Button>
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
              {mockTravelInfo.departures.map((departure, index) => (
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
                          (p) => `${p.firstName} ${p.lastName}` === member,
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
                    <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
                      <Edit className="w-4 h-4" />
                    </Button>
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
