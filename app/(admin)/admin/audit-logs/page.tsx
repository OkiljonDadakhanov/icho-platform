"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Eye,
  Activity,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  CreditCard,
  Upload,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  LogIn,
  Key,
  FileText,
  Plane,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService } from "@/lib/services/admin";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { AuditLog } from "@/lib/types";

const actionIcons: Record<string, React.ElementType> = {
  CREATE: UserPlus,
  UPDATE: Edit,
  DELETE: Trash2,
  PAYMENT_UPLOAD: Upload,
  PAYMENT_APPROVE: CheckCircle2,
  PAYMENT_REJECT: XCircle,
  STAGE_LOCK: Lock,
  STAGE_UNLOCK: Unlock,
  LOGIN: LogIn,
  PASSWORD_CHANGE: Key,
  DOCUMENT_UPLOAD: FileText,
  TRAVEL_UPDATE: Plane,
  INVITATION_GENERATE: FileText,
  PARTICIPANT_CREATE: UserPlus,
  PARTICIPANT_UPDATE: Edit,
  PARTICIPANT_DELETE: UserMinus,
};

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  PAYMENT_UPLOAD: "bg-amber-100 text-amber-700",
  PAYMENT_APPROVE: "bg-emerald-100 text-emerald-700",
  PAYMENT_REJECT: "bg-red-100 text-red-700",
  STAGE_LOCK: "bg-gray-100 text-gray-700",
  STAGE_UNLOCK: "bg-amber-100 text-amber-700",
  LOGIN: "bg-blue-100 text-blue-700",
  PASSWORD_CHANGE: "bg-purple-100 text-purple-700",
  DOCUMENT_UPLOAD: "bg-indigo-100 text-indigo-700",
  TRAVEL_UPDATE: "bg-cyan-100 text-cyan-700",
  INVITATION_GENERATE: "bg-pink-100 text-pink-700",
  PARTICIPANT_CREATE: "bg-emerald-100 text-emerald-700",
  PARTICIPANT_UPDATE: "bg-blue-100 text-blue-700",
  PARTICIPANT_DELETE: "bg-red-100 text-red-700",
};

const formatActionName = (action: string) => {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
};

// Format field names to be human-readable
const formatFieldName = (field: string) => {
  return field
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

// Format field values for display
const formatFieldValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    // Check if it looks like a currency amount
    if (key.includes("amount") || key.includes("fee") || key.includes("total")) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  }
  if (typeof value === "string") {
    // Format status values
    if (key === "status" || key === "stage") {
      return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    }
    // Format type values
    if (key === "type") {
      return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    }
    // Check for dates
    if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      try {
        return format(parseISO(value), "MMM d, yyyy h:mm a");
      } catch {
        return value;
      }
    }
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

// Get color for status values
const getStatusColor = (value: string) => {
  const upperValue = value.toUpperCase();
  if (upperValue === "APPROVED" || upperValue === "COMPLETED" || upperValue === "ACTIVE") {
    return "text-emerald-700 bg-emerald-50";
  }
  if (upperValue === "REJECTED" || upperValue === "FAILED" || upperValue === "LOCKED") {
    return "text-red-700 bg-red-50";
  }
  if (upperValue === "PENDING" || upperValue === "OPEN") {
    return "text-amber-700 bg-amber-50";
  }
  return "";
};

// Render a single field nicely
const renderField = (key: string, value: unknown) => {
  const formattedValue = formatFieldValue(key, value);
  const isStatus = key === "status" || key === "stage" || key === "type";
  const statusColor = isStatus && typeof value === "string" ? getStatusColor(value) : "";

  return (
    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{formatFieldName(key)}</span>
      {isStatus && statusColor ? (
        <span className={`text-sm font-medium px-2 py-0.5 rounded ${statusColor}`}>
          {formattedValue}
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-900">{formattedValue}</span>
      )}
    </div>
  );
};


