import { CheckCircle2, LockKeyhole } from "lucide-react";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { adminAuthService } from "../services/adminService";

export const AdminResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email || !token) {
      setError("This password reset link is invalid.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      setSuccess(await adminAuthService.resetPassword(email, token, password));
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset your password. Please request a new link.",
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
            <LockKeyhole size={32} />
            <span>ArthSMS</span>
          </div>
          <h1 className="auth-title">Choose a New Password</h1>
          <p className="auth-subtitle">
            Set a new password for {email || "your admin account"}.
          </p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div className="auth-success">
            <CheckCircle2 size={18} /> {success}{" "}
            <Link to="/admin/login" className="auth-link">
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Enter your password again"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={isLoading}
              required
            />
            <Button type="submit" isLoading={isLoading}>
              Reset password
            </Button>
          </form>
        )}
        <div className="auth-footer">
          <Link to="/admin/login" className="auth-link">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
