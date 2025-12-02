import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function InformationPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <InfoIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Information</h1>
        </div>
        <p className="text-teal-50">Important information about IChO 2026 registration process.</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Welcome to the official registration system for the 58th International Chemistry Olympiad (IChO 2026), hosted
          in Uzbekistan.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Registration Stages</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Pre-Registration</h3>
            <p className="text-sm text-muted-foreground">
              Submit coordinator details and expected number of participants. The system will calculate participation
              fees and generate an invoice.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Payment</h3>
            <p className="text-sm text-muted-foreground">
              Download your invoice, make payment, and upload proof of payment. Admin will verify and approve your
              payment.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Participant Registration</h3>
            <p className="text-sm text-muted-foreground">
              After payment approval, submit complete details for all team members including passport scans, photos, and
              consent forms.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Travel Information</h3>
            <p className="text-sm text-muted-foreground">
              Provide arrival and departure details for all participants, including flight information and tickets.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">5. Invitation Letters</h3>
            <p className="text-sm text-muted-foreground">
              Once all information is complete, download individual invitation letters for visa applications.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Important Deadlines</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Pre-registration deadline:</span>
            <span>April 15, 2025</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Payment deadline:</span>
            <span>May 1, 2025</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Participant details deadline:</span>
            <span>July 8, 2025</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Travel information deadline:</span>
            <span>August 2, 2025</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Arrival day:</span>
            <span>July 27, 2025</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="font-semibold mb-2">⚠️ Important Notes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• After each deadline, editing will be disabled (read-only mode)</li>
          <li>• Only organizers can unlock fields in special cases</li>
          <li>• Invitation letters can only be generated once - ensure all details are correct</li>
          <li>• Each country has one login for the entire delegation</li>
          <li>• Contact organizers immediately if you encounter any issues</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:info@icho2026.uz" className="text-blue-600 hover:underline">
              info@icho2026.uz
            </a>
          </p>
          <p>
            <span className="font-medium">Website:</span>{" "}
            <a href="https://icho2026.uz" className="text-blue-600 hover:underline">
              https://icho2026.uz
            </a>
          </p>
          <p>
            <span className="font-medium">Phone:</span> +998 71 XXX XX XX
          </p>
        </div>
      </Card>
    </div>
  )
}
