import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, CheckCircle2, XCircle, CreditCard } from "lucide-react"

export default function PaymentPage() {
  const paymentStatus = "approved" // 'pending' | 'approved' | 'rejected'

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Payment & Invoice</h1>
        </div>
        <p className="text-white/80">Download your invoice and submit payment proof.</p>
      </div>

      {paymentStatus === "approved" && (
        <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
          <CheckCircle2 className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            Your payment has been verified and approved. You can now proceed to participant registration.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "rejected" && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your payment proof was rejected. Please upload a valid bank receipt or transfer confirmation.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Invoice #IChO2026-UZB-001</p>
              <p className="text-sm text-muted-foreground">Generated on March 16, 2026</p>
            </div>
            <Button variant="outline" className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-[#2f3090]">$5,000 USD</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <Badge
                className={
                  paymentStatus === "approved"
                    ? "bg-[#00795d]"
                    : paymentStatus === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }
              >
                {paymentStatus === "approved"
                  ? "Approved"
                  : paymentStatus === "rejected"
                    ? "Rejected"
                    : "Pending Verification"}
              </Badge>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Team Leader (1 x $500)</span>
                <span>$500</span>
              </div>
              <div className="flex justify-between">
                <span>Contestants (4 x $500)</span>
                <span>$2,000</span>
              </div>
              <div className="flex justify-between">
                <span>Observers (2 x $500)</span>
                <span>$1,000</span>
              </div>
              <div className="flex justify-between">
                <span>Guests (3 x $500)</span>
                <span>$1,500</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>$5,000</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Proof</h2>

        {paymentStatus === "approved" ? (
          <div className="p-4 bg-[#00795d]/10 border border-[#00795d]/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#00795d]" />
              <p className="font-semibold text-[#00795d]">Payment Verified</p>
            </div>
            <p className="text-sm text-[#00795d]/80">Uploaded: bank_transfer_receipt.pdf</p>
            <p className="text-sm text-[#00795d]/80">Verified on: March 18, 2026</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please upload your bank transfer receipt or payment confirmation. Accepted formats: PDF, JPG, PNG (max
              5MB)
            </p>

            <div className="border-2 border-dashed rounded-lg p-8 text-center border-[#2f3090]/30">
              <Upload className="w-12 h-12 mx-auto mb-4 text-[#2f3090]/50" />
              <p className="font-medium mb-2">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG up to 5MB</p>
              <Button className="bg-[#2f3090] hover:bg-[#4547a9]">Select File</Button>
            </div>

            {paymentStatus === "pending" && (
              <Alert className="bg-[#2f3090]/10 border-[#2f3090]/30">
                <AlertDescription className="text-[#2f3090]">
                  Your payment proof is currently under review. You will be notified once it's verified.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline">Back to Pre-Registration</Button>
        {paymentStatus === "approved" && (
          <Button className="bg-[#00795d] hover:bg-[#009973]">Continue to Participant Registration</Button>
        )}
      </div>
    </div>
  )
}
