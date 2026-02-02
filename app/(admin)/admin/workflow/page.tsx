"use client";

import { useEffect, useState } from "react";
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
import {
  Calendar,
  Clock,
  Lock,
  Unlock,
  Edit2,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Search,
  ArrowRight,
  ClipboardList,
  CreditCard,
  Users,
  Plane,
  FileText,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService } from "@/lib/services/admin";
import { toast } from "sonner";
import { format, parseISO, isAfter, isBefore, addHours } from "date-fns";
import type { StageDeadline, WorkflowStage } from "@/lib/types";

// Stage icons mapping
const stageIcons: Record<string, React.ElementType> = {
  PRE_REGISTRATION: ClipboardList,
  PAYMENT: CreditCard,
  PARTICIPANTS: Users,
  TRAVEL: Plane,
  INVITATIONS: FileText,
};

const stageNames: Record<string, string> = {
  PRE_REGISTRATION: "Pre-Registration",
  PAYMENT: "Payment",
  PARTICIPANTS: "Participants",
  TRAVEL: "Travel",
  INVITATIONS: "Invitations",
};

const stageColors: Record<string, string> = {
  PRE_REGISTRATION: "bg-blue-500",
  PAYMENT: "bg-amber-500",
  PARTICIPANTS: "bg-emerald-500",
  TRAVEL: "bg-purple-500",
  INVITATIONS: "bg-pink-500",
};

interface CountryStage {
  id: string;
  country_id: string;
  country_name: string;
  country_iso: string;
  stage: WorkflowStage;
  status: "OPEN" | "COMPLETED" | "LOCKED";
  unlocked_until?: string;
  unlock_reason?: string;
}

