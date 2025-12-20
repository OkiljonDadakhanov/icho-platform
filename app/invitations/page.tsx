"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, InfoIcon } from "lucide-react"
import { mockDelegation } from "@/lib/mock-data"
import jsPDF from "jspdf"

export default function InvitationsPage() {
  const [generatedInvitations, setGeneratedInvitations] = useState<Set<string>>(new Set())

  const generateInvitationPDF = (participant: (typeof mockDelegation.participants)[0], passportName: string, dateOfBirth: string) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPos = margin

    // Title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("INVITATION LETTER", pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, yPos)
    yPos += 10

    // Body
    doc.setFontSize(12)
    const bodyText = [
      "To Whom It May Concern,",
      "",
      `This is to confirm that ${passportName} (Passport No: ${participant.passportNumber})`,
      `has been invited to participate in the International Chemistry Olympiad (IChO) 2026`,
      `as a ${participant.role} representing ${mockDelegation.country}.`,
      "",
      `Date of Birth: ${dateOfBirth}`,
      `Gender: ${participant.gender}`,
      "",
      "This invitation letter is issued for visa application purposes.",
      "",
      "We kindly request your assistance in processing the visa application for the above-mentioned participant.",
      "",
      "Sincerely,",
      "",
      "IChO 2026 Organizing Committee",
    ]

    bodyText.forEach((line) => {
      if (yPos > pageHeight - margin - 20) {
        doc.addPage()
        yPos = margin
      }
      doc.text(line, margin, yPos)
      yPos += 6
    })

    // Footer
    const footerY = pageHeight - 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("This is an auto-generated invitation letter", pageWidth / 2, footerY, { align: "center" })

    // Save PDF
    const fileName = `invitation_${participant.passportNumber}.pdf`
    doc.save(fileName)

    // Mark as generated
    setGeneratedInvitations((prev) => new Set([...prev, participant.passportNumber]))
  }

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
          <p className="font-semibold mb-1">Invitation letters are auto-generated as PDF based on passport number.</p>
          <p>Each letter is distributed based on the participant's passport number. Please ensure all details are correct before downloading.</p>
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
              {mockDelegation.participants.map((participant, index) => {
                const passportName =
                  participant.role === "Team Leader"
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
                                    : "Sattarov/Ilkhom"

                const dateOfBirth =
                  participant.role === "Team Leader"
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
                                    : "31 Jul 1985"

                const isGenerated = generatedInvitations.has(participant.passportNumber)

                return (
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
                    <td className="py-4 font-medium">{passportName}</td>
                    <td className="py-4 font-mono text-xs">{participant.passportNumber}</td>
                    <td className="py-4">{participant.gender}</td>
                    <td className="py-4">{dateOfBirth}</td>
                    <td className="py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent"
                        onClick={() => generateInvitationPDF(participant, passportName, dateOfBirth)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isGenerated ? "Regenerate" : "Generate"} PDF
                      </Button>
                      {isGenerated && (
                        <Badge variant="secondary" className="ml-2 bg-[#00795d]/10 text-[#00795d] text-xs">
                          Generated
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-[#2f3090]/5 border-[#2f3090]/20">
        <h3 className="font-semibold mb-2">About Invitation Letters</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Invitation letters are automatically generated as PDF based on participant information</li>
          <li>Each letter includes: full name, role, passport number, date of birth, and country</li>
          <li>Letters are distributed based on passport number for visa applications</li>
          <li>PDFs are generated on-demand and can be regenerated if needed</li>
        </ul>
      </Card>
    </div>
  )
}
