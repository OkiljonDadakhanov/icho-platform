"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, CheckCircle2, XCircle, CreditCard, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { paymentsService } from "@/lib/services/payments"
import { participantsService } from "@/lib/services/participants"
import { Loading } from "@/components/ui/loading"
import type { Payment, Invoice, Participant } from "@/lib/types"
import { mapRoleToFrontend } from "@/lib/types"

export default function PaymentPage() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryName = user?.country?.name || "Your Country"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [participantsData, paymentData] = await Promise.all([
        participantsService.getAllParticipants(),
        paymentsService.getPayment().catch(() => null)
      ])
      setParticipants(participantsData)
      setPayment(paymentData)
      // Invoice is embedded in payment response
      setInvoice(paymentData?.invoice || null)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load payment information. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate based on registered participants
  const teamLeaders = participants.filter((p) => p.role === "TEAM_LEADER").length
  const contestants = participants.filter((p) => p.role === "CONTESTANT").length
  const observers = participants.filter((p) => p.role === "OBSERVER").length
  const guests = participants.filter((p) => p.role === "GUEST").length

  const pricePerPerson = 500

  const breakdown = useMemo(() => {
    return {
      teamLeaders: teamLeaders * pricePerPerson,
      contestants: contestants * pricePerPerson,
      observers: observers * pricePerPerson,
      guests: guests * pricePerPerson,
      total:
        teamLeaders * pricePerPerson +
        contestants * pricePerPerson +
        observers * pricePerPerson +
        guests * pricePerPerson,
    }
  }, [teamLeaders, contestants, observers, guests])

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      await paymentsService.uploadPaymentProof(file)
      await fetchData()
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to upload payment proof:", err)
      const errorMessage = (err as { message?: string })?.message || "Failed to upload payment proof. Please try again."
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!invoice) {
      setError("Invoice is not available yet. Please complete pre-registration first.")
      return
    }
    try {
      const blob = await paymentsService.downloadInvoice()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      console.error("Failed to download invoice:", err)
      const errorMessage = (err as { message?: string })?.message || "Failed to download invoice. Please try again."
      setError(errorMessage)
    }
  }

  if (isLoading) {
    return <Loading message="Loading payment information..." />
  }

  const paymentStatus = payment?.status || "PENDING"

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Payment & Invoice</h1>
        </div>
        <p className="text-white/80">Download your invoice and submit payment proof.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paymentStatus === "APPROVED" && (
        <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
          <CheckCircle2 className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            Your payment has been verified and approved. You can now proceed to participant registration.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "REJECTED" && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your payment proof was rejected. {payment?.admin_comment && `Reason: ${payment.admin_comment}`}
            Please upload a valid bank receipt or transfer confirmation.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">
                {invoice ? `Invoice #${invoice.number}` : "Invoice not yet generated"}
              </p>
              {invoice && (
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {invoice && (
              <Button
                variant="outline"
                className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10 bg-transparent"
                onClick={handleDownloadInvoice}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-[#2f3090]">
                ${invoice?.amount?.toLocaleString() || breakdown.total.toLocaleString()} {invoice?.currency || "USD"}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <Badge
                className={
                  paymentStatus === "APPROVED"
                    ? "bg-[#00795d]"
                    : paymentStatus === "REJECTED"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }
              >
                {paymentStatus === "APPROVED" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                  </>
                ) : paymentStatus === "REJECTED" ? (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Breakdown (Estimated)</h3>
            <div className="space-y-2 text-sm">
              {teamLeaders > 0 && (
                <div className="flex justify-between">
                  <span>Team Leader ({teamLeaders} x ${pricePerPerson})</span>
                  <span>${breakdown.teamLeaders.toLocaleString()}</span>
                </div>
              )}
              {contestants > 0 && (
                <div className="flex justify-between">
                  <span>Contestants ({contestants} x ${pricePerPerson})</span>
                  <span>${breakdown.contestants.toLocaleString()}</span>
                </div>
              )}
              {observers > 0 && (
                <div className="flex justify-between">
                  <span>Observers ({observers} x ${pricePerPerson})</span>
                  <span>${breakdown.observers.toLocaleString()}</span>
                </div>
              )}
              {guests > 0 && (
                <div className="flex justify-between">
                  <span>Guests ({guests} x ${pricePerPerson})</span>
                  <span>${breakdown.guests.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Estimated Total</span>
                <span>${breakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Proof</h2>

        {paymentStatus === "APPROVED" ? (
          <div className="p-4 bg-[#00795d]/10 border border-[#00795d]/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#00795d]" />
              <p className="font-semibold text-[#00795d]">Payment Verified</p>
            </div>
            {payment?.reviewed_at && (
              <p className="text-sm text-[#00795d]/80">
                Verified on: {new Date(payment.reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please upload your bank transfer receipt or payment confirmation. Accepted formats: PDF, JPG, PNG (max
              5MB)
            </p>

            {payment?.proof_file ? (
              <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Payment proof uploaded</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Under Review
                </Badge>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center border-[#2f3090]/30">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleProofUpload}
                  className="hidden"
                  id="proof-upload"
                  disabled={isUploading || !invoice}
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[#2f3090]/50" />
                  <p className="font-medium mb-2">
                    {isUploading ? "Uploading..." : "Drop your file here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG up to 5MB</p>
                  <Button
                    className="bg-[#2f3090] hover:bg-[#4547a9]"
                    disabled={isUploading || !invoice}
                    asChild
                  >
                    <span>{isUploading ? "Uploading..." : "Select File"}</span>
                  </Button>
                </label>
              </div>
            )}

            {!invoice && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">
                  Invoice has not been generated yet. Please wait for the invoice to be generated before uploading payment proof.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <a href="/pre-registration">Back to Pre-Registration</a>
        </Button>
        {paymentStatus === "APPROVED" && (
          <Button className="bg-[#00795d] hover:bg-[#009973]" asChild>
            <a href="/team">Continue to Participant Registration</a>
          </Button>
        )}
      </div>
    </div>
  )
}
