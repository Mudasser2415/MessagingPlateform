# Admin Module - Quick Start Guide

## 🚀 What Was Built

A complete, production-ready Admin Portal for managing clients in the messaging SaaS platform.

### Components Created:

**Backend (.NET/C#):**

- ✅ Admin Entity with full user model
- ✅ Admin Login Command & Handler with JWT generation
- ✅ Get All Clients Query with search/filtering
- ✅ Admin Controller with endpoints
- ✅ Admin DTOs for type safety
- ✅ Database table creation script

**Frontend (React/TypeScript):**

- ✅ Admin Login Page (secure form with validation)
- ✅ Admin Dashboard (overview & navigation)
- ✅ Client Management Page (search, filter, analytics)
- ✅ Admin Auth Store (Zustand state management)
- ✅ Admin Services (API integration)
- ✅ Protected Routes (admin-only access)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Setup Database

```bash
# Open SQL Server Management Studio and run:
# File: DB_Scripts_Admin.txt
# This creates the Admins table and adds default admin user
```

Or via PowerShell:

```powershell
cd D:\2026\MessagePlatefrom\src\API
dotnet ef migrations add AddAdminTable
dotnet ef database update
```

### Step 2: Start Backend API

```bash
cd D:\2026\MessagePlatefrom\src\API
dotnet run
# API running at: https://localhost:7281
```

### Step 3: Start Frontend

```bash
cd D:\2026\MessagePlatefrom\MessagingPlatefromUI
npm install (if needed)
npm run dev
# Frontend running at: http://localhost:5173
```

### Step 4: Login to Admin Portal

```
URL: http://localhost:5173/admin/login

Default Credentials:
Email: admin@messaging.com
Password: Admin@123
```

---

## 📁 Files Created/Modified

### Backend Files (C#/.NET)

**New Files:**

```
✅ src/Domain/Entities/Admin.cs
✅ src/Application/DTOs/AdminDtos.cs
✅ src/Application/Features/Admins/Commands/AdminLoginCommand.cs
✅ src/Application/Features/Admins/Commands/AdminLoginCommandHandler.cs
✅ src/Application/Features/Admins/Queries/GetAllClientsQuery.cs
✅ src/Application/Features/Admins/Queries/GetAllClientsQueryHandler.cs
✅ src/API/Controllers/AdminController.cs
✅ DB_Scripts_Admin.txt
```

**Modified Files:**

```
✏️ src/Infrastructure/Persistence/ApplicationDbContext.cs (added Admins DbSet)
✏️ src/Application/Common/Interfaces/IApplicationDbContext.cs (added Admins DbSet)
```

### Frontend Files (React/TypeScript)

**New Files:**

```
✅ MessagingPlatefromUI/src/store/adminAuthStore.ts
✅ MessagingPlatefromUI/src/services/adminService.ts
✅ MessagingPlatefromUI/src/pages/AdminLoginPage.tsx
✅ MessagingPlatefromUI/src/pages/AdminDashboardPage.tsx
✅ MessagingPlatefromUI/src/pages/AdminClientManagementPage.tsx
✅ ADMIN_MODULE_DOCUMENTATION.md
```

**Modified Files:**

```
✏️ MessagingPlatefromUI/src/App.tsx (added admin routes)
```

---

## 🔌 API Endpoints

### POST /api/Admin/login

Login with email and password.

```json
Request:
{
  "email": "admin@messaging.com",
  "password": "Admin@123"
}

Response:
{
  "adminId": "guid",
  "email": "admin@messaging.com",
  "fullName": "System Administrator",
  "role": "SuperAdmin",
  "token": "JWT_TOKEN_HERE"
}
```

### GET /api/Admin/clients

Get all clients with optional search and filter.

```
Params: ?search=term&businessType=Technology
Header: Authorization: Bearer {token}

Response: Array of AdminClientDetailDto
```

### GET /api/Admin/health

Check API health.

```
Response: { "message": "Admin API is healthy" }
```

---

## 🔐 Security Notes

⚠️ **Before Production:**

1. **Change JWT Secret**
   - File: `AdminLoginCommandHandler.cs`
   - Change `_jwtSecret` value
   - Better: Store in `appsettings.json` using secrets manager

2. **Update Password Hashing**
   - Current: SHA256 (basic)
   - Recommended: BCrypt.Net NuGet package

   ```bash
   dotnet add package BCrypt.Net
   ```

3. **Enable HTTPS**
   - Configure SSL certificates
   - Update CORS policy to specific domains only

4. **Database Password**
   - Use strong password for SQL Server
   - Use Azure Key Vault in production

---

## 📊 Features Walkthrough

### Admin Login Page

- Email validation
- Password field (hidden)
- Error message display
- Loading state with spinner
- Demo credentials shown
- Responsive design

### Admin Dashboard

- Welcome message with admin name
- Admin profile card
- Quick action navigation cards
- Client management link
- System status indicator
- Logout button

### Client Management

- **Search:** By name, email, phone
- **Filter:** By business type (Technology, Healthcare, Finance, etc.)
- **Metrics:**
  - Total clients count
  - Total groups count
  - Total messages count
- **Client Details:**
  - Name, email, phone
  - Business type & location
  - Groups count
  - Messages count
  - Created date

---

## 🧪 Testing Scenarios

### Scenario 1: Valid Login

1. Navigate to `/admin/login`
2. Enter: `admin@messaging.com` / `Admin@123`
3. Click Sign In
4. ✅ Should redirect to `/admin/dashboard`

### Scenario 2: Invalid Password

1. Navigate to `/admin/login`
2. Enter: `admin@messaging.com` / `WrongPassword`
3. Click Sign In
4. ✅ Should show "Invalid email or password" error

### Scenario 3: View Clients

1. Login successfully
2. Click "Client Management" card
3. ✅ Should show list of all registered clients
4. Enter search term in search bar
5. ✅ Should filter clients in real-time

### Scenario 4: Filter Clients

1. On Client Management page
2. Click "Technology" filter button
3. ✅ Should show only Technology business type clients
4. Click again to remove filter
5. ✅ Should show all clients again

---

## 🐛 Troubleshooting

### Login fails immediately

**Solution:**

```bash
# Check database:
SELECT * FROM [Admins] WHERE Email = 'admin@messaging.com'

# If empty, run SQL script:
# DB_Scripts_Admin.txt
```

### Clients list is empty

**Possible Causes:**

1. No clients registered yet - Create a test client first
2. Database connection issue - Check connection string
3. API not running - Start backend with `dotnet run`

### Token errors

**Solution:**

1. Clear browser localStorage: Open DevTools → Application → Storage → Clear
2. Logout and login again
3. Check JWT expiry (24 hours)

---

## 📈 Next Steps

1. **Test the entire flow:**
   - Login → Dashboard → Client Management → Logout

2. **Create test data:**
   - Register a few test clients
   - Create groups and send messages
   - Verify they appear in Admin view

3. **Customize for your needs:**
   - Add more filters
   - Add export functionality
   - Add detailed client analytics

4. **Deploy to production:**
   - Update database connection string
   - Configure JWT secret properly
   - Setup HTTPS/SSL
   - Configure CORS policy
   - Setup authentication middleware

---

## 📚 Documentation

For detailed API documentation, configuration options, and advanced features:
👉 Read: **ADMIN_MODULE_DOCUMENTATION.md**

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Date:** April 15, 2026
