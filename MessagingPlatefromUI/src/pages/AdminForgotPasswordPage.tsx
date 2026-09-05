import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { adminAuthService } from "../services/adminService";

export const AdminForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      setSuccess(await adminAuthService.requestPasswordReset(email));
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Unable to request a password reset. Please try again.",
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
            <Mail size={32} />
            <span>ArthSMS</span>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your admin email and we will send a reset link.
          </p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div className="auth-success">{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@messaging.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              required
            />
            <Button type="submit" isLoading={isLoading}>
              Send reset link <ArrowRight size={18} />
            </Button>
          </form>
        )}
        <div className="auth-footer">
          <Link to="/admin/login" className="auth-link">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
