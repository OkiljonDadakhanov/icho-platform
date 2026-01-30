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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Plane,
  Calendar,
  Clock,
  Building,
  FileText,
  Users,
  BedDouble,
  UserCircle,
  GraduationCap,
  Eye as EyeIcon,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminTravelInfo, type AdminAccommodation } from "@/lib/services/admin";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { mapRoleToFrontend, type ParticipantRole } from "@/lib/types";

const roleColors: Record<string, string> = {
  TEAM_LEADER: "bg-[#2f3090] text-white",
  CONTESTANT: "bg-[#00795d] text-white",
  OBSERVER: "bg-purple-500 text-white",
  GUEST: "bg-orange-500 text-white",
};

export default function TravelPage() {
  const [activeTab, setActiveTab] = useState("travel");
  const [travelInfo, setTravelInfo] = useState<AdminTravelInfo[]>([]);
  const [accommodation, setAccommodation] = useState<AdminAccommodation[]>([]);
  const [filteredTravel, setFilteredTravel] = useState<AdminTravelInfo[]>([]);
  const [filteredAccommodation, setFilteredAccommodation] = useState<AdminAccommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedTravel, setSelectedTravel] = useState<AdminTravelInfo | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AdminAccommodation | null>(null);
  const [showTravelDialog, setShowTravelDialog] = useState(false);
  const [showAccommodationDialog, setShowAccommodationDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get unique countries from travel info
  const countries = Array.from(
    new Map(travelInfo.map((t) => [t.country, { id: t.country, name: t.country_name, iso: t.country_iso }])).values()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [travelData, accommodationData] = await Promise.all([
          adminService.getTravelInfo(),
          adminService.getAccommodation(),
        ]);
        setTravelInfo(travelData);
        setAccommodation(accommodationData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch travel data:", err);
        setError(err?.message || "Failed to load travel data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter travel info
  useEffect(() => {
    let filtered = travelInfo;

    if (countryFilter !== "all") {
      filtered = filtered.filter((t) => t.country === countryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.participant_name.toLowerCase().includes(query) ||
          t.country_name?.toLowerCase().includes(query) ||
          t.flight_number?.toLowerCase().includes(query) ||
          t.airline?.toLowerCase().includes(query)
      );
    }

    setFilteredTravel(filtered);
  }, [countryFilter, searchQuery, travelInfo]);

  // Filter accommodation
  useEffect(() => {
    let filtered = accommodation;

    if (countryFilter !== "all") {
      filtered = filtered.filter((a) => a.country === countryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.participant_name.toLowerCase().includes(query) ||
          a.country_name?.toLowerCase().includes(query)
      );
    }

    setFilteredAccommodation(filtered);
  }, [countryFilter, searchQuery, accommodation]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminService.exportTravelData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "icho_travel.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Travel data exported successfully");
    } catch (err: any) {
      console.error("Failed to export travel data:", err);
      toast.error("Failed to export travel data");
    } finally {
      setIsExporting(false);
    }
  };

  const viewTravelDetails = (travel: AdminTravelInfo) => {
    setSelectedTravel(travel);
    setShowTravelDialog(true);
  };

  const viewAccommodationDetails = (accom: AdminAccommodation) => {
    setSelectedAccommodation(accom);
    setShowAccommodationDialog(true);
  };

  // Stats
  const totalTravel = travelInfo.length;
  const withFlights = travelInfo.filter((t) => t.flight_number).length;
  const totalAccommodation = accommodation.length;
  const singleRooms = accommodation.filter((a) => a.room_type === "SINGLE").length;

  if (isLoading) {
    return <Loading message="Loading travel data..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel & Accommodation</h1>
          <p className="text-gray-500 mt-1">Manage travel info and accommodation preferences</p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:opacity-90"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? "Exporting..." : "Export Travel"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTravel}</p>
              <p className="text-sm text-gray-500">Travel Records</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{withFlights}</p>
              <p className="text-sm text-gray-500">With Flight Info</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAccommodation}</p>
              <p className="text-sm text-gray-500">Accommodation</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BedDouble className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{singleRooms}</p>
              <p className="text-sm text-gray-500">Single Rooms</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="travel" className="gap-2">
            <Plane className="w-4 h-4" />
            Travel Info
          </TabsTrigger>
          <TabsTrigger value="accommodation" className="gap-2">
            <Building className="w-4 h-4" />
            Accommodation
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-6 mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, country, flight number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

          <TabsContent value="travel" className="mt-0">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Participant</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Arrival</TableHead>
                    <TableHead className="font-semibold">Departure</TableHead>
                    <TableHead className="font-semibold">Flight</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTravel.map((travel) => (
                    <TableRow key={travel.id} className="hover:bg-gray-50">
                      <TableCell>
                        <p className="font-medium text-gray-900">{travel.participant_name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${travel.country_iso?.toLowerCase().slice(0, 2)}.png`}
                            alt={travel.country_name}
                            className="w-5 h-4 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://flagcdn.com/w20/un.png";
                            }}
                          />
                          <span className="text-sm">{travel.country_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[travel.participant_role] || "bg-gray-500 text-white"}>
                          {mapRoleToFrontend(travel.participant_role as ParticipantRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {travel.arrival_datetime ? (
                          <div className="text-sm">
                            <p>{format(parseISO(travel.arrival_datetime), "MMM d, yyyy")}</p>
                            <p className="text-gray-500">{format(parseISO(travel.arrival_datetime), "HH:mm")}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {travel.departure_datetime ? (
                          <div className="text-sm">
                            <p>{format(parseISO(travel.departure_datetime), "MMM d, yyyy")}</p>
                            <p className="text-gray-500">{format(parseISO(travel.departure_datetime), "HH:mm")}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {travel.flight_number ? (
                          <div className="text-sm">
                            <p className="font-medium">{travel.flight_number}</p>
                            <p className="text-gray-500">{travel.airline}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => viewTravelDetails(travel)}
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTravel.length === 0 && (
              <div className="text-center py-12">
                <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No travel records found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
              </div>
            )}

            {filteredTravel.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredTravel.length} of {travelInfo.length} records
              </div>
            )}
          </TabsContent>

          <TabsContent value="accommodation" className="mt-0">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Participant</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Room Type</TableHead>
                    <TableHead className="font-semibold">Invoice Status</TableHead>
                    <TableHead className="font-semibold">Special</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccommodation.map((accom) => (
                    <TableRow key={accom.id} className="hover:bg-gray-50">
                      <TableCell>
                        <p className="font-medium text-gray-900">{accom.participant_name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w20/${accom.country_iso?.toLowerCase().slice(0, 2)}.png`}
                            alt={accom.country_name}
                            className="w-5 h-4 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://flagcdn.com/w20/un.png";
                            }}
                          />
                          <span className="text-sm">{accom.country_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[accom.participant_role] || "bg-gray-500 text-white"}>
                          {mapRoleToFrontend(accom.participant_role as ParticipantRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {accom.room_type.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {accom.room_type === "SINGLE" && accom.single_room_invoice_status ? (
                          <Badge
                            variant="outline"
                            className={
                              accom.single_room_invoice_status === "APPROVED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : accom.single_room_invoice_status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {accom.single_room_invoice_status}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {accom.early_check_in && (
                            <Badge variant="secondary" className="text-xs">Early</Badge>
                          )}
                          {accom.late_check_out && (
                            <Badge variant="secondary" className="text-xs">Late</Badge>
                          )}
                          {accom.additional_nights_before > 0 && (
                            <Badge variant="secondary" className="text-xs">+{accom.additional_nights_before} before</Badge>
                          )}
                          {accom.additional_nights_after > 0 && (
                            <Badge variant="secondary" className="text-xs">+{accom.additional_nights_after} after</Badge>
                          )}
                          {!accom.early_check_in && !accom.late_check_out && accom.additional_nights_before === 0 && accom.additional_nights_after === 0 && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => viewAccommodationDetails(accom)}
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAccommodation.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No accommodation records found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query</p>
              </div>
            )}

            {filteredAccommodation.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredAccommodation.length} of {accommodation.length} records
              </div>
            )}
          </TabsContent>
        </Card>
      </Tabs>

      {/* Travel Detail Dialog */}
      <Dialog open={showTravelDialog} onOpenChange={setShowTravelDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Travel Details</DialogTitle>
          </DialogHeader>

          {selectedTravel && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTravel.participant_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[selectedTravel.participant_role]}>
                      {mapRoleToFrontend(selectedTravel.participant_role as ParticipantRole)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img
                        src={`https://flagcdn.com/w20/${selectedTravel.country_iso?.toLowerCase().slice(0, 2)}.png`}
                        alt=""
                        className="w-5 h-4 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "https://flagcdn.com/w20/un.png";
                        }}
                      />
                      {selectedTravel.country_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Arrival</p>
                    <p className="text-sm font-medium">
                      {selectedTravel.arrival_datetime
                        ? format(parseISO(selectedTravel.arrival_datetime), "MMM d, yyyy HH:mm")
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Departure</p>
                    <p className="text-sm font-medium">
                      {selectedTravel.departure_datetime
                        ? format(parseISO(selectedTravel.departure_datetime), "MMM d, yyyy HH:mm")
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Plane className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Flight Number</p>
                    <p className="text-sm font-medium">{selectedTravel.flight_number || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Airline</p>
                    <p className="text-sm font-medium">{selectedTravel.airline || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {selectedTravel.ticket_file && (
                <div className="pt-4 border-t">
                  <a
                    href={selectedTravel.ticket_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    View Ticket File
                  </a>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t text-xs text-gray-500">
                <p>Created: {format(parseISO(selectedTravel.created_at), "MMM d, yyyy HH:mm")}</p>
                <p>Updated: {format(parseISO(selectedTravel.updated_at), "MMM d, yyyy HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accommodation Detail Dialog */}
      <Dialog open={showAccommodationDialog} onOpenChange={setShowAccommodationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Accommodation Details</DialogTitle>
          </DialogHeader>

          {selectedAccommodation && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedAccommodation.participant_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[selectedAccommodation.participant_role]}>
                      {mapRoleToFrontend(selectedAccommodation.participant_role as ParticipantRole)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img
                        src={`https://flagcdn.com/w20/${selectedAccommodation.country_iso?.toLowerCase().slice(0, 2)}.png`}
                        alt=""
                        className="w-5 h-4 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "https://flagcdn.com/w20/un.png";
                        }}
                      />
                      {selectedAccommodation.country_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Room Invoice Status */}
              {selectedAccommodation.room_type === "SINGLE" && selectedAccommodation.single_room_invoice_status && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  selectedAccommodation.single_room_invoice_status === "APPROVED"
                    ? "bg-green-50 border border-green-200"
                    : selectedAccommodation.single_room_invoice_status === "REJECTED"
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}>
                  <span className={`text-sm font-medium ${
                    selectedAccommodation.single_room_invoice_status === "APPROVED"
                      ? "text-green-700"
                      : selectedAccommodation.single_room_invoice_status === "REJECTED"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}>
                    Single room invoice status: {selectedAccommodation.single_room_invoice_status}
                  </span>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <BedDouble className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Room Type</p>
                    <p className="text-sm font-medium capitalize">{selectedAccommodation.room_type.toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Preferred Roommate</p>
                    <p className="text-sm font-medium">{selectedAccommodation.preferred_roommate || "None"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Check-in/out</p>
                    <p className="text-sm font-medium">
                      {selectedAccommodation.early_check_in ? "Early check-in" : "Standard"}
                      {selectedAccommodation.early_check_in && selectedAccommodation.late_check_out && " / "}
                      {selectedAccommodation.late_check_out ? "Late check-out" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Additional Nights</p>
                    <p className="text-sm font-medium">
                      {selectedAccommodation.additional_nights_before > 0 && `+${selectedAccommodation.additional_nights_before} before`}
                      {selectedAccommodation.additional_nights_before > 0 && selectedAccommodation.additional_nights_after > 0 && ", "}
                      {selectedAccommodation.additional_nights_after > 0 && `+${selectedAccommodation.additional_nights_after} after`}
                      {selectedAccommodation.additional_nights_before === 0 && selectedAccommodation.additional_nights_after === 0 && "None"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAccommodation.accessibility_requirements && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Accessibility Requirements</p>
                  <p className="text-sm">{selectedAccommodation.accessibility_requirements}</p>
                </div>
              )}

              {selectedAccommodation.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedAccommodation.notes}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-4 border-t text-xs text-gray-500">
                <p>Created: {format(parseISO(selectedAccommodation.created_at), "MMM d, yyyy HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
