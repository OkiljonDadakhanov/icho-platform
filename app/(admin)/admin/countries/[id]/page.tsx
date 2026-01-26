"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Key,
  ToggleLeft,
  ToggleRight,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Mail,
  Calendar,
  FileText,
  Plane,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminCountry, type AdminParticipant } from "@/lib/services/admin";
import { toast } from "sonner";

export default function CountryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;

  const [country, setCountry] = useState<AdminCountry | null>(null);
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [countryData, participantsData] = await Promise.all([
          adminService.getCountry(countryId),
          adminService.getParticipants({ country: countryId }),
        ]);
        setCountry(countryData);
        setParticipants(participantsData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch country details:", err);
        setError(err?.message || "Failed to load country details");
      } finally {
        setIsLoading(false);
      }
    };

    if (countryId) {
      fetchData();
    }
  }, [countryId]);

  const handleToggleStatus = async () => {
    if (!country) return;

    try {
      setIsTogglingStatus(true);
      const updated = await adminService.toggleCountryStatus(country.id, !country.is_active);
      setCountry(updated);
      toast.success(`${country.name} has been ${country.is_active ? "deactivated" : "activated"}`);
    } catch (err: any) {
      toast.error("Failed to update country status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleRegeneratePassword = async () => {
    if (!country) return;

    try {
      setIsRegenerating(true);
      const result = await adminService.regeneratePassword(country.id);
      setGeneratedPassword(result.password);
      toast.success("Password regenerated successfully");
    } catch (err: any) {
      toast.error("Failed to regenerate password");
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast.success("Password copied to clipboard");
    }
  };

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            No payment
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      TEAM_LEADER: "bg-purple-100 text-purple-700",
      CONTESTANT: "bg-blue-100 text-blue-700",
      OBSERVER: "bg-amber-100 text-amber-700",
      GUEST: "bg-gray-100 text-gray-700",
      MENTOR: "bg-emerald-100 text-emerald-700",
      HEAD_MENTOR: "bg-indigo-100 text-indigo-700",
    };
    return (
      <Badge className={`${colors[role] || "bg-gray-100 text-gray-700"} border-0`}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return <Loading message="Loading country details..." />;
  }

  if (error || !country) {
    return <ErrorDisplay message={error || "Country not found"} />;
  }

  const preReg = country.pre_registration;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/countries")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <img
            src={`https://flagcdn.com/w80/${country.iso_code?.toLowerCase() || "un"}.png`}
            alt={country.name || "Country"}
            className="w-16 h-12 object-cover rounded shadow-sm"
            onError={(e) => {
              e.currentTarget.src = "https://flagcdn.com/w80/un.png";
            }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{country.name || "Unknown Country"}</h1>
            <p className="text-gray-500">{country.iso_code || "N/A"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setGeneratedPassword(null);
              setShowPasswordDialog(true);
            }}
          >
            <Key className="w-4 h-4 mr-2" />
            Regenerate Password
          </Button>
          <Button
            variant={country.is_active ? "destructive" : "default"}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
          >
            {isTogglingStatus ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : country.is_active ? (
              <ToggleLeft className="w-4 h-4 mr-2" />
            ) : (
              <ToggleRight className="w-4 h-4 mr-2" />
            )}
            {country.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {country.participant_count || 0}
              </p>
              <p className="text-sm text-gray-500">Participants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              {getPaymentBadge(country.payment_status)}
              <p className="text-sm text-gray-500 mt-1">Payment</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <Badge
                className={
                  country.is_active
                    ? "bg-emerald-100 text-emerald-700 border-0"
                    : "bg-gray-100 text-gray-700 border-0"
                }
              >
                {country.is_active ? "Active" : "Inactive"}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">Status</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {country.created_at
                  ? new Date(country.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500">Registered</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Info & Pre-Registration */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                {country.account?.username || "N/A"}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <Badge
                className={
                  country.account?.is_active
                    ? "bg-emerald-100 text-emerald-700 border-0"
                    : "bg-red-100 text-red-700 border-0"
                }
              >
                {country.account?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Pre-Registration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pre-Registration
          </h2>
          {preReg ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Team Leaders</p>
                  <p className="font-medium">{preReg.num_team_leaders}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contestants</p>
                  <p className="font-medium">{preReg.num_contestants}</p>
                </div>
                <div>
                  <p className="text-gray-500">Observers</p>
                  <p className="font-medium">{preReg.num_observers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-medium">{preReg.num_guests}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-gray-500 text-sm">Total Fee</p>
                <p className="text-xl font-bold text-gray-900">
                  ${preReg.fee_total?.toLocaleString() || 0}
                </p>
              </div>
              {preReg.submitted_at && (
                <div className="pt-2 border-t">
                  <p className="text-gray-500 text-sm">Submitted</p>
                  <p className="text-sm">
                    {new Date(preReg.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No pre-registration submitted</p>
          )}
        </Card>
      </div>

      {/* Participants Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </h2>

        {participants.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Passport</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{participant.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {participant.gender} | DOB:{" "}
                          {participant.date_of_birth
                            ? new Date(participant.date_of_birth).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(participant.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {participant.email || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {participant.passport_number || "N/A"}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No participants registered yet</p>
          </div>
        )}
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate Password</DialogTitle>
            <DialogDescription>
              Generate a new password for {country.name}. The old password will be
              invalidated.
            </DialogDescription>
          </DialogHeader>

          {generatedPassword ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">New Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border rounded font-mono text-lg">
                    {generatedPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                    className={copiedPassword ? "text-emerald-600" : ""}
                  >
                    {copiedPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Make sure to copy and securely share this password with the country
                representative.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to regenerate the password for{" "}
                <strong>{country.name}</strong>? This action cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              {generatedPassword ? "Close" : "Cancel"}
            </Button>
            {!generatedPassword && (
              <Button
                onClick={handleRegeneratePassword}
                disabled={isRegenerating}
                className="bg-gradient-to-r from-[#2f3090] to-[#00795d]"
              >
                {isRegenerating && (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                )}
                Regenerate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