const availableActions = [
  "CREATE", "UPDATE", "DELETE",
  "PAYMENT_UPLOAD", "PAYMENT_APPROVE", "PAYMENT_REJECT",
  "STAGE_LOCK", "STAGE_UNLOCK",
  "LOGIN", "PASSWORD_CHANGE",
  "DOCUMENT_UPLOAD", "TRAVEL_UPDATE",
  "INVITATION_GENERATE",
  "PARTICIPANT_CREATE", "PARTICIPANT_UPDATE", "PARTICIPANT_DELETE",
];

const availableEntityTypes = [
  "Participant",
  "Payment",
  "CountryAccount",
  "CountryStageStatus",
  "TravelInfo",
  "DocumentFile",
  "PreRegistration",
  "Coordinator",
  "Invoice",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getAuditLogs({ page: 1, page_size: 100 });
        setLogs(data.results);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch audit logs:", err);
        setError(err?.message || "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (entityTypeFilter !== "all") {
      filtered = filtered.filter((log) => log.entity_type === entityTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.actor?.toLowerCase().includes(query) ||
          log.country?.toLowerCase().includes(query) ||
          log.entity_type.toLowerCase().includes(query) ||
          log.reason?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [actionFilter, entityTypeFilter, searchQuery, logs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return <Loading message="Loading audit logs..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activity and changes</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={async () => {
            try {
              setIsLoading(true);
              const data = await adminService.getAuditLogs({ page: 1, page_size: 100 });
              setLogs(data.results);
              toast.success("Audit logs refreshed");
            } catch (err: any) {
              toast.error("Failed to refresh audit logs");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by actor, country, entity, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {availableActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {formatActionName(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {availableEntityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold w-[180px]">Timestamp</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Actor</TableHead>
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Entity</TableHead>
                <TableHead className="font-semibold text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => {
                const Icon = actionIcons[log.action] || Activity;
                const colorClass = actionColors[log.action] || "bg-gray-100 text-gray-700";

                return (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm text-gray-600">
                      <div>
                        <p>{format(parseISO(log.created_at), "MMM d, yyyy")}</p>
                        <p className="text-xs text-gray-400">
                          {format(parseISO(log.created_at), "h:mm:ss a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${colorClass} border-0 gap-1`}>
                        <Icon className="w-3 h-3" />
                        {formatActionName(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{log.actor || "System"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.country || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{log.entity_type}</p>
                        <p className="text-xs text-gray-500 font-mono">{log.entity_id.slice(0, 12)}...</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => viewDetails(log)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No logs found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={currentPage === pageNum ? "bg-[#2f3090]" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <Badge className={`${actionColors[selectedLog.action]} border-0`}>
                  {formatActionName(selectedLog.action)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(parseISO(selectedLog.created_at), "MMMM d, yyyy 'at' h:mm:ss a")}
                </span>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Actor</p>
                  <p className="font-medium">{selectedLog.actor || "System"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Country</p>
                  <p className="font-medium">{selectedLog.country || "-"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Entity Type</p>
                  <p className="font-medium">{selectedLog.entity_type}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Entity ID</p>
                  <p className="font-medium font-mono text-sm">{selectedLog.entity_id}</p>
                </div>
              </div>

              {/* Reason */}
              {selectedLog.reason && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 mb-1">Reason</p>
                  <p className="text-amber-900">{selectedLog.reason}</p>
                </div>
              )}

              {/* Before/After Data */}
              {(selectedLog.before_json || selectedLog.after_json) && (
                <div className="space-y-3">
                  {selectedLog.before_json && Object.keys(selectedLog.before_json).length > 0 && (
                    <div className="rounded-lg border border-red-200 overflow-hidden">
                      <div className="px-3 py-2 bg-red-50 border-b border-red-200">
                        <p className="text-xs font-medium text-red-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Before
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-white">
                        {Object.entries(selectedLog.before_json).map(([key, value]) =>
                          renderField(key, value)
                        )}
                      </div>
                    </div>
                  )}
                  {selectedLog.after_json && Object.keys(selectedLog.after_json).length > 0 && (
                    <div className="rounded-lg border border-emerald-200 overflow-hidden">
                      <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-200">
                        <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          After
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-white">
                        {Object.entries(selectedLog.after_json).map(([key, value]) =>
                          renderField(key, value)
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
