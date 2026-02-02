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
  ArrowLeft,
  Key,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminCountry, type AdminParticipant } from "@/lib/services/admin";

export default function CountryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.id as string;

  const [country, setCountry] = useState<AdminCountry | null>(null);
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            src={`https://flagcdn.com/w80/${country.iso_code_2 || country.iso_code?.toLowerCase().slice(0, 2) || "un"}.png`}
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

    </div>
  );
}
