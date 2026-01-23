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
import { InfoIcon, ClipboardList, Loader2, CheckCircle } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { preRegistrationService } from "@/lib/services/pre-registration";
import { toast } from "sonner";
import type { PreRegistration, Gender, CoordinatorUpsertRequest, FeeRule } from "@/lib/types";

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
    } catch (err) {
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!passportScanFile && !coordinatorPassportScan) {
        setError("Coordinator passport scan is required before submitting pre-registration.");
        toast.error("Please upload a coordinator passport scan before submitting.");
        setIsSubmitting(false);
        return;
      }

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
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Failed to submit pre-registration");
      toast.error("Failed to submit pre-registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
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
    } catch (err) {
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

      {error && <ErrorDisplay message={error} onRetry={loadPreRegistration} />}

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
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              placeholder="e.g., National Coordinator"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!canEdit}
            />
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
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              disabled={!canEdit}
            />
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
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="passport_scan">Passport Scan (PDF/JPG/PNG) *</Label>
            <FileInput
              id="passport_scan"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(file) => setPassportScanFile(file)}
              disabled={!canEdit}
            />
            {passportScanFile && (
              <p className="text-sm text-muted-foreground">Selected: {passportScanFile.name}</p>
            )}
            {!passportScanFile && coordinatorPassportScan && (
              <p className="text-sm text-muted-foreground">Existing passport scan uploaded.</p>
            )}
            {!passportScanFile && !coordinatorPassportScan && (
              <p className="text-sm text-muted-foreground">Required before submitting pre-registration.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="coordinator@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!canEdit}
            />
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
