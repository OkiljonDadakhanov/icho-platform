"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
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
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { adminService, type AdminCountry } from "@/lib/services/admin";
import { toast } from "sonner";


export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<AdminCountry[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<AdminCountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<AdminCountry | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleViewDetails = (country: AdminCountry) => {
    router.push(`/admin/countries/${country.id}`);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getCountries();
        setCountries(data);
        setFilteredCountries(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch countries:", err);
        setError(err?.message || "Failed to load countries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = countries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.iso_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.account?.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchQuery, countries]);

  const handleToggleStatus = async (country: AdminCountry) => {
    try {
      // const updated = await adminService.toggleCountryStatus(country.id, !country.is_active);
      setCountries((prev) =>
        prev.map((c) =>
          c.id === country.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      toast.success(`${country.name} has been ${country.is_active ? "deactivated" : "activated"}`);
    } catch (err: any) {
      toast.error("Failed to update country status");
    }
  };

  const handleRegeneratePassword = async () => {
    if (!selectedCountry) return;

    try {
      setIsRegenerating(true);
      // const result = await adminService.regeneratePassword(selectedCountry.id);
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-4).toUpperCase();
      setGeneratedPassword(newPassword);
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

  const handleExportCredentials = async () => {
    try {
      const blob = await adminService.exportCredentials();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "country_credentials.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Credentials exported successfully");
    } catch (err: any) {
      toast.error("Failed to export credentials");
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

  if (isLoading) {
    return <Loading message="Loading countries..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-500 mt-1">
            Manage country accounts and credentials
          </p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#2f3090] to-[#00795d] hover:opacity-90"
          onClick={handleExportCredentials}
        >
          <Download className="w-4 h-4" />
          Export Credentials
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{countries.length}</p>
              <p className="text-sm text-gray-500">Total Countries</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {countries.filter((c) => c.is_active).length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {countries.filter((c) => c.payment_status === "PENDING").length}
              </p>
              <p className="text-sm text-gray-500">Pending Payment</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {countries.reduce((acc, c) => acc + (c.participant_count || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Participants</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Table */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search countries by name, code, or username..."
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
                <TableHead className="font-semibold">Username</TableHead>
                <TableHead className="font-semibold">Participants</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.map((country) => (
                <TableRow
                  key={country.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(country)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://flagcdn.com/w40/${country.iso_code.toLowerCase()}.png`}
                        alt={country.name}
                        className="w-8 h-6 object-cover rounded shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = "https://flagcdn.com/w40/un.png";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{country.name}</p>
                        <p className="text-xs text-gray-500">{country.iso_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {country.account?.username}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{country.participant_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPaymentBadge(country.payment_status)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        country.is_active
                          ? "bg-emerald-100 text-emerald-700 border-0"
                          : "bg-gray-100 text-gray-700 border-0"
                      }
                    >
                      {country.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleViewDetails(country)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setSelectedCountry(country);
                            setGeneratedPassword(null);
                            setShowPasswordDialog(true);
                          }}
                        >
                          <Key className="w-4 h-4" />
                          Regenerate Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleToggleStatus(country)}
                        >
                          {country.is_active ? (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No countries found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )}
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerate Password</DialogTitle>
            <DialogDescription>
              Generate a new password for {selectedCountry?.name}. The old password will be invalidated.
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
                Make sure to copy and securely share this password with the country representative.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to regenerate the password for <strong>{selectedCountry?.name}</strong>?
                This action cannot be undone.
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
                {isRegenerating && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Regenerate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
