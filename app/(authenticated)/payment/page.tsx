"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, CheckCircle2, XCircle, CreditCard, Clock, AlertCircle, Receipt, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { paymentsService } from "@/lib/services/payments"
import { preRegistrationService } from "@/lib/services/pre-registration"
import { Loading } from "@/components/ui/loading"
import type { Payment, Invoice, FeeRule, PreRegistration } from "@/lib/types"

export default function PaymentPage() {
  const { user } = useAuth()
  const [preRegistration, setPreRegistration] = useState<PreRegistration | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [feeRules, setFeeRules] = useState<FeeRule[]>([])
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
      const [preRegData, paymentData, feeRulesData] = await Promise.all([
        preRegistrationService.getPreRegistration().catch(() => null),
        paymentsService.getPayment().catch(() => null),
        preRegistrationService.getFeeRules().catch(() => [])
      ])
      setPreRegistration(preRegData)
      setPayment(paymentData)
      setFeeRules(feeRulesData)
      setInvoice(paymentData?.invoice || null)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load payment information. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Use pre-registration numbers for fee breakdown (matches invoice)
  const teamLeaders = preRegistration?.num_team_leaders || 0
  const contestants = preRegistration?.num_contestants || 0
  const observers = preRegistration?.num_observers || 0
  const guests = preRegistration?.num_guests || 0

  // Check if values exceed limits (need to update pre-registration)
  const hasExceededLimits = teamLeaders > 2 || contestants > 4 || observers > 2

  const getFee = (role: string): number => {
    const rule = feeRules.find((r) => r.role === role)
    return rule ? Number(rule.unit_fee) : 500
  }

  const breakdown = useMemo(() => {
    const teamLeaderFee = getFee("TEAM_LEADER")
    const contestantFee = getFee("CONTESTANT")
    const observerFee = getFee("OBSERVER")
    const guestFee = getFee("GUEST")

    return {
      teamLeaders: teamLeaders * teamLeaderFee,
      teamLeaderFee,
      teamLeadersCount: teamLeaders,
      contestants: contestants * contestantFee,
      contestantFee,
      contestantsCount: contestants,
      observers: observers * observerFee,
      observerFee,
      observersCount: observers,
      guests: guests * guestFee,
      guestFee,
      guestsCount: guests,
      total:
        teamLeaders * teamLeaderFee +
        contestants * contestantFee +
        observers * observerFee +
        guests * guestFee,
    }
  }, [teamLeaders, contestants, observers, guests, feeRules])

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

  // Determine actual payment status based on proof upload
  const getPaymentStatus = () => {
    if (!payment) return "NOT_STARTED"
    if (payment.status === "APPROVED") return "APPROVED"
    if (payment.status === "REJECTED") return "REJECTED"
    // PENDING status - check if proof was actually uploaded
    if (payment.proof_file) return "PENDING"
    return "NOT_STARTED"
  }
  const paymentStatus = getPaymentStatus()

  return (
    <div className="space-y-6">
      {/* Hero Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f3090] via-[#1e2060] to-[#00795d] text-white p-8 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00795d]/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment & Invoice</h1>
              <p className="text-white/70 mt-1">Download your invoice and submit payment proof.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-2xl font-bold">${invoice?.amount?.toLocaleString() || breakdown.total.toLocaleString()}</span>
              <span className="text-white/70 ml-2 text-sm">Total Amount</span>
            </div>
            <div className={`px-4 py-2 rounded-lg backdrop-blur-sm border transition-all hover:scale-105 ${
              paymentStatus === "APPROVED"
                ? "bg-[#00795d]/30 border-[#00795d]/30"
                : paymentStatus === "REJECTED"
                  ? "bg-red-500/20 border-red-500/20"
                  : paymentStatus === "PENDING"
                    ? "bg-yellow-500/20 border-yellow-500/20"
                    : "bg-gray-500/20 border-gray-500/20"
            }`}>
              <span className="text-xl font-semibold">{paymentStatus === "PENDING" ? "Pending" : paymentStatus === "NOT_STARTED" ? "Not Started" : paymentStatus.charAt(0) + paymentStatus.slice(1).toLowerCase()}</span>
              <span className="text-white/70 ml-2 text-sm">Status</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paymentStatus === "APPROVED" && (
        <Alert className="bg-gradient-to-r from-[#00795d]/10 to-[#00795d]/5 border-[#00795d]/30">
          <CheckCircle2 className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            Your payment has been verified and approved. You can now proceed to participant registration.
          </AlertDescription>
        </Alert>
      )}

      {hasExceededLimits && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your pre-registration has values that exceed current limits. Please{" "}
            <a href="/pre-registration" className="font-semibold underline">update your pre-registration</a>{" "}
            and save to regenerate your invoice with correct amounts.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "REJECTED" && (
        <Alert className="bg-gradient-to-r from-red-50 to-red-50/50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your payment proof was rejected. {payment?.admin_comment && `Reason: ${payment.admin_comment}`}
            Please upload a valid bank receipt or transfer confirmation.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Invoice Details</h2>
              <p className="text-sm text-gray-500">{invoice ? `Invoice #${invoice.number}` : "Invoice not yet generated"}</p>
            </div>
          </div>
          {invoice && (
            <Button
              variant="outline"
              className="border-[#2f3090] text-[#2f3090] hover:bg-[#2f3090]/10"
              onClick={handleDownloadInvoice}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-[#2f3090]/5 to-[#00795d]/5 rounded-xl border border-[#2f3090]/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#2f3090]" />
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <p className="text-3xl font-bold text-[#2f3090]">
                ${invoice?.amount?.toLocaleString() || breakdown.total.toLocaleString()} <span className="text-lg font-normal text-gray-500">{invoice?.currency || "USD"}</span>
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Payment Status</p>
              <Badge
                className={`text-sm px-3 py-1 ${
                  paymentStatus === "APPROVED"
                    ? "bg-[#00795d] text-white"
                    : paymentStatus === "REJECTED"
                      ? "bg-red-500 text-white"
                      : paymentStatus === "PENDING"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-500 text-white"
                }`}
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
                ) : paymentStatus === "PENDING" ? (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Verification
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3 h-3 mr-1" />
                    Not Started
                  </>
                )}
              </Badge>
              {invoice && (
                <p className="text-xs text-gray-500 mt-2">
                  Generated on {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Fee Breakdown (from Pre-registration)
            </h3>
            <div className="space-y-2 text-sm">
              {teamLeaders > 0 && (
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-gray-700">
                    <Badge className="bg-[#2f3090] text-white mr-2 text-xs">Leaders</Badge>
                    {teamLeaders} x ${breakdown.teamLeaderFee}
                  </span>
                  <span className="font-semibold text-gray-800">${breakdown.teamLeaders.toLocaleString()}</span>
                </div>
              )}
              {contestants > 0 && (
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-gray-700">
                    <Badge className="bg-[#00795d] text-white mr-2 text-xs">Contestants</Badge>
                    {contestants} x ${breakdown.contestantFee}
                  </span>
                  <span className="font-semibold text-gray-800">${breakdown.contestants.toLocaleString()}</span>
                </div>
              )}
              {observers > 0 && (
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-gray-700">
                    <Badge className="bg-purple-600 text-white mr-2 text-xs">Observers</Badge>
                    {observers} x ${breakdown.observerFee}
                  </span>
                  <span className="font-semibold text-gray-800">${breakdown.observers.toLocaleString()}</span>
                </div>
              )}
              {guests > 0 && (
                <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                  <span className="text-gray-700">
                    <Badge className="bg-orange-500 text-white mr-2 text-xs">Guests</Badge>
                    {guests} x ${breakdown.guestFee}
                  </span>
                  <span className="font-semibold text-gray-800">${breakdown.guests.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-semibold pt-3 mt-2 border-t border-amber-200">
                <span className="text-gray-800">Estimated Total</span>
                <span className="text-lg text-[#2f3090]">${breakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-[#2f3090] to-[#00795d] rounded-lg text-white">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Payment Proof</h2>
            <p className="text-sm text-gray-500">Upload your bank transfer receipt</p>
          </div>
        </div>

        {paymentStatus === "APPROVED" ? (
          <div className="p-6 bg-gradient-to-r from-[#00795d]/10 to-[#00795d]/5 border border-[#00795d]/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#00795d] rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-[#00795d] text-lg">Payment Verified</p>
            </div>
            {payment?.reviewed_at && (
              <p className="text-sm text-[#00795d]/80 ml-11">
                Verified on: {new Date(payment.reviewed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please upload your bank transfer receipt or payment confirmation. Accepted formats: PDF, JPG, PNG (max 5MB)
            </p>

            {payment?.proof_file ? (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Upload className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="font-medium text-gray-700">Payment proof uploaded</span>
                </div>
                <Badge className="bg-yellow-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Under Review
                </Badge>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-8 text-center border-[#2f3090]/30 hover:border-[#2f3090]/50 transition-colors bg-gradient-to-br from-white to-gray-50/50">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleProofUpload}
                  className="hidden"
                  id="proof-upload"
                  disabled={isUploading || !invoice}
                />
                <label htmlFor="proof-upload" className={`cursor-pointer block ${(!invoice || isUploading) ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2f3090]/10 to-[#00795d]/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#2f3090]/50" />
                  </div>
                  <p className="font-medium mb-2 text-gray-800">
                    {isUploading ? "Uploading..." : "Drop your file here or click to browse"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">PDF, JPG, PNG up to 5MB</p>
                  <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:from-[#4547a9] hover:to-[#00a67d] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {isUploading ? "Uploading..." : "Select File"}
                  </span>
                </label>
              </div>
            )}

            {!invoice && (
              <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Please complete pre-registration first. Your invoice will be generated after pre-registration is submitted.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" className="border-gray-300 hover:bg-gray-100" asChild>
          <a href="/pre-registration">Back to Pre-Registration</a>
        </Button>
        {paymentStatus === "APPROVED" && (
          <Button className="bg-gradient-to-r from-[#00795d] to-[#00795d] hover:from-[#009973] hover:to-[#009973] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
            <a href="/team">Continue to Participant Registration</a>
          </Button>
        )}
      </div>
    </div>
  )
}
