"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, ClipboardList } from "lucide-react"

export default function PreRegistrationPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Pre-Registration</h1>
        </div>
        <p className="text-white/80">Please provide coordinator details and expected delegation size.</p>
      </div>

      <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
        <InfoIcon className="h-4 w-4 text-[#00795d]" />
        <AlertDescription className="text-[#00795d]">
          This is the first stage of registration. Complete this form to receive your invoice for participation fees.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Coordinator Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" placeholder="Enter first name" defaultValue="Davron" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" placeholder="Enter last name" defaultValue="Tukhtaev" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input id="role" placeholder="e.g., National Coordinator" defaultValue="National Coordinator" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select defaultValue="male">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input id="dob" type="date" defaultValue="1992-08-09" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport">Passport Number *</Label>
            <Input id="passport" placeholder="Enter passport number" defaultValue="FA8314757" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="coordinator@example.com"
              defaultValue="toxtayev.davron@mail.ru"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" placeholder="+998 XX XXX XX XX" defaultValue="+998 90 123 45 67" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Expected Delegation Size</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="teamLeaders">Team Leaders *</Label>
            <Input id="teamLeaders" type="number" min="0" defaultValue="1" />
            <p className="text-xs text-muted-foreground">Usually 1-2 per country</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contestants">Contestants *</Label>
            <Input id="contestants" type="number" min="0" max="4" defaultValue="4" />
            <p className="text-xs text-muted-foreground">Maximum 4 students</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observers">Observers</Label>
            <Input id="observers" type="number" min="0" defaultValue="2" />
            <p className="text-xs text-muted-foreground">Scientific observers</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Guests</Label>
            <Input id="guests" type="number" min="0" defaultValue="3" />
            <p className="text-xs text-muted-foreground">Additional delegation members</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#2f3090]/10 rounded-lg border border-[#2f3090]/20">
          <h3 className="font-semibold mb-2">Estimated Participation Fee</h3>
          <p className="text-2xl font-bold text-[#2f3090]">$5,000 USD</p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on 10 participants (1 leader + 4 contestants + 2 observers + 3 guests)
          </p>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button className="bg-[#2f3090] hover:bg-[#4547a9]">Submit Pre-Registration</Button>
      </div>
    </div>
  )
}
