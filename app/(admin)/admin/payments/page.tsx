"use client";

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
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminPayment } from "@/lib/services/admin";
import { toast } from "sonner";
import { format } from "date-fns";


export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getPayments();
        setPayments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setError("Failed to load payments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.country_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.invoice?.number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [statusFilter, searchQuery, payments]);

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
      // await adminService[reviewAction === "approve" ? "approvePayment" : "rejectPayment"](
      //   selectedPayment.id,
      //   adminComment
      // );

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

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
    } catch (err) {
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

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const approvedCount = payments.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = payments.filter((p) => p.status === "REJECTED").length;
  const totalAmount = payments
    .filter((p) => p.status === "APPROVED")
    .reduce((acc, p) => acc + (p.invoice?.amount || 0), 0);

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
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                          src={`https://flagcdn.com/w40/${payment.country_iso?.toLowerCase()}.png`}
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
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {payment.invoice?.number}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        ${payment.invoice?.amount?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        {payment.invoice?.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-gray-600"
                          onClick={() => {
                            // View proof file
                            toast.info("Opening payment proof...");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Proof
                        </Button>
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
    </div>
  );
}
