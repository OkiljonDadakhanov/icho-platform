"use client"

import { getErrorMessage } from "@/lib/error-utils"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Edit, UsersRound, CreditCard, Plane } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Participant } from "@/lib/types"
import { mapRoleToFrontend, mapGenderToFrontend, mapTshirtToFrontend } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Timeline } from "@/components/timeline"

export default function DashboardPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"
  const countryCode = user?.country?.iso_code?.toLowerCase().slice(0, 2) || "un"

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true)
        const data = await participantsService.getAllParticipants()
        setParticipants(data)
        setError(null)
      } catch (err: unknown) {
        console.error("Failed to fetch participants:", err)
        setError(getErrorMessage(err, "Failed to load participants"))
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
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{countryName} Team</h1>
              <p className="text-white/70 mt-1">Please use this site to fill out the details for your delegation.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-2xl font-bold">{participants.length}</span>
              <span className="text-white/70 ml-2 text-sm">Total Members</span>
            </div>
            <div className="px-4 py-2 bg-[#2f3090]/30 rounded-lg backdrop-blur-sm border border-[#2f3090]/30 transition-all hover:bg-[#2f3090]/50 hover:scale-105">
              <span className="text-xl font-semibold">{teamLeaders}</span>
              <span className="text-white/70 ml-2 text-sm">Mentors</span>
            </div>
            <div className="px-4 py-2 bg-[#00795d]/30 rounded-lg backdrop-blur-sm border border-[#00795d]/30 transition-all hover:bg-[#00795d]/50 hover:scale-105">
              <span className="text-xl font-semibold">{contestants}</span>
              <span className="text-white/70 ml-2 text-sm">Students</span>
            </div>
            <div className="px-4 py-2 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/20 transition-all hover:bg-purple-500/40 hover:scale-105">
              <span className="text-xl font-semibold">{observers}</span>
              <span className="text-white/70 ml-2 text-sm">Observers</span>
            </div>
            <div className="px-4 py-2 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/20 transition-all hover:bg-orange-500/40 hover:scale-105">
              <span className="text-xl font-semibold">{guests}</span>
              <span className="text-white/70 ml-2 text-sm">Guests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
                <img
                  src={`https://flagcdn.com/w40/${countryCode}.png`}
                  alt=""
                  className="w-5 h-4 object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Delegation Info</h2>
                <p className="text-sm text-gray-500">Public information</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10"
              asChild
            >
              <a href="/pre-registration">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </a>
            </Button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gradient-to-r from-[#2f3090]/5 to-[#00795d]/5 rounded-lg border border-[#2f3090]/10">
              <p className="text-gray-500 text-xs mb-2">The following information may be published or shared by us.</p>
              <p className="font-medium text-gray-800">{countryName}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs mb-2">Contact information for your delegation.</p>
              <p className="font-medium text-gray-800">
                <span className="text-gray-600">Registered Participants:</span> {participants.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <UsersRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">My Account</h2>
              <p className="text-sm text-gray-500">Account status and timeline</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gradient-to-r from-[#00795d]/5 to-[#00795d]/10 rounded-lg border border-[#00795d]/20">
              <p className="text-gray-500 text-xs mb-1">Account Status</p>
              <Badge className="bg-[#00795d] text-white">
                {user?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <Timeline />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <UsersRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Participants</h2>
              <p className="text-sm text-gray-500">{participants.length} members registered</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
            <a href="/team">View All</a>
          </Button>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
              <UsersRound className="w-10 h-10 text-[#2f3090]/50" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No participants registered yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Start building your delegation by adding team members.
            </p>
            <Button className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]" asChild>
              <a href="/team">Add Participants</a>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Person</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Gender</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">T-shirt</th>
                </tr>
              </thead>
              <tbody>
                {participants.slice(0, 4).map((participant, index) => {
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
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                            <AvatarImage src={participant.profile_photo} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-800">{participant.full_name}</p>
                            <Badge
                              className={`font-medium text-xs transition-all duration-200 group-hover:scale-105 ${
                                role === "Mentor"
                                  ? "bg-[#2f3090] text-white hover:bg-[#2f3090]/90"
                                  : role === "Student"
                                    ? "bg-[#00795d] text-white hover:bg-[#00795d]/90"
                                    : role === "Observer"
                                      ? "bg-purple-600 text-white hover:bg-purple-500"
                                      : "bg-orange-500 text-white hover:bg-orange-400"
                              }`}
                            >
                              {role}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {mapTshirtToFrontend(participant.tshirt_size)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {participants.length > 4 && (
              <div className="p-4 text-center bg-gray-50/50">
                <Button variant="outline" className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10" asChild>
                  <a href="/team">View all {participants.length} participants</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/payment" className="group">
          <Card className="p-4 shadow-md border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Payment</h3>
                <p className="text-sm text-gray-500">Invoice & payment proof</p>
              </div>
            </div>
          </Card>
        </a>
        <a href="/travel" className="group">
          <Card className="p-4 shadow-md border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white group-hover:scale-110 transition-transform">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Travel</h3>
                <p className="text-sm text-gray-500">Arrival & departure info</p>
              </div>
            </div>
          </Card>
        </a>
      </div>
    </div>
  )
}
