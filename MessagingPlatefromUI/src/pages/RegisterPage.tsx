import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Input } from "../components/Input";
import { MobileInput } from "../components/MobileInput";
import { Button } from "../components/Button";
import { authService } from "../services/authService";
import {
  getMobileValidationError,
  normalizeIndianMobileNumber,
} from "../utils/mobileValidation";
import PinCodeAddressSection, {
  type AddressData,
} from "../components/PinCodeAddressSection";
import { usePinCodeLookup } from "../hooks/usePinCodeLookup";

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    address: "",
    location: "",
    businessType: "",
    emailId: "",
    password: "",
    pinCode: "",
    state: "",
    district: "",
    taluk: "",
    postOffice: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    status: pinStatus,
    result: pinResult,
    onPinChange,
  } = usePinCodeLookup();

  useEffect(() => {
    if (pinStatus === "success" && pinResult) {
      setFormData((prev) => ({
        ...prev,
        state: pinResult.state,
        district: pinResult.district,
        taluk: pinResult.taluk,
        postOffice: pinResult.postOffices[0] ?? "",
        location: `${pinResult.district}, ${pinResult.state}`,
      }));
    }
  }, [pinStatus, pinResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextMobileError = getMobileValidationError(formData.mobileNumber, {
      required: true,
    });

    setMobileError(nextMobileError);
    if (nextMobileError) {
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pinSuffix = [
        formData.postOffice,
        formData.taluk,
        formData.district,
        formData.state,
      ]
        .filter(Boolean)
        .join(", ");
      const fullAddress = formData.address.trim()
        ? pinSuffix
          ? `${formData.address.trim()}, ${pinSuffix}`
          : formData.address.trim()
        : pinSuffix;
      await authService.register({
        ...formData,
        address: fullAddress || formData.address,
        mobileNumber: normalizeIndianMobileNumber(formData.mobileNumber),
      });
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "mobileNumber" && mobileError) {
      setMobileError(undefined);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <div className="auth-logo">
            <MessageSquare size={32} />
            <span>ArthSMS</span>
          </div>
          <h1 className="auth-title">Client Registration</h1>
          <p className="auth-subtitle">
            Join our multi-tenant messaging platform
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="stack-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <Input
                label="Full Name / Business Name"
                name="name"
                type="text"
                placeholder="John Doe or Acme Corp"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Email Address"
              name="emailId"
              type="email"
              placeholder="john@example.com"
              value={formData.emailId}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <MobileInput
              label="Mobile Number"
              name="mobileNumber"
              placeholder="9876543210 or +919876543210"
              value={formData.mobileNumber}
              onChange={(value) => {
                setFormData((current) => ({
                  ...current,
                  mobileNumber: value,
                }));
                if (mobileError) {
                  setMobileError(undefined);
                }
              }}
              error={mobileError}
              showPrefix
              required
            />
            <Input
              label="Business Type"
              name="businessType"
              type="text"
              placeholder="Retail, Tech, etc."
              value={formData.businessType}
              onChange={handleChange}
              required
            />
            <div style={{ gridColumn: "span 2" }}>
              <Input
                label="Street / Building Address"
                name="address"
                type="text"
                placeholder="123 Main St, Building Name"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <PinCodeAddressSection
                value={{
                  pinCode: formData.pinCode,
                  state: formData.state,
                  district: formData.district,
                  taluk: formData.taluk,
                  postOffice: formData.postOffice,
                }}
                onChange={(data: AddressData) =>
                  setFormData((prev) => ({ ...prev, ...data }))
                }
                lookupStatus={pinStatus}
                lookupResult={pinResult}
                onPinChange={(pin) => {
                  setFormData((prev) => ({ ...prev, pinCode: pin }));
                  onPinChange(pin);
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            style={{ marginTop: "1.5rem" }}
          >
            Register Client <ArrowRight size={18} />
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
