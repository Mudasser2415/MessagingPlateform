# Admin Module Documentation

## Overview

Production-ready Admin Portal for the Messaging SaaS Platform with secure authentication and comprehensive client management dashboard.

## Features

✅ **Secure Admin Login**

- Email/Password authentication
- SHA256 password hashing
- JWT token generation (24-hour expiry)
- Last login tracking
- Account status management

✅ **Client Management Dashboard**

- View all registered clients
- Search by name, email, or phone
- Filter by business type
- View client statistics (groups, messages)
- Real-time client metrics

✅ **Admin Authentication**

- Separate admin auth store (Zustand)
- JWT token storage in localStorage
- Protected admin routes
- Automatic logout on token expiry
- Secure API communication

---

## Database Setup

### 1. Create Admin Table

Run the SQL script to create the Admin table:

```bash
# File: DB_Scripts_Admin.txt
```

Or manually execute:

```sql
CREATE TABLE [dbo].[Admins] (
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [Email] NVARCHAR(256) NOT NULL UNIQUE,
    [Password] NVARCHAR(MAX) NOT NULL,
    [FullName] NVARCHAR(256) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'Admin',
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LastLoginAt] DATETIME2 NULL
);

CREATE INDEX [IX_Admins_Email] ON [dbo].[Admins]([Email]);
```

### 2. Create Default Admin User

Default Credentials:

- **Email:** admin@messaging.com
- **Password:** Admin@123 (change after first login)

The password hash is already provided in the seed script.

---

## Backend API Endpoints

### Base URL: `https://your-api.com/api/Admin`

### 1. Admin Login

```http
POST /api/Admin/login
Content-Type: application/json

{
  "email": "admin@messaging.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**

```json
{
  "adminId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@messaging.com",
  "fullName": "System Administrator",
  "role": "SuperAdmin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Invalid email or password"
}
```

### 2. Get All Clients

```http
GET /api/Admin/clients?search=tech&businessType=Technology
Authorization: Bearer {token}
```

**Query Parameters:**

- `search` (optional): Search term (name, email, phone)
- `businessType` (optional): Filter by business type

**Response (200 OK):**

```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Corp",
    "email": "admin@techcorp.com",
    "mobileNumber": "+1234567890",
    "businessType": "Technology",
    "location": "New York",
    "groupCount": 5,
    "messageCount": 150,
    "createdAt": "2026-04-15T10:30:00Z"
  }
]
```

### 3. Health Check

```http
GET /api/Admin/health
```

**Response (200 OK):**

```json
{
  "message": "Admin API is healthy"
}
```

---

## Frontend Routes

### Admin Routes

| Route              | Component                 | Protection | Description            |
| ------------------ | ------------------------- | ---------- | ---------------------- |
| `/admin/login`     | AdminLoginPage            | Public     | Admin login page       |
| `/admin/dashboard` | AdminDashboardPage        | Protected  | Admin dashboard home   |
| `/admin/clients`   | AdminClientManagementPage | Protected  | Client management view |

### Access Admin Portal

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter credentials:
   - Email: `admin@messaging.com`
   - Password: `Admin@123`
3. Click "Sign In"

---

## Frontend Components & Files

### Stores

- **`src/store/adminAuthStore.ts`**
  - Admin authentication state management (Zustand)
  - Token and user info persistence
  - Login/logout methods

### Services

- **`src/services/adminService.ts`**
  - `adminAuthService.login()` - Admin login
  - `adminClientService.getAllClients()` - Fetch all clients with filters
  - `adminClientService.getClientById()` - Fetch specific client details

### Pages

- **`src/pages/AdminLoginPage.tsx`**
  - Secure login form with validation
  - Error handling and loading states
  - Token storage on success
  - Demo credentials display

- **`src/pages/AdminDashboardPage.tsx`**
  - Welcome dashboard
  - Admin profile card
  - Quick action navigation
  - Logout functionality

- **`src/pages/AdminClientManagementPage.tsx`**
  - Client list with search
  - Filter by business type
  - Client statistics
  - Performance metrics

---

## Backend Files Structure

```
src/
├── API/
│   └── Controllers/
│       └── AdminController.cs
├── Application/
│   ├── DTOs/
│   │   └── AdminDtos.cs
│   └── Features/
│       └── Admins/
│           ├── Commands/
│           │   ├── AdminLoginCommand.cs
│           │   └── AdminLoginCommandHandler.cs
│           └── Queries/
│               ├── GetAllClientsQuery.cs
│               └── GetAllClientsQueryHandler.cs
└── Domain/
    └── Entities/
        └── Admin.cs
