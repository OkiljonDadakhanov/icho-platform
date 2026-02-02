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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Users,
  UserCircle,
  GraduationCap,
  Eye as EyeIcon,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  FileText,
  Globe,
  Shirt,
  UtensilsCrossed,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminParticipant } from "@/lib/services/admin";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { mapRoleToFrontend, mapGenderToFrontend } from "@/lib/types";

const roleColors: Record<string, string> = {
  TEAM_LEADER: "bg-[#2f3090] text-white",
  CONTESTANT: "bg-[#00795d] text-white",
  OBSERVER: "bg-purple-500 text-white",
  GUEST: "bg-orange-500 text-white",
  MENTOR: "bg-blue-500 text-white",
  HEAD_MENTOR: "bg-indigo-500 text-white",
};


export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<AdminParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedParticipant, setSelectedParticipant] = useState<AdminParticipant | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Get unique countries for filter
  const countries = Array.from(
    new Map(participants.map((p) => [p.country, { id: p.country, name: p.country_name, iso: p.country_iso }])).values()
  );

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getParticipants();
        setParticipants(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch participants:", err);
        setError(err?.message || "Failed to load participants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  useEffect(() => {
    let filtered = participants;

    if (roleFilter !== "all") {
      filtered = filtered.filter((p) => p.role === roleFilter);
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.passport_number.toLowerCase().includes(query) ||
          p.country_name?.toLowerCase().includes(query)
      );
    }

    setFilteredParticipants(filtered);
  }, [roleFilter, countryFilter, searchQuery, participants]);

  const handleExport = async () => {
    try {
      const blob = await adminService.exportParticipants({
        country: countryFilter !== "all" ? countryFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "participants.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Participants exported successfully");
    } catch (err: any) {
      toast.error("Failed to export participants");
    }
  };

  const viewDetails = (participant: AdminParticipant) => {
    setSelectedParticipant(participant);
    setShowDetailDialog(true);
  };

  // Stats
  const teamLeaders = participants.filter((p) => p.role === "TEAM_LEADER").length;
  const contestants = participants.filter((p) => p.role === "CONTESTANT").length;
  const observers = participants.filter((p) => p.role === "OBSERVER").length;
  const guests = participants.filter((p) => p.role === "GUEST").length;

  if (isLoading) {
    return <Loading message="Loading participants..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
          <p className="text-gray-500 mt-1">All registered participants across countries</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-[#2f3090] to-[#00795d]" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2f3090]/10 rounded-lg">
              <UserCircle className="w-5 h-5 text-[#2f3090]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamLeaders}</p>
              <p className="text-sm text-gray-500">Team Leaders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00795d]/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-[#00795d]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{contestants}</p>
              <p className="text-sm text-gray-500">Contestants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EyeIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{observers}</p>
              <p className="text-sm text-gray-500">Observers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guests}</p>
              <p className="text-sm text-gray-500">Guests</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, passport, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
              <SelectItem value="CONTESTANT">Contestant</SelectItem>
              <SelectItem value="OBSERVER">Observer</SelectItem>
              <SelectItem value="GUEST">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Participant</TableHead>
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => {
                const initials = participant.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TableRow key={participant.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={participant.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{participant.full_name}</p>
                          <p className="text-xs text-gray-500">{participant.passport_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w20/${participant.country_flag || participant.country_iso?.toLowerCase()}.png`}
                          alt={participant.country_name}
                          className="w-5 h-4 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "https://flagcdn.com/w20/un.png";
                          }}
                        />
                        <span className="text-sm">{participant.country_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[participant.role] || "bg-gray-500 text-white"}>
                        {mapRoleToFrontend(participant.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {mapGenderToFrontend(participant.gender)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{participant.email}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => viewDetails(participant)}
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No participants found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination info */}
        {filteredParticipants.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredParticipants.length} of {participants.length} participants
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Participant Details</DialogTitle>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedParticipant.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#2f3090] to-[#00795d] text-white text-xl">
                    {selectedParticipant.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedParticipant.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[selectedParticipant.role]}>
                      {mapRoleToFrontend(selectedParticipant.role)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img
                        src={`https://flagcdn.com/w20/${selectedParticipant.country_iso?.toLowerCase()}.png`}
                        alt={selectedParticipant.country_name}
                        className="w-5 h-4 object-cover rounded"
                      />
                      {selectedParticipant.country_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedParticipant.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium">
                      {format(parseISO(selectedParticipant.date_of_birth), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Passport</p>
                    <p className="text-sm font-medium">{selectedParticipant.passport_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium">{mapGenderToFrontend(selectedParticipant.gender)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shirt className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">T-Shirt Size</p>
                    <p className="text-sm font-medium">{selectedParticipant.tshirt_size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Dietary</p>
                    <p className="text-sm font-medium capitalize">
                      {selectedParticipant.dietary_requirements.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Registration</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Registered</span>
                  <span>{format(parseISO(selectedParticipant.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Last Updated</span>
                  <span>{format(parseISO(selectedParticipant.updated_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
