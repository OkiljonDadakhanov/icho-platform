"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileInput } from "@/components/ui/file-input";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ClipboardList, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import { preRegistrationService } from "@/lib/services/pre-registration";
import { toast } from "sonner";
import type { PreRegistration, Gender, CoordinatorUpsertRequest, FeeRule } from "@/lib/types";

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Phone validation helper
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(phone);
};

// File validation helper
const ALLOWED_PASSPORT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_PASSPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validatePassportFile(file: File): string | null {
  const dotIndex = file.name.lastIndexOf(".");
  if (dotIndex === -1) {
    return "Invalid file type. Only PDF, JPG, and PNG files are allowed.";
  }
  const ext = file.name.toLowerCase().slice(dotIndex);
  if (!ALLOWED_PASSPORT_EXTENSIONS.includes(ext)) {
    return `Invalid file type "${ext}". Only PDF, JPG, and PNG files are allowed.`;
  }
  if (file.size > MAX_PASSPORT_FILE_SIZE) {
    return "File size exceeds 10MB limit.";
  }
  return null;
}

interface FormData {
  firstName: string;
  lastName: string;
  role: string;
  gender: Gender;
  dateOfBirth: string;
  passportNumber: string;
  email: string;
  phone: string;
  teamLeaders: number;
  contestants: number;
  observers: number;
  guests: number;
}

