import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, InfoIcon } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Invitation letters for Uzbekistan</h1>
        </div>
        <p className="text-white/80">Download your invitation letter here.</p>
      </div>

      <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
        <InfoIcon className="h-4 w-4 text-[#00795d]" />
        <AlertDescription className="text-[#00795d]">
          <p className="font-semibold mb-1">Invitation letters can only be generated once per team member.</p>
          <p>Please ensure all details for that member are correct before downloading the invitation letter.</p>
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Members in your delegation</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Position</th>
                <th className="text-left py-3 font-medium">Name in Passport</th>
                <th className="text-left py-3 font-medium">Passport No</th>
                <th className="text-left py-3 font-medium">Gender</th>
                <th className="text-left py-3 font-medium">Date of Birth</th>
                <th className="text-left py-3 font-medium">Action</th>
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
                                : participant.role === "ISC Member"
                                  ? "bg-cyan-100 text-cyan-700"
                                  : participant.role === "ITC Member"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-orange-100 text-orange-700"
                      }
                    >
                      {participant.role}
                    </Badge>
                  </td>
                  <td className="py-4 font-medium">
                    {participant.role === "Team Leader"
                      ? "Khojiev/Sunatullo"
                      : participant.role === "Deputy Leader"
                        ? "Tukhtaev/Davron"
                        : participant.role === "Contestant" && participant.firstName === "Sunnatov"
                          ? "Sunnatov/Asilbek"
                          : participant.role === "Contestant" && participant.firstName === "Ulug'bek"
                            ? "Rakhmatulaev/Ulugbek"
                            : participant.role === "Contestant" && participant.firstName === "Salimov"
                              ? "Salimov/Sardor"
                              : participant.role === "Contestant" && participant.firstName === "Timur"
                                ? "Kadirbergenov/Timur"
                                : participant.role === "IC Member"
                                  ? "Seydaliev/Azamat"
                                  : participant.role === "ISC Member"
                                    ? "Ganiev/Asadullo"
                                    : participant.role === "ITC Member"
                                      ? "Mirokilov/Davlatbek"
                                      : "Sattarov/Ilkhom"}
                  </td>
                  <td className="py-4">{participant.passportNumber}</td>
                  <td className="py-4">{participant.gender}</td>
                  <td className="py-4">
                    {participant.role === "Team Leader"
                      ? "27 Aug 1991"
                      : participant.role === "Deputy Leader"
                        ? "09 Aug 1992"
                        : participant.role === "Contestant" && participant.yearOfBirth === 2007
                          ? "15 Nov 2007"
                          : participant.role === "Contestant" &&
                              participant.yearOfBirth === 2008 &&
                              participant.firstName === "Ulug'bek"
                            ? "28 Jul 2008"
                            : participant.role === "Contestant" && participant.yearOfBirth === 2009
                              ? "20 May 2009"
                              : participant.role === "Contestant" &&
                                  participant.yearOfBirth === 2008 &&
                                  participant.firstName === "Timur"
                                ? "17 Jul 2008"
                                : participant.role === "IC Member"
                                  ? "18 Aug 2003"
                                  : participant.role === "ISC Member"
                                    ? "26 Sep 2001"
                                    : participant.role === "ITC Member"
                                      ? "13 Nov 2004"
                                      : "31 Jul 1985"}
                  </td>
                  <td className="py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      invitation_{index + 17443}.pdf
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-2">About Invitation Letters</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Invitation letters are automatically generated based on participant information</li>
          <li>Each letter includes: full name, role, passport number, and country</li>
          <li>Letters are required for visa applications</li>
          <li>Once downloaded, letters cannot be regenerated - ensure all details are correct first</li>
        </ul>
      </Card>
    </div>
  )
}
