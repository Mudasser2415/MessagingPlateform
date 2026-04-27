# Quick Reference: Admin Login via API

## 🚀 TL;DR - What's Ready

✅ **Endpoint:** `POST /api/user-auth/login-email`  
✅ **Auth Service:** Updated to use new endpoint  
✅ **Admin Login Page:** Already working with new API  
✅ **Login Modal:** New reusable component created  
✅ **API Server:** Running on `http://localhost:5008`

---

## 📝 Login Flow

### 1. Admin enters credentials

```
Email: admin.test@platform.com
Password: Test123!
```

### 2. Frontend calls API

```javascript
POST http://localhost:5008/api/user-auth/login-email
{
  "email": "admin.test@platform.com",
  "password": "Test123!"
}
```

### 3. API returns JWT token

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "ba27a725-8660-42b2-a863-e175a3091997",
  "role": "Admin",
  "name": "Admin Test",
  "mobileNumber": "03119999999"
}
```

### 4. Store token and redirect

```typescript
localStorage.setItem("adminToken", response.token);
navigate("/admin/dashboard");
```

---

## 💻 Code Examples

### Use LoginModal Component

```typescript
import LoginModal from "@/components/LoginModal";

<LoginModal
  isOpen={isLoginOpen}
  onClose={() => setIsLoginOpen(false)}
  onLoginSuccess={(auth) => {
    // Handle successful login
    setAuth(auth);
  }}
/>
```

### Manual API Call

```typescript
const response = await axiosInstance.post("/user-auth/login-email", {
  email: "admin@example.com",
  password: "SecurePass123!",
});

const { token, userId, role, name } = response.data;
localStorage.setItem("adminToken", token);
```

### Protected API Calls

```typescript
// Token automatically added to requests
const clients = await axiosInstance.get("/admin/clients");
// Now includes: Authorization: Bearer [JWT_TOKEN]
```

---

## 🔒 Security Notes

- ✅ Passwords hashed with BCrypt (salted + 12 rounds)
- ✅ JWT tokens signed with HS256
- ✅ Tokens expire after 60 minutes
- ✅ User must be active (IsActive = true)
- ✅ Role-based authorization on endpoints
- ⚠️ Store token in httpOnly cookies (production)

---

## 🧪 Test Login

### Create Test Admin User

```bash
curl -X POST http://localhost:5008/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "mobileNumber": "0311XXXXXXXX",
    "email": "test@admin.com",
    "password": "Test123!",
    "role": "Admin"
  }'
```

### Login with Email

```bash
curl -X POST http://localhost:5008/api/user-auth/login-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@admin.com",
    "password": "Test123!"
  }'
```

---

## 📁 Files Reference

### Backend

- `src/API/Controllers/UserAuthController.cs` - Login endpoints
- `src/Infrastructure/Services/AuthService.cs` - Auth logic
- `src/Application/DTOs/AuthDtos.cs` - Login DTO

### Frontend

- `MessagingPlatefromUI/src/components/LoginModal.tsx` - Modal component
- `MessagingPlatefromUI/src/styles/modal.css` - Modal styles
- `MessagingPlatefromUI/src/services/adminService.ts` - API service

### Documentation

- `ADMIN_LOGIN_INTEGRATION.md` - Complete guide
- `LOGIN_MODAL_USAGE.md` - Modal examples
- `ADMIN_LOGIN_IMPLEMENTATION_COMPLETE.md` - Full summary

---

## 🔗 API Endpoints

| Method | Endpoint                       | Auth  | Purpose             |
| ------ | ------------------------------ | ----- | ------------------- |
| POST   | `/api/user-auth/register`      | No    | Register user       |
| POST   | `/api/user-auth/login`         | No    | Login via mobile    |
| POST   | `/api/user-auth/login-email`   | No    | **Login via email** |
| GET    | `/api/user-auth/profile`       | Yes   | Get profile         |
| GET    | `/api/user-auth/user/{mobile}` | Admin | Get user by mobile  |

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "Jwt": {
    "Key": "your-secret-32-character-key",
    "Issuer": "MessagingPlatform",
    "Audience": "MessagingPlatformUsers",
    "ExpiryMinutes": 60
  }
}
```

### Axios Base URL

```typescript
// MessagingPlatefromUI/src/utils/axiosInstance.ts
baseURL: "http://localhost:5008/api";
```

---

## 🐛 Troubleshooting

**Login returns 401?**

- Check email/password are correct
- Verify user is active in database
- Check if email exists in Users table

**Token not included in requests?**

- Verify token is in localStorage
- Check axios interceptor is working
- Ensure Authorization header is set

**CORS error?**

- Verify API is running on port 5008
- Check allowed origins in backend
- Frontend should call http://localhost:5008/api

**API not responding?**

- Start backend: `dotnet run` in src/API folder
- Check server is listening on 5008
- Verify database connection is valid

---

## ✅ What's Working

✅ User registration via API  
✅ Email-based login  
✅ Mobile-based login  
✅ JWT token generation  
✅ Admin service integration  
✅ Login modal component  
✅ Protected endpoints with [Authorize]  
✅ Role-based authorization  
✅ Error handling and validation  
✅ Database persistence

---

## 📞 Need Help?

1. **API Documentation:** `http://localhost:5008/swagger`
2. **Backend Issues:** Check `src/API/appsettings.json`
3. **Frontend Issues:** Check `MessagingPlatefromUI/src/services/adminService.ts`
4. **Database Issues:** Verify SQL Server connection string
5. **JWT Issues:** Verify JWT Key is set in appsettings.json

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** April 16, 2026