export default function PreRegistrationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preRegistration, setPreRegistration] = useState<PreRegistration | null>(null);
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null);
  const [coordinatorPassportScan, setCoordinatorPassportScan] = useState<string | null>(null);
  const [passportScanFile, setPassportScanFile] = useState<File | null>(null);
  const [passportFileError, setPassportFileError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    role: "National Coordinator",
    gender: "MALE",
    dateOfBirth: "",
    passportNumber: "",
    email: "",
    phone: "",
    teamLeaders: 1,
    contestants: 4,
    observers: 2,
    guests: 3,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string, value: string): string | null => {
    if (!touched[field] && value === "") return null;

    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.length < 2) return "First name must be at least 2 characters";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.length < 2) return "Last name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        break;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!isValidPhone(value)) return "Please enter a valid phone number";
        break;
      case "passportNumber":
        if (!value.trim()) return "Passport number is required";
        if (value.length < 5) return "Passport number seems too short";
        break;
      case "dateOfBirth":
        if (!value) return "Date of birth is required";
        {
          const dob = new Date(value);
          const today = new Date();
          if (dob > today) return "Date of birth cannot be in the future";
          if (dob < new Date("1920-01-01")) return "Date of birth is too far in the past";
        }
        break;
      case "role":
        if (!value.trim()) return "Role is required";
        break;
    }
    return null;
  };

  useEffect(() => {
    loadPreRegistration();
  }, []);

  const loadPreRegistration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, feeRulesData] = await Promise.all([
        preRegistrationService.getPreRegistration(),
        preRegistrationService.getFeeRules().catch(() => [])
      ]);
      setPreRegistration(data);
      setFeeRules(feeRulesData);

      // Pre-fill form if data exists (clamp to limits)
      if (data) {
        setFormData((prev) => ({
          ...prev,
          teamLeaders: Math.min(data.num_team_leaders, 2),
          contestants: Math.min(data.num_contestants, 4),
          observers: Math.min(data.num_observers, 2),
          guests: data.num_guests,
        }));
      }

      // Try to get coordinator info (prefer primary)
      const coordinators = data.coordinators ?? await preRegistrationService.getCoordinators();
      const coordinator = coordinators.find((item) => item.is_primary) ?? coordinators[0];
      if (coordinator) {
        setCoordinatorId(coordinator.id);
        setCoordinatorPassportScan(coordinator.passport_scan ?? null);
        const [firstName, ...lastNameParts] = coordinator.full_name.split(" ");
        setFormData((prev) => ({
          ...prev,
          firstName: firstName || "",
          lastName: lastNameParts.join(" ") || "",
          role: coordinator.role,
          gender: coordinator.gender,
          dateOfBirth: coordinator.date_of_birth,
          passportNumber: coordinator.passport_number,
          email: coordinator.email,
          phone: coordinator.phone,
        }));
      } else {
        setCoordinatorId(null);
        setCoordinatorPassportScan(null);
      }
    } catch (err: any) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load pre-registration data");
    } finally {
      setIsLoading(false);
    }
  };

  const getFee = (role: string): number => {
    const rule = feeRules.find((r) => r.role === role);
    return rule ? Number(rule.unit_fee) : 500; // Default to 500 if no rule found
  };

  const calculateTotal = () => {
    return (
      formData.teamLeaders * getFee("TEAM_LEADER") +
      formData.contestants * getFee("CONTESTANT") +
      formData.observers * getFee("OBSERVER") +
      formData.guests * getFee("GUEST")
    );
  };

  const buildCoordinatorPayload = (): CoordinatorUpsertRequest => ({
    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    role: formData.role,
    gender: formData.gender,
    date_of_birth: formData.dateOfBirth,
    passport_number: formData.passportNumber,
    email: formData.email,
    phone: formData.phone,
    is_primary: true,
  });

  const upsertCoordinator = async () => {
    const payload = buildCoordinatorPayload();
    if (coordinatorId) {
      const updated = await preRegistrationService.updateCoordinator(coordinatorId, payload);
      setCoordinatorId(updated.id);
      setCoordinatorPassportScan(updated.passport_scan ?? null);
      return updated;
    }
    const created = await preRegistrationService.createCoordinator(payload, passportScanFile || undefined);
    setCoordinatorId(created.id);
    setCoordinatorPassportScan(created.passport_scan ?? null);
    if (passportScanFile) {
      setPassportScanFile(null);
    }
    return created;
  };

  const uploadPassportScanIfNeeded = async (currentCoordinatorId: string) => {
    if (!passportScanFile) return;
    const updated = await preRegistrationService.uploadCoordinatorPassport(currentCoordinatorId, passportScanFile);
    setCoordinatorPassportScan(updated.passport_scan ?? null);
    setPassportScanFile(null);
  };

  const validateForm = (): boolean => {
    // Mark all fields as touched to show validation
    const allFields = ["firstName", "lastName", "email", "phone", "passportNumber", "dateOfBirth", "role"];
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    // Check each field and collect specific errors
    const fieldErrors: { field: string; error: string }[] = [];

    if (!formData.firstName.trim()) fieldErrors.push({ field: "First name", error: "required" });
    if (!formData.lastName.trim()) fieldErrors.push({ field: "Last name", error: "required" });
    if (!formData.email.trim()) {
      fieldErrors.push({ field: "Email", error: "required" });
    } else if (!isValidEmail(formData.email)) {
      fieldErrors.push({ field: "Email", error: "invalid format" });
    }
    if (!formData.phone.trim()) {
      fieldErrors.push({ field: "Phone", error: "required" });
    } else if (!isValidPhone(formData.phone)) {
      fieldErrors.push({ field: "Phone", error: "invalid format" });
    }
    if (!formData.passportNumber.trim()) fieldErrors.push({ field: "Passport number", error: "required" });
    if (!formData.dateOfBirth) fieldErrors.push({ field: "Date of birth", error: "required" });
    if (!formData.role.trim()) fieldErrors.push({ field: "Role", error: "required" });

    if (fieldErrors.length > 0) {
      const missingFields = fieldErrors.map(e => e.field).join(", ");
      toast.error(`Missing or invalid: ${missingFields}`);
      return false;
    }

    if (passportFileError) {
      toast.error("Please select a valid passport scan file");
      return false;
    }

    if (!passportScanFile && !coordinatorPassportScan) {
      toast.error("Passport scan is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await preRegistrationService.updatePreRegistration({
        num_team_leaders: formData.teamLeaders,
        num_contestants: formData.contestants,
        num_observers: formData.observers,
        num_guests: formData.guests,
      });
      const coordinator = await upsertCoordinator();
      await uploadPassportScanIfNeeded(coordinator.id);
      await preRegistrationService.submitPreRegistration();

      toast.success("Pre-registration submitted successfully!");
      await loadPreRegistration();
    } catch (err: any) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to submit pre-registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Validate email and phone if they have values
    if (formData.email && !isValidEmail(formData.email)) {
      setTouched((prev) => ({ ...prev, email: true }));
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      setTouched((prev) => ({ ...prev, phone: true }));
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsSubmitting(true);
      await preRegistrationService.updatePreRegistration({
        num_team_leaders: formData.teamLeaders,
        num_contestants: formData.contestants,
        num_observers: formData.observers,
        num_guests: formData.guests,
      });
      const coordinator = await upsertCoordinator();
      await uploadPassportScanIfNeeded(coordinator.id);
      toast.success("Draft saved successfully!");
    } catch (err: any) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage message="Loading pre-registration..." />;
  }

  const isSubmitted = preRegistration?.submitted_at != null;
  const canEdit = preRegistration?.can_edit !== false; // Default to true if not set

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-6 sm:p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold">Pre-Registration</h1>
        </div>
        <p className="text-white/80 text-sm sm:text-base">
          Please provide coordinator details and expected delegation size.
        </p>
      </div>

      {isSubmitted && canEdit ? (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Your pre-registration has been submitted. You can still edit it until you upload payment proof.
          </AlertDescription>
        </Alert>
      ) : isSubmitted && !canEdit ? (
        <Alert className="bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {preRegistration?.edit_blocked_reason || "Pre-registration is locked and cannot be edited."}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
          <InfoIcon className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            This is the first stage of registration. Complete this form to receive your invoice
            for participation fees.
          </AlertDescription>
        </Alert>
      )}


      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Coordinator Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              onBlur={() => handleBlur("firstName")}
              disabled={!canEdit}
              className={touched.firstName && getFieldError("firstName", formData.firstName) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {touched.firstName && getFieldError("firstName", formData.firstName) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {getFieldError("firstName", formData.firstName)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              onBlur={() => handleBlur("lastName")}
              disabled={!canEdit}
              className={touched.lastName && getFieldError("lastName", formData.lastName) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {touched.lastName && getFieldError("lastName", formData.lastName) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {getFieldError("lastName", formData.lastName)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              placeholder="e.g., National Coordinator"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              onBlur={() => handleBlur("role")}
              disabled={!canEdit}
              className={touched.role && getFieldError("role", formData.role) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {touched.role && getFieldError("role", formData.role) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {getFieldError("role", formData.role)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              min="1920-01-01"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              onBlur={() => handleBlur("dateOfBirth")}
              disabled={!canEdit}
              className={touched.dateOfBirth && getFieldError("dateOfBirth", formData.dateOfBirth) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {touched.dateOfBirth && getFieldError("dateOfBirth", formData.dateOfBirth) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {getFieldError("dateOfBirth", formData.dateOfBirth)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport">Passport Number *</Label>
            <Input
              id="passport"
              placeholder="Enter passport number"
              value={formData.passportNumber}
              onChange={(e) =>
                setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })
              }
              onBlur={() => handleBlur("passportNumber")}
              disabled={!canEdit}
              className={touched.passportNumber && getFieldError("passportNumber", formData.passportNumber) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {touched.passportNumber && getFieldError("passportNumber", formData.passportNumber) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {getFieldError("passportNumber", formData.passportNumber)}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="passport_scan">Passport Scan (PDF/JPG/PNG) *</Label>
            <FileInput
              id="passport_scan"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(file) => {
                setPassportFileError(null);
                if (file) {
                  const error = validatePassportFile(file);
                  if (error) {
                    setPassportFileError(error);
                    setPassportScanFile(null);
                    return;
                  }
                }
                setPassportScanFile(file);
              }}
              disabled={!canEdit}
            />
            {passportFileError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {passportFileError}
              </p>
            )}
            {!passportFileError && passportScanFile && (
              <p className="text-sm text-muted-foreground">Selected: {passportScanFile.name}</p>
            )}
            {!passportFileError && !passportScanFile && coordinatorPassportScan && (
              <p className="text-sm text-muted-foreground">Existing passport scan uploaded.</p>
            )}
            {!passportFileError && !passportScanFile && !coordinatorPassportScan && (
              <p className="text-sm text-muted-foreground">Required before submitting pre-registration.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="coordinator@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                disabled={!canEdit}
                className={
                  touched.email
                    ? getFieldError("email", formData.email)
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200 pr-10"
                      : "border-green-300 focus:border-green-500 focus:ring-green-200 pr-10"
                    : ""
                }
              />
              {touched.email && formData.email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {getFieldError("email", formData.email) ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {touched.email && getFieldError("email", formData.email) && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("email", formData.email)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="+998 XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => handleBlur("phone")}
                disabled={!canEdit}
                className={
                  touched.phone
                    ? getFieldError("phone", formData.phone)
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200 pr-10"
                      : "border-green-300 focus:border-green-500 focus:ring-green-200 pr-10"
                    : ""
                }
              />
              {touched.phone && formData.phone && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {getFieldError("phone", formData.phone) ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {touched.phone && getFieldError("phone", formData.phone) && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("phone", formData.phone)}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Expected Delegation Size</h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-base">Team Leaders *</Label>
              <span className="text-xs font-medium text-[#2f3090] bg-[#2f3090]/10 px-2 py-0.5 rounded">Max 2</span>
            </div>
            <NumberStepper
              value={formData.teamLeaders}
              onChange={(value) => setFormData({ ...formData, teamLeaders: value })}
              min={0}
              max={2}
              disabled={!canEdit}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-base">Contestants *</Label>
              <span className="text-xs font-medium text-[#00795d] bg-[#00795d]/10 px-2 py-0.5 rounded">Max 4</span>
            </div>
            <NumberStepper
              value={formData.contestants}
              onChange={(value) => setFormData({ ...formData, contestants: value })}
              min={0}
              max={4}
              disabled={!canEdit}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-base">Observers</Label>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Max 2</span>
            </div>
            <NumberStepper
              value={formData.observers}
              onChange={(value) => setFormData({ ...formData, observers: value })}
              min={0}
              max={2}
              disabled={!canEdit}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-base">Guests</Label>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded">No limit</span>
            </div>
            <NumberStepper
              value={formData.guests}
              onChange={(value) => setFormData({ ...formData, guests: value })}
              min={0}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#2f3090]/10 rounded-lg border border-[#2f3090]/20">
          <h3 className="font-semibold mb-2">Estimated Participation Fee</h3>
          <p className="text-xl sm:text-2xl font-bold text-[#2f3090]">
            ${calculateTotal().toLocaleString()} USD
          </p>
          <div className="text-xs sm:text-sm text-muted-foreground mt-2 space-y-1">
            {formData.teamLeaders > 0 && (
              <p>Team Leaders: {formData.teamLeaders} × ${getFee("TEAM_LEADER")} = ${(formData.teamLeaders * getFee("TEAM_LEADER")).toLocaleString()}</p>
            )}
            {formData.contestants > 0 && (
              <p>Contestants: {formData.contestants} × ${getFee("CONTESTANT")} = ${(formData.contestants * getFee("CONTESTANT")).toLocaleString()}</p>
            )}
            {formData.observers > 0 && (
              <p>Observers: {formData.observers} × ${getFee("OBSERVER")} = ${(formData.observers * getFee("OBSERVER")).toLocaleString()}</p>
            )}
            {formData.guests > 0 && (
              <p>Guests: {formData.guests} × ${getFee("GUEST")} = ${(formData.guests * getFee("GUEST")).toLocaleString()}</p>
            )}
          </div>
        </div>
      </Card>

      {canEdit && (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitted ? "Update & Regenerate Invoice" : "Save Draft"}
          </Button>
          {!isSubmitted && (
            <Button
              className="bg-[#2f3090] hover:bg-[#4547a9] w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Pre-Registration"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
