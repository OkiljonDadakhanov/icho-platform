"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, InfoIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { invitationsService } from "@/lib/services/invitations"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import type { InvitationLetter, Participant } from "@/lib/types"
import { mapRoleToFrontend, mapGenderToFrontend } from "@/lib/types"

export default function InvitationsPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [invitations, setInvitations] = useState<Record<string, InvitationLetter>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [participantsData, invitationsData] = await Promise.all([
        participantsService.getAllParticipants(),
        invitationsService.getInvitations()
      ])
      setParticipants(participantsData)

      // Create a map of participant ID to invitation
      const invitationMap: Record<string, InvitationLetter> = {}
      invitationsData.forEach(inv => {
        invitationMap[inv.participant] = inv
      })
      setInvitations(invitationMap)
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to fetch data:", err)
      const message = (err as { message?: string })?.message || "Failed to load data. Please try again.";
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateInvitation = async (participantId: string) => {
    try {
      setGeneratingFor(participantId)
      await invitationsService.generateInvitation(participantId)
      await fetchData()
    } catch (err: unknown) {
      console.error("Failed to generate invitation:", err)
      const message = (err as { message?: string })?.message || "Failed to generate invitation letter. Please try again.";
      setError(message)
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleDownloadInvitation = async (invitationId: string) => {
    try {
      const blob = await invitationsService.downloadInvitation(invitationId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invitation_${invitationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      console.error("Failed to download invitation:", err)
      const message = (err as { message?: string })?.message || "Failed to download invitation letter. Please try again.";
      setError(message)
    }
  }

  if (isLoading) {
    return <Loading message="Loading invitations..." />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Invitation letters for {countryName}</h1>
        </div>
        <p className="text-white/80">Download your invitation letter here.</p>
      </div>

      <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
        <InfoIcon className="h-4 w-4 text-[#00795d]" />
        <AlertDescription className="text-[#00795d]">
          <p className="font-semibold mb-1">Invitation letters are generated based on participant information.</p>
          <p>Each letter is distributed based on the participant's passport number. Please ensure all details are correct before generating.</p>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Members in your delegation ({participants.length})</h2>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No participants registered yet.</p>
            <Button className="mt-4" variant="outline" asChild>
              <a href="/team">Add Participants First</a>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Position</th>
                  <th className="text-left py-3 font-medium">Name</th>
                  <th className="text-left py-3 font-medium">Passport No</th>
                  <th className="text-left py-3 font-medium">Gender</th>
                  <th className="text-left py-3 font-medium">Date of Birth</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => {
                  const role = mapRoleToFrontend(participant.role)
                  const invitation = invitations[participant.id]
                  const isGenerating = generatingFor === participant.id

                  return (
                    <tr key={participant.id} className="border-b hover:bg-gray-50">
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
                      <td className="py-4 font-medium">{participant.full_name}</td>
                      <td className="py-4 font-mono text-xs">{participant.passport_number}</td>
                      <td className="py-4">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-4">{new Date(participant.date_of_birth).toLocaleDateString()}</td>
                      <td className="py-4">
                        {invitation ? (
                          <Badge
                            variant="secondary"
                            className={
                              invitation.status === "GENERATED"
                                ? "bg-[#00795d]/10 text-[#00795d]"
                                : invitation.status === "GENERATING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : invitation.status === "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }
                          >
                            {invitation.status}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                            Not Generated
                          </Badge>
                        )}
                      </td>
                      <td className="py-4">
                        {invitation?.status === "GENERATED" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent"
                            onClick={() => handleDownloadInvitation(invitation.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent"
                            onClick={() => handleGenerateInvitation(participant.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
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

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-2">About Invitation Letters</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Invitation letters are generated based on participant information</li>
          <li>Each letter includes: full name, role, passport number, date of birth, and country</li>
          <li>Letters are used for visa applications</li>
          <li>PDFs can be regenerated if participant information changes</li>
        </ul>
      </Card>
    </div>
  )
}
