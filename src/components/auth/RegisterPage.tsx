import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { AuthService } from "../../lib/auth";
import { User } from "../../types";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onBack: () => void;
}

export function RegisterPage({
  onRegister,
  onBack,
}: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationalIdType: "AADHAR",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailPattern = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.com$/;

  const maskNationalId = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    if (cleaned.length < 4) return value;
    const last4 = cleaned.slice(-4);
    const masked = "*".repeat(cleaned.length - 4);
    return `${masked}${last4}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "nationalId") {
      if (formData.nationalIdType === "AADHAR") {
        nextValue = value.replace(/\D/g, "").slice(0, 16);
      } else {
        nextValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      }
    }

    setFormData({
      ...formData,
      [name]: nextValue,
    });
  };

  const verifyNationalId = () => {
    if (!formData.nationalId) {
      setError("Please enter your National ID");
      return;
    }

    const expectedLength = formData.nationalIdType === "AADHAR" ? 16 : 10;
    if (formData.nationalId.length !== expectedLength) {
      const label = formData.nationalIdType === "AADHAR" ? "Aadhaar" : "PAN";
      setError(`${label} number must be ${expectedLength} digits.`);
      return;
    }

    if (formData.nationalIdType === "PAN" && !/^[A-Za-z0-9]{10}$/.test(formData.nationalId)) {
      setError("PAN must be 10 alphanumeric characters.");
      return;
    }

    // Mock verification - in production, this would call a government API
    setIdVerified(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!idVerified) {
      setError("Please verify your National ID first");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!emailPattern.test(formData.email)) {
      setError("Email must be in the format name@domain.com");
      return;
    }

    setLoading(true);

    try {
      const user = await AuthService.register({
        name: formData.name,
        email: formData.email,
        nationalIdType: formData.nationalIdType,
        nationalId: formData.nationalId,
        password: formData.password,
      });

      if (user) {
        onRegister(user);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        "Registration failed. This email or National ID may already be registered.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-12 py-4 sm:px-12 lg:px-16">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        {/* Official Header */}
        <div className="surface-panel rounded-2xl p-6 mb-4 border-t-4 border-[#FF9933]">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <h2 className="text-xl text-[#000080] font-display tracking-tight">
                National Grievance & Appeals Portal
              </h2>
              <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] my-2"></div>
              <p className="text-sm text-gray-600">
                Citizen Registration
              </p>
            </div>
          </div>
        </div>

        <Card className="border-l-4 border-l-[#138808] shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-[#000080]">
              Citizen Registration
            </CardTitle>
            <CardDescription>
              Register with your National ID to submit
              grievances and track appeals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* National ID Verification */}
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="nationalId">
                    National ID Verification
                  </Label>
                </div>
                <Tabs
                  value={formData.nationalIdType}
                  onValueChange={(value: string) =>
                    {
                      setFormData({
                        ...formData,
                        nationalIdType: value,
                        nationalId: "",
                      });
                      setIdVerified(false);
                      setError("");
                    }
                  }
                  className="w-full"
                >
                  <TabsList className="portal-toggle w-full mb-3">
                    <TabsTrigger
                      value="AADHAR"
                      className="portal-toggle__trigger"
                    >
                      Aadhaar (16 digits)
                    </TabsTrigger>
                    <TabsTrigger
                      value="PAN"
                      className="portal-toggle__trigger"
                    >
                      PAN (10 digits)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  <Input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    placeholder={
                      formData.nationalIdType === "AADHAR"
                        ? "Enter 16-digit Aadhaar number"
                        : "Enter 10-digit PAN number"
                    }
                    value={formData.nationalId}
                    onChange={handleChange}
                    disabled={idVerified}
                    inputMode={formData.nationalIdType === "AADHAR" ? "numeric" : "text"}
                    pattern={formData.nationalIdType === "AADHAR" ? "\\d*" : "[A-Za-z0-9]*"}
                    required
                  />
                  {!idVerified ? (
                    <Button
                      type="button"
                      onClick={verifyNationalId}
                    >
                      Verify
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Verified
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {formData.nationalIdType === "AADHAR"
                    ? "Aadhaar must be 16 digits"
                    : "PAN must be 10 alphanumeric characters"}
                </p>
                {formData.nationalId && (
                  <p className="text-sm text-gray-600">
                    Displayed as: {maskNationalId(formData.nationalId)}
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="username@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-gray-600">
                  Format: alphanumeric@domain.com
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2 w-full">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full sm:w-1/2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password
                </Label>
                <div className="flex items-center gap-2 w-full">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full sm:w-1/2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !idVerified}
              >
                {loading ? "Registering..." : "Register"}
              </Button>

              <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  National ID verification ensures secure,
                  authentic user registration
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  All your submissions are tracked with complete
                  transparency
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  SLA-based automatic escalation ensures
                  accountability
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}