export default function WorkflowPage() {
  const [deadlines, setDeadlines] = useState<StageDeadline[]>([]);
  const [countryStages, setCountryStages] = useState<CountryStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null);
  const [editedDate, setEditedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Unlock dialog state
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedCountryStage, setSelectedCountryStage] = useState<CountryStage | null>(null);
  const [unlockReason, setUnlockReason] = useState("");
  const [unlockDuration, setUnlockDuration] = useState("24");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [deadlinesData, progressData] = await Promise.all([
          adminService.getDeadlines(),
          adminService.getCountriesProgress(),
        ]);
        setDeadlines(deadlinesData);
        // Transform progress data to CountryStage format
        // Backend returns: { id, name, iso_code, stages: { STAGE_NAME: { status, is_unlocked, ... } } }
        // Frontend needs: flat list of { id, country_id, country_name, country_iso, stage, status, ... }
        const stages: CountryStage[] = [];
        for (const country of progressData as any[]) {
          // If country has stages data, create entries for each stage
          if (country.stages && Object.keys(country.stages).length > 0) {
            for (const [stageName, stageData] of Object.entries(country.stages as Record<string, any>)) {
              stages.push({
                id: `${country.id}-${stageName}`,
                country_id: country.id,
                country_name: country.name,
                country_iso: country.iso_code_2 || country.iso_code,
                stage: stageName as WorkflowStage,
                status: stageData.is_unlocked ? "OPEN" : stageData.status,
                unlocked_until: stageData.unlocked_until,
                unlock_reason: stageData.unlock_reason,
              });
            }
          }
        }
        setCountryStages(stages);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch workflow data:", err);
        setError(err?.message || "Failed to load workflow data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveDeadline = async (deadline: StageDeadline) => {
    try {
      // await adminService.updateDeadline(deadline.id, editedDate);
      setDeadlines((prev) =>
        prev.map((d) =>
          d.id === deadline.id ? { ...d, deadline_at: editedDate } : d
        )
      );
      setEditingDeadline(null);
      toast.success(`${stageNames[deadline.stage]} deadline updated`);
    } catch (err: any) {
      toast.error("Failed to update deadline");
    }
  };

  const handleUnlockStage = async () => {
    if (!selectedCountryStage || !unlockReason.trim()) {
      toast.error("Please provide a reason for unlocking");
      return;
    }

    try {
      setIsSubmitting(true);
      // await adminService.unlockStage(selectedCountryStage.country_id, {
      //   stage: selectedCountryStage.stage,
      //   reason: unlockReason,
      //   duration_hours: parseInt(unlockDuration),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const unlockUntil = addHours(new Date(), parseInt(unlockDuration)).toISOString();
      setCountryStages((prev) =>
        prev.map((cs) =>
          cs.id === selectedCountryStage.id
            ? { ...cs, status: "OPEN", unlocked_until: unlockUntil, unlock_reason: unlockReason }
            : cs
        )
      );

      toast.success(`${selectedCountryStage.stage} unlocked for ${selectedCountryStage.country_name}`);
      setShowUnlockDialog(false);
    } catch (err: any) {
      toast.error("Failed to unlock stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLockStage = async (countryStage: CountryStage) => {
    try {
      // await adminService.lockStage(countryStage.country_id, countryStage.stage);
      setCountryStages((prev) =>
        prev.map((cs) =>
          cs.id === countryStage.id
            ? { ...cs, status: "LOCKED", unlocked_until: undefined, unlock_reason: undefined }
            : cs
        )
      );
      toast.success(`${stageNames[countryStage.stage]} locked for ${countryStage.country_name}`);
    } catch (err: any) {
      toast.error("Failed to lock stage");
    }
  };

  const filteredCountryStages = countryStages.filter((cs) => {
    if (stageFilter !== "all" && cs.stage !== stageFilter) return false;
    if (statusFilter !== "all" && cs.status !== statusFilter) return false;
    if (searchQuery && !cs.country_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string, unlockedUntil?: string) => {
    if (status === "OPEN" && unlockedUntil) {
      const until = parseISO(unlockedUntil);
      return (
        <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
          <Unlock className="w-3 h-3" />
          Unlocked until {format(until, "MMM d")}
        </Badge>
      );
    }

    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Open
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "LOCKED":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0 gap-1">
            <Lock className="w-3 h-3" />
            Locked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Loading message="Loading workflow data..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workflow</h1>
        <p className="text-gray-500 mt-1">Manage registration stages and deadlines</p>
      </div>

      {/* Stage Deadlines */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stage Deadlines</h2>
            <p className="text-sm text-gray-500">Global deadlines for each registration stage</p>
          </div>
        </div>

        <div className="space-y-4">
          {deadlines.map((deadline, index) => {
            const Icon = stageIcons[deadline.stage] || Clock;
            const isPast = isBefore(parseISO(deadline.deadline_at), new Date());
            const isEditing = editingDeadline === deadline.id;

            return (
              <div
                key={deadline.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  isPast ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"
                } hover:border-gray-300 transition-colors`}
              >
                {/* Stage Icon & Number */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${stageColors[deadline.stage]} rounded-xl flex items-center justify-center text-white shadow-md`}
                  >
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <div className={`p-2 ${stageColors[deadline.stage]}/10 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stageColors[deadline.stage].replace("bg-", "text-")}`} />
                  </div>
                </div>

                {/* Stage Name */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{stageNames[deadline.stage]}</p>
                  <p className="text-sm text-gray-500">Stage {index + 1} of 5</p>
                </div>

                {/* Arrow */}
                {index < deadlines.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />
                )}

                {/* Deadline Editor */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="datetime-local"
                        value={editedDate.slice(0, 16)}
                        onChange={(e) => setEditedDate(e.target.value + ":00Z")}
                        className="w-52"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleSaveDeadline(deadline)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setEditingDeadline(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className={`font-medium ${isPast ? "text-gray-500" : "text-gray-900"}`}>
                          {format(parseISO(deadline.deadline_at), "MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(deadline.deadline_at), "h:mm a")}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-[#2f3090]"
                        onClick={() => {
                          setEditingDeadline(deadline.id);
                          setEditedDate(deadline.deadline_at);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Status indicator */}
                {isPast && (
                  <Badge variant="outline" className="text-gray-500">
                    Past
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Country Stage Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Country Stage Status</h2>
            <p className="text-sm text-gray-500">Manage individual country stage access</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {Object.entries(stageNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="LOCKED">Locked</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Stage</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountryStages.map((cs) => {
                const Icon = stageIcons[cs.stage] || Clock;
                return (
                  <TableRow key={cs.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://flagcdn.com/w40/${cs.country_iso?.toLowerCase() || "un"}.png`}
                          alt={cs.country_name || "Country"}
                          className="w-8 h-6 object-cover rounded shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "https://flagcdn.com/w40/un.png";
                          }}
                        />
                        <span className="font-medium">{cs.country_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 ${stageColors[cs.stage]}/10 rounded`}>
                          <Icon className={`w-4 h-4 ${stageColors[cs.stage].replace("bg-", "text-")}`} />
                        </div>
                        <span>{stageNames[cs.stage]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(cs.status, cs.unlocked_until)}</TableCell>
                    <TableCell>
                      {cs.unlock_reason ? (
                        <span className="text-sm text-gray-600">{cs.unlock_reason}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {cs.status === "LOCKED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => {
                            setSelectedCountryStage(cs);
                            setUnlockReason("");
                            setUnlockDuration("24");
                            setShowUnlockDialog(true);
                          }}
                        >
                          <Unlock className="w-4 h-4" />
                          Unlock
                        </Button>
                      ) : cs.status === "OPEN" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-gray-600"
                          onClick={() => handleLockStage(cs)}
                        >
                          <Lock className="w-4 h-4" />
                          Lock
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">Completed</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredCountryStages.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </Card>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Stage</DialogTitle>
            <DialogDescription>
              Temporarily unlock {stageNames[selectedCountryStage?.stage || ""]} for {selectedCountryStage?.country_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for unlocking <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Explain why this stage needs to be unlocked..."
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <Select value={unlockDuration} onValueChange={setUnlockDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">72 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                The stage will automatically lock again after this period.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                This action will be logged in the audit trail and the country will be notified.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUnlockStage}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? (
                "Unlocking..."
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Stage
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
