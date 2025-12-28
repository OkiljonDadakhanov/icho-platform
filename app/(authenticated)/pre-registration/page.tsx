"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { PreRegistration, Gender } from "@/lib/types";

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

const FEE_PER_PERSON = 500;

export default function PreRegistrationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preRegistration, setPreRegistration] = useState<PreRegistration | null>(null);
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
      const data = await preRegistrationService.getPreRegistration();
      setPreRegistration(data);

      // Pre-fill form if data exists
      if (data) {
        setFormData((prev) => ({
          ...prev,
          teamLeaders: data.num_team_leaders,
          contestants: data.num_contestants,
          observers: data.num_observers,
          guests: data.num_guests,
        }));
      }

      // Try to get coordinator info
      try {
        const coordinator = await preRegistrationService.getCoordinator();
        if (coordinator) {
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
        }
      } catch {
        // Coordinator might not exist yet
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load pre-registration data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return (
      (formData.teamLeaders + formData.contestants + formData.observers + formData.guests) *
      FEE_PER_PERSON
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      await preRegistrationService.submitPreRegistration({
        coordinator: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth,
          passport_number: formData.passportNumber,
          email: formData.email,
          phone: formData.phone,
        },
        num_team_leaders: formData.teamLeaders,
        num_contestants: formData.contestants,
        num_observers: formData.observers,
        num_guests: formData.guests,
      });

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
      await preRegistrationService.updateCoordinator({
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        passport_number: formData.passportNumber,
        email: formData.email,
        phone: formData.phone,
      });
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2f3090] to-[#00795d] text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Pre-Registration</h1>
        </div>
        <p className="text-white/80">
          Please provide coordinator details and expected delegation size.
        </p>
      </div>

      {isSubmitted ? (
        <Alert className="bg-[#00795d]/10 border-[#00795d]/30">
          <CheckCircle className="h-4 w-4 text-[#00795d]" />
          <AlertDescription className="text-[#00795d]">
            Your pre-registration has been submitted. You can now proceed to the payment stage.
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
              disabled={isSubmitted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isSubmitted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              placeholder="e.g., National Coordinator"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={isSubmitted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              disabled={isSubmitted}
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
              disabled={isSubmitted}
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
              disabled={isSubmitted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="coordinator@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitted}
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
              disabled={isSubmitted}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Expected Delegation Size</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="teamLeaders">Team Leaders *</Label>
            <Input
              id="teamLeaders"
              type="number"
              min="0"
              value={formData.teamLeaders}
              onChange={(e) =>
                setFormData({ ...formData, teamLeaders: parseInt(e.target.value) || 0 })
              }
              disabled={isSubmitted}
            />
            <p className="text-xs text-muted-foreground">Usually 1-2 per country</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contestants">Contestants *</Label>
            <Input
              id="contestants"
              type="number"
              min="0"
              max="4"
              value={formData.contestants}
              onChange={(e) =>
                setFormData({ ...formData, contestants: parseInt(e.target.value) || 0 })
              }
              disabled={isSubmitted}
            />
            <p className="text-xs text-muted-foreground">Maximum 4 students</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observers">Observers</Label>
            <Input
              id="observers"
              type="number"
              min="0"
              value={formData.observers}
              onChange={(e) =>
                setFormData({ ...formData, observers: parseInt(e.target.value) || 0 })
              }
              disabled={isSubmitted}
            />
            <p className="text-xs text-muted-foreground">Scientific observers</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Guests</Label>
            <Input
              id="guests"
              type="number"
              min="0"
              value={formData.guests}
              onChange={(e) =>
                setFormData({ ...formData, guests: parseInt(e.target.value) || 0 })
              }
              disabled={isSubmitted}
            />
            <p className="text-xs text-muted-foreground">Additional delegation members</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#2f3090]/10 rounded-lg border border-[#2f3090]/20">
          <h3 className="font-semibold mb-2">Estimated Participation Fee</h3>
          <p className="text-2xl font-bold text-[#2f3090]">
            ${calculateTotal().toLocaleString()} USD
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on{" "}
            {formData.teamLeaders + formData.contestants + formData.observers + formData.guests}{" "}
            participants ({formData.teamLeaders} leader(s) + {formData.contestants} contestant(s) +{" "}
            {formData.observers} observer(s) + {formData.guests} guest(s))
          </p>
        </div>
      </Card>

      {!isSubmitted && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button
            className="bg-[#2f3090] hover:bg-[#4547a9]"
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
        </div>
      )}
    </div>
  );
}
