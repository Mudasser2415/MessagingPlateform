import { ArrowRight, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { adminAuthService } from "../services/adminService";
import { useAdminAuthStore } from "../store/adminAuthStore";

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminAuthService.login(email, password);

      if (response.role !== "Admin" && response.role !== "SuperAdmin") {
        setError("This account does not have admin access.");
        return;
      }

      setAuth(
        {
          adminId: response.adminId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        },
        response.token,
      );
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          {/* <div className="auth-logo">
            <LogIn size={32} />
            <span>Admin Portal</span>
          </div> */}
          <div className="auth-logo">
            <MessageSquare size={32} />
            <span>ArthSMS</span>
          </div>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">
            Secure access to messaging platform administration
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
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@messaging.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button type="submit" isLoading={isLoading}>
            Sign In <ArrowRight size={18} />
          </Button>
        </form>

        <div className="auth-footer" style={{ textAlign: "left" }}>
          <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
            Demo Credentials:
          </p>
          <p>Email: admin@messaging.com</p>
          <p>Password: Admin@123</p>
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
