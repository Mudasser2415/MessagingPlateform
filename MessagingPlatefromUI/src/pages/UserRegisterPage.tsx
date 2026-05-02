import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  AlertTriangle,
  Loader,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { MobileInput } from "../components/MobileInput";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { adminAuthService } from "../services/adminService";
import {
  getMobileValidationError,
  normalizeIndianMobileNumber,
} from "../utils/mobileValidation";

export const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAdminAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee" as "Admin" | "Employee",
    canCreatePartners: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Mobile number validation
    const mobileNumberError = getMobileValidationError(formData.mobileNumber, {
      required: true,
      emptyMessage: "Mobile number is required.",
    });
    if (mobileNumberError) {
      newErrors.mobileNumber = mobileNumberError;
    }

    // Email validation (optional, but if provided must be valid)
    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "Employee"
        ? { canCreatePartners: false }
        : {}),
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await adminAuthService.registerUser(
        formData.name,
        normalizeIndianMobileNumber(formData.mobileNumber),
        formData.email || undefined,
        formData.password,
        formData.role,
        formData.role === "Employee" && formData.canCreatePartners,
      );

      // Show success message
      setRegistrationSuccess(true);

      setTimeout(() => {
        if (response.role === "Admin" || response.role === "SuperAdmin") {
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
          return;
        }

        navigate("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Success Message */}
        {registrationSuccess && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "1rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              zIndex: 1000,
            }}
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">
              Registration successful! Redirecting...
            </span>
          </div>
        )}

        {/* Header */}
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
              <UserPlus size={20} color="#6366f1" />
            </div>
            <span>Messaging Platform</span>
          </div>
          <h1
            style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem" }}
          >
            Create Account
          </h1>
          <p
            style={{
              color: "var(--secondary)",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            Register to start using the platform
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
              borderLeft: "4px solid #ef4444",
              borderRadius: "0.5rem",
              color: "#991b1b",
              fontSize: "0.875rem",
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#333",
              }}
            >
              Full Name
              <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.name ? "1px solid #ef4444" : "1px solid #ddd",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.outline = "none";
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? "#ef4444" : "#ddd";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Mobile Number Field */}
          <MobileInput
            label="Mobile Number"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                mobileNumber: value,
              }));
              if (errors.mobileNumber) {
                setErrors((prev) => ({
                  ...prev,
                  mobileNumber: "",
                }));
              }
            }}
            error={errors.mobileNumber}
            placeholder="9876543210, 919876543210, or +919876543210"
            disabled={loading}
            required
            showPrefix
            containerStyle={{ marginBottom: "1.5rem" }}
            labelStyle={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#333",
            }}
            inputStyle={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              boxSizing: "border-box",
            }}
            errorStyle={{
              color: "#ef4444",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          />

          {/* Email Field (Optional) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#333",
              }}
            >
              Email Address <span style={{ color: "#999" }}>(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.email ? "1px solid #ef4444" : "1px solid #ddd",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.outline = "none";
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? "#ef4444" : "#ddd";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.email && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                color: "#333",
              }}
            >
              Account Type
              <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {/* Admin Role */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  border:
                    formData.role === "Admin"
                      ? "2px solid #6366f1"
                      : "1px solid #ddd",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor:
                    formData.role === "Admin"
                      ? "rgba(99, 102, 241, 0.05)"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={formData.role === "Admin"}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "#333" }}>Admin</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                    Full platform access
                  </div>
                </div>
              </label>

              {/* Employee Role */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  border:
                    formData.role === "Employee"
                      ? "2px solid #6366f1"
                      : "1px solid #ddd",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor:
                    formData.role === "Employee"
                      ? "rgba(99, 102, 241, 0.05)"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="Employee"
                  checked={formData.role === "Employee"}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "#333" }}>Employee</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                    Limited access
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.role}
              </p>
            )}
          </div>

          {formData.role === "Employee" && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(37, 99, 235, 0.22)",
                backgroundColor: "rgba(37, 99, 235, 0.06)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.canCreatePartners}
                  disabled={loading}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      canCreatePartners: event.target.checked,
                    }))
                  }
                  style={{ marginTop: "0.2rem" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "#1e3a8a" }}>
                    Allow this employee to create partners
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                    Enabled employees can create partners and will only see the
                    partners they created.
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Password Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#333",
              }}
            >
              Password
              <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  paddingRight: "2.5rem",
                  border: errors.password
                    ? "1px solid #ef4444"
                    : "1px solid #ddd",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password
                    ? "#ef4444"
                    : "#ddd";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0.25rem",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#333",
              }}
            >
              Confirm Password
              <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  paddingRight: "2.5rem",
                  border: errors.confirmPassword
                    ? "1px solid #ef4444"
                    : "1px solid #ddd",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.confirmPassword
                    ? "#ef4444"
                    : "#ddd";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0.25rem",
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#4f46e5";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#6366f1";
            }}
          >
            {loading ? (
              <>
                <Loader
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer */}
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
          Already have an account?{" "}
          <Link
            to="/admin/login"
            style={{
              color: "#6366f1",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Login here
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

export default UserRegisterPage;
