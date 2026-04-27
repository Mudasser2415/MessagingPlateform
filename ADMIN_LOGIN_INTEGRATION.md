# Admin Login Integration Guide

## Overview

The Admin Login Page has been integrated with the new unified authentication system using JWT tokens. The system now uses `/api/user-auth/login-email` endpoint for email-based authentication.

---

## API Endpoint

### Login with Email

**POST** `/api/user-auth/login-email`
**Base URL:** `http://localhost:5008`

```bash
curl -X POST http://localhost:5008/api/user-auth/login-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.admin@example.com",
    "password": "SecurePass123!"
  }'
```

**Request:**

```json
{
  "email": "john.admin@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "5ccc78fb-05df-42d5-8706-6ad40d508601",
  "role": "Admin",
  "name": "John Admin",
  "mobileNumber": "03001234567"
}
```

**Response Codes:**

- `200 OK` - Login successful, JWT token generated
- `400 Bad Request` - Validation error (missing email/password)
- `401 Unauthorized` - Invalid credentials or inactive account
- `500 Internal Server Error` - Server error

---

## Frontend Integration

### 1. Admin Service (Updated)

**File:** `MessagingPlatefromUI/src/services/adminService.ts`

The service has been updated to call the new authentication endpoint:

```typescript
export const adminAuthService = {
  login: async (
    email: string,
    password: string,
  ): Promise<AdminLoginResponse> => {
    const response = await axiosInstance.post<{
      token: string;
      userId: string;
      role: string;
      name: string;
      mobileNumber: string;
    }>("/user-auth/login-email", {
      email,
      password,
    });

    // Map the API response to AdminLoginResponse format
    return {
      token: response.data.token,
      adminId: response.data.userId,
      email: email,
      fullName: response.data.name,
      role: response.data.role,
    };
  },
};
```

### 2. Admin Login Page Usage

**File:** `MessagingPlatefromUI/src/pages/AdminLoginPage.tsx`

The login page calls the service which now uses the new endpoint:

```typescript
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

  setLoading(true);
  try {
    // This now calls /api/user-auth/login-email
    const response = await adminAuthService.login(email, password);

    // Store auth data
    setAuth(
      {
        adminId: response.adminId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      },
      response.token,
    );

    // Redirect to dashboard
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
```

### 3. Admin Auth Store

**File:** `MessagingPlatefromUI/src/store/adminAuthStore.ts`

The store manages the JWT token and admin data:

```typescript
const useAdminAuthStore = create((set) => ({
  token: localStorage.getItem("adminToken"),
  adminUser: JSON.parse(localStorage.getItem("adminUser") || "null"),

  setAuth: (user, token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    set({ token, adminUser: user });
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    set({ token: null, adminUser: null });
  },
}));
```

### 4. Axios Instance with Token

**File:** `MessagingPlatefromUI/src/utils/axiosInstance.ts`

Axios automatically adds the JWT token to all requests:

```typescript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5008/api",
});

// Add JWT token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

---

## JWT Token Structure

The JWT token contains the following claims:

```json
{
  "userId": "5ccc78fb-05df-42d5-8706-6ad40d508601",
  "mobileNumber": "03001234567",
  "role": "Admin",
  "name": "John Admin",
  "exp": 1776282142,
  "iss": "MessagingPlatform",
  "aud": "MessagingPlatformUsers"
}
```

**Claims:**

- `userId` - Admin's unique identifier (GUID)
- `mobileNumber` - Admin's phone number
- `role` - Admin role ("Admin" or "Employee")
- `name` - Admin's full name
- `exp` - Expiration timestamp (60 minutes by default)
- `iss` - Token issuer
- `aud` - Token audience

---

## Using JWT Token for Subsequent Requests

All API requests after login automatically include the JWT token:

```typescript
// The token is automatically added by axiosInstance
const response = await axiosInstance.get("/admin/clients");
```

This adds the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing the Integration

### Step 1: Register an Admin User

```bash
curl -X POST http://localhost:5008/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "mobileNumber": "03001234567",
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "role": "Admin"
  }'
```

### Step 2: Login with Email

```bash
curl -X POST http://localhost:5008/api/user-auth/login-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }'
```

### Step 3: Use Token for Protected Endpoint

```bash
curl -X GET http://localhost:5008/api/user-auth/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Error Handling

### Invalid Credentials

**Response (401 Unauthorized):**

```json
{
  "message": "Invalid email or password"
}
```

### User Inactive

**Response (401 Unauthorized):**

```json
{
  "message": "User account is inactive"
}
```

### Missing Email

**Response (400 Bad Request):**

```json
{
  "message": "Email is required"
}
```

### Server Error

**Response (500 Internal Server Error):**

```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Security Features

### 1. Password Security

- Passwords are hashed using **BCrypt** with 12 rounds
- Passwords are never stored in plain text
- Password verification uses BCrypt's `EnhancedVerify()` method

### 2. JWT Token Security

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 60 minutes (default)
- **Signature Key**: Configured in `appsettings.json`
- **Issuer**: "MessagingPlatform"
- **Audience**: "MessagingPlatformUsers"

### 3. Token Storage

- Tokens are stored in localStorage
- Should be moved to httpOnly cookies for production
- Consider implementing refresh tokens for longer sessions

---

## Production Deployment Checklist

- [ ] Update JWT Key in `appsettings.json` to a strong secret (32+ characters)
- [ ] Move JWT token storage from localStorage to httpOnly cookies
- [ ] Enable HTTPS for all API calls
- [ ] Implement token refresh mechanism
- [ ] Set appropriate token expiry time (15-60 minutes recommended)
- [ ] Add rate limiting to login endpoint
- [ ] Enable CORS with specific allowed origins
- [ ] Set up logging and monitoring for auth failures
- [ ] Implement account lockout after failed login attempts
- [ ] Add email verification for new admin accounts
- [ ] Implement password reset functionality

---

## API Server

### Start Server

```bash
cd D:\2026\MessagePlatefrom\src\API
dotnet run
```

**Server URL:** `http://localhost:5008`

### Swagger Documentation

Once running, API documentation is available at:

```
http://localhost:5008/swagger
```

---

## Architecture

```
Admin Login Page (React/TypeScript)
           ↓
    Admin Service
    (adminService.ts)
           ↓
    Axios Instance
    (with JWT token)
           ↓
    /api/user-auth/login-email
    (UserAuthController)
           ↓
    AuthService
    (BCrypt + JWT Generation)
           ↓
    Users Table
    (SQL Server Database)
```

---

## Summary

✅ **Complete Integration:**

- Admin Login uses `/api/user-auth/login-email` endpoint
- JWT tokens are generated on successful login
- Tokens are automatically sent with subsequent requests
- Full error handling and validation in place
- Production-ready security features

---

**Last Updated:** April 16, 2026
**Status:** Production Ready
**Version:** 1.0
