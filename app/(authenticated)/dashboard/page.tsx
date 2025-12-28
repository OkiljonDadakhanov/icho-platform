"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Edit } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Participant } from "@/lib/types"
import { mapRoleToFrontend, mapGenderToFrontend, mapTshirtToFrontend } from "@/lib/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"
  const countryCode = user?.country?.iso_code?.toLowerCase() || "un"

  useEffect(() => {
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

    fetchParticipants()
  }, [])

  if (isLoading) {
    return <Loading message="Loading dashboard..." />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{countryName}</h1>
        </div>
        <p className="text-white/80">Please use this site to fill out the details for your delegation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <img
              src={`https://flagcdn.com/w40/${countryCode}.png`}
              alt={`${countryName} flag`}
              className="w-6 h-4"
            />
            <h2 className="text-lg font-semibold">Delegation Info</h2>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto bg-transparent border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">The following information may be published or shared by us.</p>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Country:</span> {countryName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a href={`mailto:${user?.email}`} className="text-[#2f3090] hover:underline">
                    {user?.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-muted-foreground mb-1">
                Contact information for your delegation.
              </p>
              <p>
                <span className="font-medium">Registered Participants:</span> {participants.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">My account</h2>
          <div className="space-y-2 text-sm mb-4">
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Account Status:</span>{" "}
              <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
                {user?.is_active ? "Active" : "Inactive"}
              </Badge>
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-4 text-lg">Timeline</h3>
            <div className="w-full">
              <img
                src="/timeline.jpg"
                alt="Timeline"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <img
            src={`https://flagcdn.com/w40/${countryCode}.png`}
            alt={`${countryName} flag`}
            className="w-6 h-4"
          />
          <h2 className="text-lg font-semibold">Participants</h2>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No participants registered yet.</p>
            <Button className="mt-4 bg-[#2f3090] hover:bg-[#4547a9]" asChild>
              <a href="/team">Add Participants</a>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Person</th>
                  <th className="text-left py-2 font-medium">Gender</th>
                  <th className="text-left py-2 font-medium">T-shirt</th>
                </tr>
              </thead>
              <tbody>
                {participants.slice(0, 4).map((participant) => {
                  const role = mapRoleToFrontend(participant.role)
                  const nameParts = participant.full_name.split(' ')
                  const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                    : participant.full_name.substring(0, 2).toUpperCase()

                  return (
                    <tr key={participant.id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium">{participant.full_name}</p>
                            <Badge
                              variant="secondary"
                              className={
                                role === "Team Leader"
                                  ? "bg-[#2f3090]/10 text-[#2f3090]"
                                  : role === "Contestant"
                                    ? "bg-[#00795d]/10 text-[#00795d]"
                                    : "bg-gray-100 text-gray-700"
                              }
                            >
                              {role}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-3">{mapTshirtToFrontend(participant.tshirt_size)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {participants.length > 4 && (
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <a href="/team">View all {participants.length} participants</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
