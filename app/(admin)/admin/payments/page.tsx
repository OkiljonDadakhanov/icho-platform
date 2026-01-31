"use client";

import { getErrorMessage } from "@/lib/error-utils";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminPayment } from "@/lib/services/admin";
import { apiDownloadAndOpen } from "@/lib/api";
import type { SingleRoomInvoice } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bed } from "lucide-react";


export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single room invoice states
  const [singleRoomInvoices, setSingleRoomInvoices] = useState<SingleRoomInvoice[]>([]);
  const [filteredSingleRoomInvoices, setFilteredSingleRoomInvoices] = useState<SingleRoomInvoice[]>([]);
  const [singleRoomSearchQuery, setSingleRoomSearchQuery] = useState("");
  const [singleRoomStatusFilter, setSingleRoomStatusFilter] = useState("all");
  const [selectedSingleRoom, setSelectedSingleRoom] = useState<SingleRoomInvoice | null>(null);
  const [showSingleRoomDialog, setShowSingleRoomDialog] = useState(false);
  const [singleRoomAction, setSingleRoomAction] = useState<"approve" | "reject" | null>(null);
  const [singleRoomComment, setSingleRoomComment] = useState("");
  const [activeTab, setActiveTab] = useState<"delegation" | "single-room">("delegation");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [paymentsData, singleRoomData] = await Promise.all([
          adminService.getPayments(),
          adminService.getSingleRoomInvoices(),
        ]);
        setPayments(paymentsData);
        setSingleRoomInvoices(singleRoomData);
        setError(null);
      } catch (err: unknown) {
        console.error("Failed to fetch payments:", err);
        setError(getErrorMessage(err, "Failed to load payments"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique countries for filter dropdown
  const countries = [...new Set(payments.map((p) => p.country_name))].filter(Boolean).sort();

  useEffect(() => {
    let filtered = payments;

    // Filter by country
    if (countryFilter !== "all") {
      filtered = filtered.filter((p) => p.country_name === countryFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "AWAITING_PROOF") {
        // Show payments without proof uploaded
        filtered = filtered.filter((p) => !p.proof_file);
      } else if (statusFilter === "PENDING") {
        // Only show payments with proof uploaded that are pending review
        filtered = filtered.filter((p) => p.status === "PENDING" && p.proof_file);
      } else {
        filtered = filtered.filter((p) => p.status === statusFilter);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.country_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [statusFilter, countryFilter, searchQuery, payments]);

  // Filter single room invoices
  useEffect(() => {
    let filtered = singleRoomInvoices;

    // Filter by status
    if (singleRoomStatusFilter !== "all") {
      if (singleRoomStatusFilter === "PENDING") {
        // Only show invoices with proof uploaded that are pending review
        filtered = filtered.filter((inv) => inv.status === "PENDING" && inv.proof_file);
      } else {
        filtered = filtered.filter((inv) => inv.status === singleRoomStatusFilter);
      }
    }

    // Filter by search query
    if (singleRoomSearchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.participant_name?.toLowerCase().includes(singleRoomSearchQuery.toLowerCase()) ||
          inv.country_name?.toLowerCase().includes(singleRoomSearchQuery.toLowerCase()) ||
          inv.number?.toLowerCase().includes(singleRoomSearchQuery.toLowerCase())
      );
    }

    setFilteredSingleRoomInvoices(filtered);
  }, [singleRoomStatusFilter, singleRoomSearchQuery, singleRoomInvoices]);

  const handleReview = (payment: AdminPayment, action: "approve" | "reject") => {
    setSelectedPayment(payment);
    setReviewAction(action);
    setAdminComment("");
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedPayment || !reviewAction) return;

    if (reviewAction === "reject" && !adminComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsSubmitting(true);

      if (reviewAction === "approve") {
        await adminService.approvePayment(selectedPayment.id, adminComment);
      } else {
        await adminService.rejectPayment(selectedPayment.id, adminComment);
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? {
                ...p,
                status: reviewAction === "approve" ? "APPROVED" : "REJECTED",
                admin_comment: adminComment,
                reviewed_at: new Date().toISOString(),
              }
            : p
        )
      );

      toast.success(
        reviewAction === "approve"
          ? `Payment for ${selectedPayment.country_name} approved`
          : `Payment for ${selectedPayment.country_name} rejected`
      );
      setShowReviewDialog(false);
    } catch (err: unknown) {
      console.error("Failed to submit review:", err);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleRoomReview = (invoice: SingleRoomInvoice, action: "approve" | "reject") => {
    setSelectedSingleRoom(invoice);
    setSingleRoomAction(action);
    setSingleRoomComment("");
    setShowSingleRoomDialog(true);
  };

  const submitSingleRoomReview = async () => {
    if (!selectedSingleRoom || !singleRoomAction) return;

    if (singleRoomAction === "reject" && !singleRoomComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsSubmitting(true);

      if (singleRoomAction === "approve") {
        await adminService.approveSingleRoomPayment(selectedSingleRoom.id, singleRoomComment);
      } else {
        await adminService.rejectSingleRoomPayment(selectedSingleRoom.id, singleRoomComment);
      }

      setSingleRoomInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedSingleRoom.id
            ? {
                ...inv,
                status: singleRoomAction === "approve" ? "APPROVED" : "REJECTED",
                admin_comment: singleRoomComment,
                reviewed_at: new Date().toISOString(),
              }
            : inv
        )
      );

      toast.success(
        singleRoomAction === "approve"
          ? `Single room payment for ${selectedSingleRoom.participant_name} approved`
          : `Single room payment for ${selectedSingleRoom.participant_name} rejected`
      );
      setShowSingleRoomDialog(false);
    } catch (err: unknown) {
      console.error("Failed to submit review:", err);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-0 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const awaitingProofCount = payments.filter((p) => !p.proof_file).length;
  const pendingCount = payments.filter((p) => p.status === "PENDING" && p.proof_file).length;
  const approvedCount = payments.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = payments.filter((p) => p.status === "REJECTED").length;
  const totalAmount = payments
    .filter((p) => p.status === "APPROVED")
    .reduce((acc, p) => acc + (Number(p.invoice_amount) || p.invoice?.amount || 0), 0);

  // Single room stats
  const singleRoomPendingCount = singleRoomInvoices.filter((inv) => inv.status === "PENDING" && inv.proof_file).length;
  const singleRoomApprovedCount = singleRoomInvoices.filter((inv) => inv.status === "APPROVED").length;
  const singleRoomRejectedCount = singleRoomInvoices.filter((inv) => inv.status === "REJECTED").length;
  const singleRoomAwaitingProof = singleRoomInvoices.filter((inv) => !inv.proof_file).length;
  const singleRoomTotalAmount = singleRoomInvoices
    .filter((inv) => inv.status === "APPROVED")
    .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

  if (isLoading) {
    return <Loading message="Loading payments..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Review and manage payment proofs</p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:opacity-90"
          disabled={isExporting}
          onClick={async () => {
            try {
              setIsExporting(true);
              const blob = await adminService.exportPayments(statusFilter);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "icho_payments.xlsx";
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Payments exported successfully");
            } catch (err: unknown) {
              console.error("Failed to export payments:", err);
              toast.error("Failed to export payments");
            } finally {
              setIsExporting(false);
            }
          }}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? "Exporting..." : "Export Payments"}
        </Button>
      </div>

      {/* Main Tabs: Delegation vs Single Room */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "delegation" | "single-room")}>
        <TabsList className="bg-gray-100 mb-6">
          <TabsTrigger value="delegation" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Delegation Payments
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {payments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="single-room" className="gap-2">
            <Bed className="w-4 h-4" />
            Single Room
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {singleRoomInvoices.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="delegation" className="space-y-6">
          {/* Delegation Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 bg-gray-50 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{awaitingProofCount}</p>
                  <p className="text-sm text-gray-700">Awaiting Proof</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
                  <p className="text-sm text-amber-700">Pending Review</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">{approvedCount}</p>
                  <p className="text-sm text-emerald-700">Approved</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
                  <p className="text-sm text-red-700">Rejected</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    ${totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-700">Total Collected</p>
                </div>
              </div>
            </Card>
          </div>

      {/* Filters & Table */}
      <Card className="p-6">
        <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all" className="gap-1">
                All
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {payments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="AWAITING_PROOF" className="gap-1">
                Awaiting Proof
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-gray-200 text-gray-800">
                  {awaitingProofCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="gap-1">
                Pending
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-amber-200 text-amber-800">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="APPROVED" className="gap-1">
                Approved
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-emerald-200 text-emerald-800">
                  {approvedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="REJECTED" className="gap-1">
                Rejected
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-red-200 text-red-800">
                  {rejectedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1" />

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country!}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by country or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold">Invoice</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://flagcdn.com/w40/${payment.country_iso?.toLowerCase().slice(0, 2)}.png`}
                          alt={payment.country_name}
                          className="w-8 h-6 object-cover rounded shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "https://flagcdn.com/w40/un.png";
                          }}
                        />
                        <span className="font-medium">{payment.country_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.invoice_number ? (
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {payment.invoice_number}
                        </code>
                      ) : (
                        <span className="text-sm text-gray-400">No invoice</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.invoice_amount != null ? (
                        <>
                          <span className="font-semibold text-gray-900">
                            ${payment.invoice_amount.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            USD
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {payment.proof_submitted_at ? (
                        format(new Date(payment.proof_submitted_at), "MMM d, yyyy")
                      ) : (
                        <span className="text-gray-400">Not submitted</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!payment.proof_file ? (
                        <Badge className="bg-gray-100 text-gray-700 border-0 gap-1">
                          <FileText className="w-3 h-3" />
                          Awaiting Proof
                        </Badge>
                      ) : (
                        getStatusBadge(payment.status)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
{payment.proof_file ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-600"
                            onClick={() => apiDownloadAndOpen(`/v1/admin/payments/${payment.id}/proof/download/`)}
                          >
                            <Eye className="w-4 h-4" />
                            View Proof
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400 px-2">
                            No proof uploaded
                          </span>
                        )}
                        {payment.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleReview(payment, "approve")}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleReview(payment, "reject")}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        {payment.status !== "PENDING" && payment.admin_comment && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowReviewDialog(true);
                              setReviewAction(null);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            Comment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
              <p className="text-gray-500">
                {statusFilter !== "all"
                  ? `No ${statusFilter.toLowerCase()} payments to show`
                  : "No payments match your search"}
              </p>
            </div>
          )}
        </Tabs>
      </Card>
        </TabsContent>

        {/* Single Room Payments Tab */}
        <TabsContent value="single-room" className="space-y-6">
          {/* Single Room Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 bg-gray-50 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{singleRoomAwaitingProof}</p>
                  <p className="text-sm text-gray-700">Awaiting Proof</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-900">{singleRoomPendingCount}</p>
                  <p className="text-sm text-amber-700">Pending Review</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">{singleRoomApprovedCount}</p>
                  <p className="text-sm text-emerald-700">Approved</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{singleRoomRejectedCount}</p>
                  <p className="text-sm text-red-700">Rejected</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    ${singleRoomTotalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-700">Total Collected</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Single Room Filters & Table */}
          <Card className="p-6">
            <Tabs defaultValue={singleRoomStatusFilter} onValueChange={setSingleRoomStatusFilter}>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="all" className="gap-1">
                    All
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {singleRoomInvoices.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="PENDING" className="gap-1">
                    Pending
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-amber-200 text-amber-800">
                      {singleRoomPendingCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="APPROVED" className="gap-1">
                    Approved
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-emerald-200 text-emerald-800">
                      {singleRoomApprovedCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="REJECTED" className="gap-1">
                    Rejected
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-red-200 text-red-800">
                      {singleRoomRejectedCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1" />

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by participant or country..."
                    value={singleRoomSearchQuery}
                    onChange={(e) => setSingleRoomSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Participant</TableHead>
                      <TableHead className="font-semibold">Country</TableHead>
                      <TableHead className="font-semibold">Invoice</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSingleRoomInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="font-medium">{invoice.participant_name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{invoice.country_name}</span>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {invoice.number}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            ${invoice.amount?.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            {invoice.currency}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {invoice.proof_submitted_at ? (
                            format(new Date(invoice.proof_submitted_at), "MMM d, yyyy")
                          ) : (
                            <span className="text-gray-400">Not submitted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!invoice.proof_file ? (
                            <Badge className="bg-gray-100 text-gray-700 border-0 gap-1">
                              <FileText className="w-3 h-3" />
                              Awaiting Proof
                            </Badge>
                          ) : (
                            getStatusBadge(invoice.status)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.proof_file ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-gray-600"
                                onClick={() => apiDownloadAndOpen(`/v1/payments/admin/single-room-invoices/${invoice.id}/proof/download/`)}
                              >
                                <Eye className="w-4 h-4" />
                                View Proof
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-400 px-2">
                                No proof uploaded
                              </span>
                            )}
                            {invoice.proof_file && invoice.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                                  onClick={() => handleSingleRoomReview(invoice, "approve")}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleSingleRoomReview(invoice, "reject")}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {invoice.status !== "PENDING" && invoice.admin_comment && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedSingleRoom(invoice);
                                  setShowSingleRoomDialog(true);
                                  setSingleRoomAction(null);
                                }}
                              >
                                <MessageSquare className="w-4 h-4" />
                                Comment
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredSingleRoomInvoices.length === 0 && (
                <div className="text-center py-12">
                  <Bed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No single room invoices found</h3>
                  <p className="text-gray-500">
                    {singleRoomStatusFilter !== "all"
                      ? `No ${singleRoomStatusFilter.toLowerCase()} invoices to show`
                      : "No invoices match your search"}
                  </p>
                </div>
              )}
            </Tabs>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "Approve Payment"
                : reviewAction === "reject"
                ? "Reject Payment"
                : "Payment Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedPayment?.country_name} - Invoice {selectedPayment?.invoice?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold">
                  ${selectedPayment?.invoice?.amount?.toLocaleString()} {selectedPayment?.invoice?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted</span>
                <span>
                  {selectedPayment?.created_at &&
                    format(new Date(selectedPayment.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              {selectedPayment?.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reviewed</span>
                  <span>
                    {format(new Date(selectedPayment.reviewed_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              )}
            </div>

            {/* Existing comment (if viewing) */}
            {!reviewAction && selectedPayment?.admin_comment && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Admin Comment</p>
                <p className="text-gray-600">{selectedPayment.admin_comment}</p>
              </div>
            )}

            {/* Comment input (if reviewing) */}
            {reviewAction && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {reviewAction === "reject" ? (
                    <span className="text-red-600">Reason for rejection *</span>
                  ) : (
                    "Comment (optional)"
                  )}
                </label>
                <Textarea
                  placeholder={
                    reviewAction === "reject"
                      ? "Please provide a detailed reason for rejection..."
                      : "Add any notes about this payment..."
                  }
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {reviewAction === "reject" && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  The country will be notified of this rejection and will need to resubmit their payment proof.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              {reviewAction ? "Cancel" : "Close"}
            </Button>
            {reviewAction && (
              <Button
                onClick={submitReview}
                disabled={isSubmitting}
                className={
                  reviewAction === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : reviewAction === "approve" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Payment
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Payment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Room Review Dialog */}
      <Dialog open={showSingleRoomDialog} onOpenChange={setShowSingleRoomDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {singleRoomAction === "approve"
                ? "Approve Single Room Payment"
                : singleRoomAction === "reject"
                ? "Reject Single Room Payment"
                : "Payment Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedSingleRoom?.participant_name} - Invoice {selectedSingleRoom?.number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Participant</span>
                <span className="font-semibold">{selectedSingleRoom?.participant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Country</span>
                <span>{selectedSingleRoom?.country_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold">
                  ${selectedSingleRoom?.amount?.toLocaleString()} {selectedSingleRoom?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted</span>
                <span>
                  {selectedSingleRoom?.proof_submitted_at &&
                    format(new Date(selectedSingleRoom.proof_submitted_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              {selectedSingleRoom?.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reviewed</span>
                  <span>
                    {format(new Date(selectedSingleRoom.reviewed_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              )}
            </div>

            {/* Existing comment (if viewing) */}
            {!singleRoomAction && selectedSingleRoom?.admin_comment && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Admin Comment</p>
                <p className="text-gray-600">{selectedSingleRoom.admin_comment}</p>
              </div>
            )}

            {/* Comment input (if reviewing) */}
            {singleRoomAction && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {singleRoomAction === "reject" ? (
                    <span className="text-red-600">Reason for rejection *</span>
                  ) : (
                    "Comment (optional)"
                  )}
                </label>
                <Textarea
                  placeholder={
                    singleRoomAction === "reject"
                      ? "Please provide a detailed reason for rejection..."
                      : "Add any notes about this payment..."
                  }
                  value={singleRoomComment}
                  onChange={(e) => setSingleRoomComment(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {singleRoomAction === "reject" && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  The country will be notified of this rejection and will need to resubmit their payment proof.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSingleRoomDialog(false)}>
              {singleRoomAction ? "Cancel" : "Close"}
            </Button>
            {singleRoomAction && (
              <Button
                onClick={submitSingleRoomReview}
                disabled={isSubmitting}
                className={
                  singleRoomAction === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : singleRoomAction === "approve" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Payment
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Payment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
