"use client"

import { getErrorMessage } from "@/lib/error-utils"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, InfoIcon, Loader2, CheckCircle2, Mail, AlertCircle, RefreshCw } from "lucide-react"
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
        invitationsService.getAllInvitations()
      ])
      setParticipants(participantsData)

      const invitationMap: Record<string, InvitationLetter> = {}
      invitationsData.forEach(inv => {
        invitationMap[inv.participant] = inv
      })
      setInvitations(invitationMap)
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to fetch data:", err)
      const message = getErrorMessage(err, "Failed to load data. Please try again.");
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateInvitation = async (participantId: string, force: boolean = false) => {
    try {
      setGeneratingFor(participantId)
      await invitationsService.requestInvitation(participantId, force)

      // Poll for status updates until generation completes
      const maxAttempts = 30 // 30 seconds max
      let attempts = 0

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        const invitationsData = await invitationsService.getAllInvitations()
        const invitation = invitationsData.find(inv => inv.participant === participantId)

        if (invitation && (invitation.status === "GENERATED" || invitation.status === "FAILED")) {
          // Update the invitations state
          const invitationMap: Record<string, InvitationLetter> = {}
          invitationsData.forEach(inv => {
            invitationMap[inv.participant] = inv
          })
          setInvitations(invitationMap)
          break
        }
        attempts++
      }

      // Final fetch to ensure UI is up to date
      await fetchData()
    } catch (err: unknown) {
      console.error("Failed to generate invitation:", err)
      const message = getErrorMessage(err, "Failed to generate invitation letter. Please try again.");
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
      const message = getErrorMessage(err, "Failed to download invitation letter. Please try again.");
      setError(message)
    }
  }

  if (isLoading) {
    return <Loading message="Loading invitations..." />
  }

  const generatedCount = Object.values(invitations).filter(inv => inv.status === "GENERATED").length

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
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invitation Letters for {countryName}</h1>
              <p className="text-white/70 mt-1">Download your invitation letter here.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-2xl font-bold">{participants.length}</span>
              <span className="text-white/70 ml-2 text-sm">Total Participants</span>
            </div>
            <div className="px-4 py-2 bg-[#00795d]/30 rounded-lg backdrop-blur-sm border border-[#00795d]/30 transition-all hover:bg-[#00795d]/50 hover:scale-105">
              <span className="text-xl font-semibold">{generatedCount}</span>
              <span className="text-white/70 ml-2 text-sm">Letters Generated</span>
            </div>
            {participants.length > generatedCount && (
              <div className="px-4 py-2 bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-500/20 transition-all hover:bg-yellow-500/40 hover:scale-105">
                <span className="text-xl font-semibold">{participants.length - generatedCount}</span>
                <span className="text-white/70 ml-2 text-sm">Pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Alert className="bg-gradient-to-r from-[#00795d]/10 to-[#00795d]/5 border-[#00795d]/30">
        <InfoIcon className="h-4 w-4 text-[#00795d]" />
        <AlertDescription className="text-[#00795d]">
          <p className="font-semibold mb-1">Invitation letters are generated based on participant information.</p>
          <p>Each letter is distributed based on the participant's passport number. Please ensure all details are correct before generating.</p>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Members in your delegation</h2>
              <p className="text-sm text-gray-500">{participants.length} participants</p>
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-[#2f3090]/50" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No participants registered yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Add participants first to generate invitation letters.
            </p>
            <Button className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d]" asChild>
              <a href="/team">Add Participants First</a>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Position</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Passport No</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Gender</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Date of Birth</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => {
                  const role = mapRoleToFrontend(participant.role)
                  const invitation = invitations[participant.id]
                  const isGenerating = generatingFor === participant.id

                  // Check if participant was updated after invitation was generated
                  const needsRegeneration = invitation?.status === "GENERATED" &&
                    invitation.generated_at &&
                    new Date(participant.updated_at) > new Date(invitation.generated_at)

                  return (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#2f3090]/5 hover:to-[#00795d]/5 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <Badge
                          className={`font-medium text-xs transition-all duration-200 group-hover:scale-105 ${
                            role === "Team Leader"
                              ? "bg-[#2f3090] text-white"
                              : role === "Contestant"
                                ? "bg-[#00795d] text-white"
                                : role === "Observer"
                                  ? "bg-purple-600 text-white"
                                  : "bg-orange-500 text-white"
                          }`}
                        >
                          {role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{participant.full_name}</td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {participant.passport_number}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{mapGenderToFrontend(participant.gender)}</td>
                      <td className="py-4 px-4 text-gray-600">{new Date(participant.date_of_birth).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        {invitation ? (
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={`text-xs w-fit ${
                                needsRegeneration
                                  ? "bg-amber-500 text-white"
                                  : invitation.status === "GENERATED"
                                    ? "bg-[#00795d] text-white"
                                    : invitation.status === "GENERATING"
                                      ? "bg-yellow-500 text-white"
                                      : invitation.status === "FAILED"
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-500 text-white"
                              }`}
                            >
                              {invitation.status === "GENERATED" && !needsRegeneration && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {needsRegeneration ? "Needs Update" : invitation.status}
                            </Badge>
                            {needsRegeneration && (
                              <span className="text-xs text-amber-600">Info changed</span>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-gray-200 text-gray-600 text-xs">
                            Not Generated
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {invitation?.status === "GENERATED" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 group-hover:scale-105 transition-all"
                              onClick={() => handleDownloadInvitation(invitation.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            {needsRegeneration && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all"
                                onClick={() => handleGenerateInvitation(participant.id, true)}
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Regenerating...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] transition-all"
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

      <Card className="p-6 shadow-lg border-0 bg-gradient-to-r from-[#2f3090]/5 to-[#00795d]/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
            <InfoIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-800">About Invitation Letters</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f3090]"></span>
            Invitation letters are generated based on participant information
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f3090]"></span>
            Each letter includes: full name, role, passport number, date of birth, and country
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f3090]"></span>
            Letters are used for visa applications
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f3090]"></span>
            PDFs can be regenerated if participant information changes
          </li>
        </ul>
      </Card>
    </div>
  )
}
