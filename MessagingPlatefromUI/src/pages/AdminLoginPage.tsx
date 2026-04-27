import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertTriangle, Loader } from "lucide-react";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { adminAuthService } from "../services/adminService";

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "0.5rem",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              }}
            >
              <LogIn size={20} color="#6366f1" />
            </div>
            <span>Admin Portal</span>
          </div>
          <h1
            style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem" }}
          >
            Admin Login
          </h1>
          <p
            style={{
              color: "var(--secondary)",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            Secure access to messaging platform administration
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <AlertTriangle
              size={18}
              color="#dc2626"
              style={{ marginTop: "0.125rem", flexShrink: 0 }}
            />
            <div style={{ fontSize: "0.875rem", color: "#991b1b" }}>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--foreground)",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@messaging.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--foreground)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#cbd5e1" : "#6366f1",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? (
              <>
                <Loader
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "rgba(99, 102, 241, 0.05)",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            color: "var(--secondary)",
          }}
        >
          <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
            Demo Credentials:
          </p>
          <p>Email: admin@messaging.com</p>
          <p>Password: Admin@123</p>
        </div>

        {/* Footer Link */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#666",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/admin/register"
            style={{
              color: "#6366f1",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Register here
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
