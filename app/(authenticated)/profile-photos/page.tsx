"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { Participant } from "@/lib/types"
import { mapRoleToFrontend } from "@/lib/types"

export default function ProfilePhotosPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      setIsLoading(true)
      const data = await participantsService.getAllParticipants()
      setParticipants(data)
      setError(null)
    } catch (err: any) {
      console.error("Failed to fetch participants:", err)
      setError(err?.message || "Failed to load participants")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (participantId: string, file: File) => {
    try {
      setUploadingFor(participantId)
      await participantsService.uploadProfilePhoto(participantId, file)
      await fetchParticipants()
      setError(null)
    } catch (err: any) {
      console.error("Failed to upload photo:", err)
      setError(err?.message || "Failed to upload photo")
    } finally {
      setUploadingFor(null)
    }
  }

  if (isLoading) {
    return <Loading message="Loading participants..." />
  }

  if (error && participants.length === 0) {
    return <ErrorDisplay message={error} />
  }

  const participantsWithPhoto = participants.filter(p => p.profile_photo)
  const participantsWithoutPhoto = participants.filter(p => !p.profile_photo)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Profile Photos</h1>
        </div>
        <p className="text-white/80">Upload passport-style photos for all delegation members.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {participantsWithoutPhoto.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {participantsWithoutPhoto.length} participant(s) are missing profile photos.
          </AlertDescription>
        </Alert>
      )}

      {participantsWithPhoto.length === participants.length && participants.length > 0 && (
        <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
          <CheckCircle2 className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            All participants have uploaded their profile photos.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Delegation Members ({participants.length})</h2>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No participants registered yet.</p>
            <Button className="mt-4" variant="outline" asChild>
              <a href="/team">Add Participants First</a>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => {
              const role = mapRoleToFrontend(participant.role)
              const nameParts = participant.full_name.split(' ')
              const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                : participant.full_name.substring(0, 2).toUpperCase()
              const isUploading = uploadingFor === participant.id

              return (
                <Card key={participant.id} className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-32 h-32 mb-4">
                      <AvatarImage src={participant.profile_photo} />
                      <AvatarFallback className="text-3xl font-medium text-gray-400 bg-gray-200">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{participant.full_name}</h3>
                    <Badge
                      variant="secondary"
                      className={
                        role === "Mentor"
                          ? "bg-[#2f3090]/10 text-[#2f3090] mb-3"
                          : role === "Student"
                            ? "bg-[#00795d]/10 text-[#00795d] mb-3"
                            : role === "Observer"
                              ? "bg-purple-100 text-purple-700 mb-3"
                              : "bg-orange-100 text-orange-700 mb-3"
                      }
                    >
                      {role}
                    </Badge>

                    {participant.profile_photo ? (
                      <div className="flex items-center gap-2 text-[#00795d] text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Photo uploaded
                      </div>
                    ) : null}

                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handlePhotoUpload(participant.id, file)
                        }
                      }}
                      className="hidden"
                      id={`photo-upload-${participant.id}`}
                      disabled={isUploading}
                    />
                    <label htmlFor={`photo-upload-${participant.id}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : participant.profile_photo ? "Replace Photo" : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-4">Photo Requirements</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Passport-style photo (white or light background)</li>
          <li>Recent photo (taken within last 6 months)</li>
          <li>Face clearly visible, looking directly at camera</li>
          <li>No sunglasses or head coverings (except for religious purposes)</li>
          <li>Accepted formats: JPG, PNG</li>
          <li>Minimum resolution: 600x600 pixels</li>
          <li>Maximum file size: 2MB</li>
        </ul>
      </Card>
    </div>
  )
}
