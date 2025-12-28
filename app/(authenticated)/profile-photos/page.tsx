import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"

export default function ProfilePhotosPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Profile Photos</h1>
        </div>
        <p className="text-teal-50">Upload passport-style photos for all delegation members.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Delegation Members</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDelegation.participants.map((participant, index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-3xl font-medium text-gray-400">
                    {participant.firstName[0]}
                    {participant.lastName[0]}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">
                  {participant.firstName} {participant.lastName}
                </h3>
                <Badge
                  variant="secondary"
                  className={
                    participant.role === "Team Leader"
                      ? "bg-red-100 text-red-700 mb-3"
                      : participant.role === "Deputy Leader"
                        ? "bg-pink-100 text-pink-700 mb-3"
                        : participant.role === "Contestant"
                          ? "bg-green-100 text-green-700 mb-3"
                          : participant.role === "IC Member"
                            ? "bg-purple-100 text-purple-700 mb-3"
                            : participant.role === "ISC Member"
                              ? "bg-blue-100 text-blue-700 mb-3"
                              : participant.role === "ITC Member"
                                ? "bg-blue-100 text-blue-700 mb-3"
                                : "bg-orange-100 text-orange-700 mb-3"
                  }
                >
                  {participant.role}
                </Badge>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Photo Requirements</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Passport-style photo (white or light background)</li>
          <li>• Recent photo (taken within last 6 months)</li>
          <li>• Face clearly visible, looking directly at camera</li>
          <li>• No sunglasses or head coverings (except for religious purposes)</li>
          <li>• Accepted formats: JPG, PNG</li>
          <li>• Minimum resolution: 600x600 pixels</li>
          <li>• Maximum file size: 2MB</li>
        </ul>
      </Card>
    </div>
  )
}
