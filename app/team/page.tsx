import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, AlertCircle, UsersRound } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"

export default function TeamPage() {
  const isLocked = false // Set to true to show locked state

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <UsersRound className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Delegation for Uzbekistan</h1>
        </div>
        <p className="text-white/80">Please edit the members of your delegation.</p>
      </div>

      {isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The deadline for editing member details has passed. Please contact the organisers if you still need to make
            edits.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Members in your delegation</h2>
          {!isLocked && (
            <Button className="bg-[#2f3090] hover:bg-[#4547a9]">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Position</th>
                <th className="text-left py-3 font-medium">Person</th>
                <th className="text-left py-3 font-medium">YOB</th>
                <th className="text-left py-3 font-medium">Gender</th>
                <th className="text-left py-3 font-medium">Shirt</th>
                <th className="text-left py-3 font-medium">Diet</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDelegation.participants.map((participant, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <Badge
                      variant="secondary"
                      className={
                        participant.role === "Team Leader"
                          ? "bg-[#2f3090]/10 text-[#2f3090]"
                          : participant.role === "Deputy Leader"
                            ? "bg-[#4547a9]/10 text-[#4547a9]"
                            : participant.role === "Contestant"
                              ? "bg-[#00795d]/10 text-[#00795d]"
                              : participant.role === "IC Member"
                                ? "bg-purple-100 text-purple-700"
                                : participant.role === "ITC Member"
                                  ? "bg-cyan-100 text-cyan-700"
                                  : "bg-orange-100 text-orange-700"
                      }
                    >
                      {participant.role}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {participant.firstName[0]}
                        {participant.lastName[0]}
                      </div>
                      <span className="font-medium">
                        {participant.firstName} {participant.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">{participant.yearOfBirth}</td>
                  <td className="py-4">{participant.gender}</td>
                  <td className="py-4">{participant.tshirtSize} (male fit)</td>
                  <td className="py-4">{participant.dietary}</td>
                  <td className="py-4">
                    {!isLocked && (
                      <Button variant="ghost" size="sm" className="text-[#2f3090] hover:bg-[#2f3090]/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Required Documents</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Consent Forms</p>
              <p className="text-sm text-muted-foreground">Signed consent form for each participant</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              9/10 Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Passport Scans</p>
              <p className="text-sm text-muted-foreground">Clear scan of passport photo page</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              10/10 Uploaded
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Profile Photos</p>
              <p className="text-sm text-muted-foreground">Passport-style photo for each participant</p>
            </div>
            <Badge variant="secondary" className="bg-[#00795d]/10 text-[#00795d]">
              10/10 Uploaded
            </Badge>
          </div>
        </div>
      </Card>

      {!isLocked && (
        <div className="flex justify-end">
          <Button size="lg" className="bg-[#00795d] hover:bg-[#009973]">
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  )
}