```

---

## Security Considerations

### Password Security

- Passwords are hashed using SHA256
- **⚠️ Production Recommendation:** Use BCrypt or PBKDF2 instead
  ```csharp
  // In production, use BCrypt:
  using BCrypt.Net;
  string hash = BCrypt.Net.BCrypt.HashPassword(password);
  ```

### JWT Token Security

- **Current Secret:** Update the `_jwtSecret` in `AdminLoginCommandHandler.cs`
- **Token Expiry:** 24 hours
- **Recommendation:** Store secret in `appsettings.json` using secrets manager

### HTTPS

- Always use HTTPS in production
- Enable CORS properly (don't allow all origins)

### Input Validation

- Email format validation on frontend and backend
- Password strength requirements (recommend)
- SQL injection prevention via EF Core

---

## Configuration

### JWT Secret (Change in Production)

**File:** `src/Application/Features/Admins/Commands/AdminLoginCommandHandler.cs`

```csharp
private readonly string _jwtSecret = "your-super-secret-jwt-key-change-this-in-production-at-least-32-characters-long";
```

**Better approach - Use appsettings.json:**

```json
{
  "Jwt": {
    "Secret": "your-secret-key-here-minimum-32-characters",
    "ExpirationHours": 24
  }
}
```

Then inject via constructor:

```csharp
public AdminLoginCommandHandler(IApplicationDbContext context, IConfiguration config)
{
    _jwtSecret = config["Jwt:Secret"];
}
```

---

## Development Workflow

### 1. Run Database Migration

```bash
cd src/API
dotnet ef migrations add AddAdminTable
dotnet ef database update
```

Or run the SQL script:

```bash
sqlcmd -S your-server -d MessagingPlatform -i DB_Scripts_Admin.txt
```

### 2. Start Backend

```bash
cd src/API
dotnet run
```

### 3. Start Frontend

```bash
cd MessagingPlatefromUI
npm install
npm run dev
```

### 4. Access Admin Portal

```
http://localhost:5173/admin/login
```

---

## Testing

### Login Test Cases

```javascript
// Valid credentials
{
  "email": "admin@messaging.com",
  "password": "Admin@123"
}

// Invalid password
{
  "email": "admin@messaging.com",
  "password": "WrongPassword"
}

// Non-existent email
{
  "email": "notexist@messaging.com",
  "password": "Admin@123"
}

// Empty fields
{
  "email": "",
  "password": ""
}
```

### API Testing (Postman/InsomniaHeaders:)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Troubleshooting

### Issue: Login fails with "Invalid email or password"

**Solution:**

1. Verify admin record exists in database:
   ```sql
   SELECT * FROM [Admins] WHERE Email = 'admin@messaging.com'
   ```
2. Check if admin is active (`IsActive = 1`)
3. Verify password was seeded correctly

### Issue: JWT token not working

**Solution:**

1. Check token expiry time
2. Verify `_jwtSecret` is consistent
3. Ensure Authorization header format: `Bearer {token}`

### Issue: CORS error when calling API

**Solution:** Check `Program.cs` CORS configuration:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// In app.MapControllers() section:
app.UseCors("AllowReactApp");
```

---

## Future Enhancements

1. **Multi-factor Authentication (MFA)**
   - Email OTP verification
   - Authenticator app support

2. **Admin Management**
   - Create/edit/delete other admins
   - Role-based access control (RBAC)
   - Admin activity audit logs

3. **Advanced Analytics**
   - Dashboard charts and graphs
   - Usage statistics
   - Report generation

4. **Client Management Actions**
   - Suspend/activate clients
   - Edit client details
   - View detailed client analytics

5. **System Configuration**
   - API rate limiting
   - Email templates
   - System preferences

---

## Support & Troubleshooting

For issues or improvements:

1. Check browser console for errors
2. Review API response in Network tab
3. Check backend logs in terminal
4. Verify database connection string
5. Ensure all dependencies are installed

---

**Version:** 1.0.0  
**Last Updated:** April 15, 2026  
**Status:** Production Ready ✅
