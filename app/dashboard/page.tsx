import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, Home, Edit } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"

export default function DashboardPage() {
  const stages = [
    { date: "01 Mar 2026", label: "Pre-registration", status: "completed" },
    { date: "15 Mar 2026", label: "Registration opens", status: "completed" },
    { date: "15 Jun 2026", label: "Participants final", status: "completed" },
    { date: "01 Jul 2026", label: "Travel details final", status: "current" },
    { date: "20 Jul 2026", label: "Arrival day", status: "upcoming" },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Uzbekistan</h1>
        </div>
        <p className="text-white/80">Please use this site to fill out the details for your delegation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <img src="https://flagcdn.com/w40/uz.png" alt="Uzbekistan flag" className="w-6 h-4" />
            <h2 className="text-lg font-semibold">Science Olympiad Center</h2>
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
                  <span className="font-medium">Organisation:</span> Science Olympiad Center
                </p>
                <p>
                  <span className="font-medium">Website to publish:</span>{" "}
                  <a href="https://www.olympcenter.uz/" className="text-[#2f3090] hover:underline">
                    https://www.olympcenter.uz/
                  </a>
                </p>
                <p>
                  <span className="font-medium">Public e-mail to publish:</span>{" "}
                  <a href="mailto:info@olympcenter.uz" className="text-[#2f3090] hover:underline">
                    info@olympcenter.uz
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-muted-foreground mb-1">
                The following e-mail address will not be published; it will be used as a contact point between events.
              </p>
              <p>
                <span className="font-medium">Direct e-mail:</span>{" "}
                <a href="mailto:toxtayev.davron@mail.ru" className="text-[#2f3090] hover:underline">
                  toxtayev.davron@mail.ru
                </a>
              </p>
            </div>

            <div className="pt-3 border-t text-xs text-muted-foreground">
              This information was verified by IChO 2026 Organizing Committee on 17 Mar 2026.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">My account</h2>
          <div className="space-y-2 text-sm mb-4">
            <p>
              <span className="font-medium">Name:</span> Davron Tukhtaev
            </p>
            <p>
              <span className="font-medium">Last login:</span> 2026-03-18 14:03:48 (password)
            </p>
            <p className="text-muted-foreground">
              You may want to consider{" "}
              <a href="#" className="text-[#2f3090] hover:underline">
                adding a passkey to your account
              </a>
              .
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
          <img src="https://flagcdn.com/w40/uz.png" alt="Uzbekistan flag" className="w-6 h-4" />
          <h2 className="text-lg font-semibold">Participants</h2>
        </div>

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
              {mockDelegation.participants.slice(0, 4).map((participant, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {participant.firstName[0]}
                        {participant.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {participant.firstName} {participant.lastName}
                        </p>
                        <Badge
                          variant="secondary"
                          className={
                            participant.role === "Team Leader"
                              ? "bg-[#2f3090]/10 text-[#2f3090]"
                              : participant.role === "Deputy Leader"
                                ? "bg-[#4547a9]/10 text-[#4547a9]"
                                : "bg-[#00795d]/10 text-[#00795d]"
                          }
                        >
                          {participant.role}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{participant.gender}</td>
                  <td className="py-3">{participant.tshirtSize} (male fit)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
