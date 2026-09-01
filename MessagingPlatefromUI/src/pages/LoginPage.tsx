import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { MobileInput } from "../components/MobileInput";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { getMobileValidationError } from "../utils/mobileValidation";

export const LoginPage: React.FC = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | undefined>();

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextMobileError = getMobileValidationError(mobileNumber, {
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
      const response = await authService.login(mobileNumber, password);
      setAuth(response.user, response.token);
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid mobile number or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <MessageSquare size={32} />
            <span>ArthSMS</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Enter your credentials to access your account
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
          <MobileInput
            label="Mobile Number"
            placeholder="9876543210 or +919876543210"
            value={mobileNumber}
            onChange={(value) => {
              setMobileNumber(value);
              if (mobileError) {
                setMobileError(undefined);
              }
            }}
            error={mobileError}
            showPrefix
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1.5rem",
            }}
          >
            <a href="#" className="auth-link" style={{ fontSize: "0.875rem" }}>
              Forgot password?
            </a>
          </div>

          <Button type="submit" isLoading={isLoading}>
            Sign In <ArrowRight size={18} />
          </Button>
        </form>
        <div className="auth-footer">
          Employee and admin accounts are provisioned by your organization.
        </div>
        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/admin/register" className="auth-link">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
