"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, LogIn, Globe } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { countriesService } from "@/lib/services/countries";
import type { Country } from "@/lib/types";

export default function LoginPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoadingCountries(true);
      setError(null);
      const data = await countriesService.getCountries();
      setCountries(data);
    } catch (err) {
      console.error("Failed to load countries:", err);
      const error = err as { message?: string; status?: number };
      if (error.status === 0 || error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
        setError("Unable to connect to the server. Please ensure the API server is running and CORS is configured correctly.");
      } else {
        setError(error.message || "Failed to load countries. Please refresh the page.");
      }
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCountry) {
      setError("Please select your country");
      return;
    }

    setIsLoading(true);

    try {
      await login({ country: selectedCountry, password });
      router.push("/dashboard");
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2f3090] to-[#00795d] p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2f3090] rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">IChO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">IChO 2026</h1>
          <p className="text-gray-600 mt-1">Country Registration Portal</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country">Select Your Country</Label>
            {isLoadingCountries ? (
              <div className="flex items-center justify-center py-3 border rounded-md bg-gray-50">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm text-gray-500">Loading countries...</span>
              </div>
            ) : (
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.name}>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/16x12/${country.iso_code.toLowerCase().slice(0, 2)}.png`}
                          alt={country.name}
                          className="w-4 h-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your country password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isLoadingCountries}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2f3090] hover:bg-[#4547a9]"
            disabled={isLoading || isLoadingCountries || !selectedCountry}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>58th International Chemistry Olympiad</p>
          <p className="mt-1">Uzbekistan 2026</p>
        </div>

        <div className="mt-4 text-center">
          <a
            href="mailto:support@icho2026.org"
            className="text-sm text-gray-500 hover:underline"
          >
            Need help? Contact support
          </a>
        </div>
      </Card>
    </div>
  );
}
