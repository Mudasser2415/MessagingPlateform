# Registration Pages - Quick Reference

## 🚀 Quick Start

**Access Registration Page:**

```
http://localhost:5173/admin/register
```

**Or from Admin Login Page:**
Click "Register here" link

---

## 📝 Registration Form Fields

| Field            | Type     | Required | Format         | Notes                                     |
| ---------------- | -------- | -------- | -------------- | ----------------------------------------- |
| Full Name        | text     | Yes      | Min 2 chars    | Any valid name                            |
| Mobile Number    | tel      | Yes      | 03XX-XXXXXXX   | Pakistan format                           |
| Email            | email    | No       | Valid email    | Optional but validated                    |
| Password         | password | Yes      | 6+ chars       | Must include uppercase, lowercase, number |
| Confirm Password | password | Yes      | Match password | Must identical to password                |
| Account Type     | radio    | Yes      | Admin/Employee | Select role                               |

---

## ✅ Validation Rules

### Name

```
❌ Empty
❌ Less than 2 characters
✅ Any text 2+ characters
```

### Mobile Number

```
❌ Empty
❌ Wrong format
✅ 03001234567
✅ 0301-1234567
✅ +923001234567
```

### Email (Optional)

```
❌ Invalid format (if provided)
✅ admin@example.com
✅ user.name@domain.co.uk
✅ (optional - can be left empty)
```

### Password

```
❌ Less than 6 characters
❌ No uppercase letter
❌ No lowercase letter
❌ No number
✅ SecurePass123
✅ MyPassword2024
```

---

## 🔧 API Integration

**POST** `/api/user-auth/register`

```javascript
// Request
{
  name: "John Ahmed",
  mobileNumber: "03001234567",
  email: "john@example.com",
  password: "SecurePass123",
  role: "Admin"
}

// Response - Success (200)
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  userId: "ba27a725-8660-42b2-a863-e175a3091997",
  role: "Admin",
  name: "John Ahmed",
  mobileNumber: "03001234567"
}

// Response - Error (400)
{
  message: "Mobile number already registered"
}
```

---

## 🎯 What Happens After Registration

1. ✅ Form validates all fields
2. ✅ API creates user in database
3. ✅ JWT token generated automatically
4. ✅ Success message displays (green)
5. ✅ Auto-login with received token
6. ✅ 2-second delay
7. ✅ Redirect to dashboard:
   - Admin → `/admin/dashboard`
   - Employee → `/dashboard`

---

## 🎨 Form States

### Default State

```
- All fields empty
- All inputs enabled
- Button says "Create Account"
- No errors shown
```

### Loading State

```
- All fields disabled
- Form cannot be submitted
- Button shows spinner: "Creating Account..."
```

### Error State

```
- Invalid fields have red border
- Error text appears below field
- Button re-enabled after error
- User can correct and retry
```

### Success State

```
- Green success notification appears
- "Registration successful! Redirecting..."
- Auto-redirect after 2 seconds
```

---

## 🎨 UI Features

| Feature         | Implementation                     |
| --------------- | ---------------------------------- |
| Password Toggle | Eye icon to show/hide              |
| Role Cards      | Visual selection with descriptions |
| Focus States    | Blue shadow and border             |
| Loading Spinner | Animated spinner on button         |
| Error Styling   | Red border and error text          |
| Success Toast   | Green notification at top-right    |
| Responsive      | Works on mobile, tablet, desktop   |

---

## 🔐 Security

- **Password Hashing**: BCrypt (12-round salt)
- **Transport**: HTTPS (production only)
- **Token**: JWT with 60-min expiry
- **Validation**: Client + server side
- **Duplicate Check**: Mobile & email uniqueness
- **No Plain Text**: Passwords never stored as text

---

## 🧪 Common Test Cases

### ✅ Happy Path

```
1. Fill all fields correctly
2. Click "Create Account"
3. See success message
4. Auto-redirect to dashboard
```

### ❌ Validation Error

```
1. Leave Name empty
2. Click "Create Account"
3. See error: "Name is required"
4. Form stays on page
```

### ❌ Password Mismatch

```
1. Password: SecurePass123
2. Confirm: SecurePass456
3. Click "Create Account"
4. Error: "Passwords do not match"
```

### ❌ Mobile Already Exists

```
1. Use existing mobile: 03001234567
2. Click "Create Account"
3. Server error: "Mobile number already registered"
```

---

## 🌐 Routes

```
/admin/register          → Registration page
/admin/login            → Login page (has link to register)
/admin/dashboard        → Redirect after admin registration
/dashboard              → Redirect after employee registration
```

---

## 📂 Files Reference

**Main Component:**

```
MessagingPlatefromUI/src/pages/UserRegisterPage.tsx
```

**Auth Service Method:**

```
MessagingPlatefromUI/src/services/adminService.ts
→ adminAuthService.registerUser()
```

**Router Configuration:**

```
MessagingPlatefromUI/src/App.tsx
→ <Route path="/admin/register" />
```

**Login Page Link:**

```
MessagingPlatefromUI/src/pages/AdminLoginPage.tsx
→ Link to="/admin/register"
```

---

## 🐛 Troubleshooting

### "Mobile number already registered"

- Mobile already exists in database
- Use different mobile number
- Or login with existing account

### "Invalid Pakistan mobile number"

- Format is incorrect
- Use format: 03XX-XXXXXXX
- Or: +923XX-XXXXXXX

### "Passwords do not match"

- Password fields are different
- Retype both fields carefully
- Click eye icon to verify

### "Please enter a valid email"

- Email format is wrong
- Or leave email empty (it's optional)
- Format: user@domain.com

### "Registration failed"

- Check internet connection
- Verify API is running (localhost:5008)
- Check browser console for details

### Page not found (404)

- Verify route: /admin/register
- Check App.tsx has the route
- Clear browser cache and reload

---

## 💡 User Tips

1. **Mobile Number**: Must be Pakistani format (03XX-XXXXXXX)
2. **Password**: Make it strong - 6+ chars, uppercase, lowercase, number
3. **Email**: Optional, but helpful for password recovery
4. **Role**: Choose based on your needs
   - **Admin**: Full platform access
   - **Employee**: Limited access
5. **Success**: After registration, you're automatically logged in!

---

## 🎯 For Frontend Developers

### Import the page in App.tsx:

```typescript
import { UserRegisterPage } from "./pages/UserRegisterPage";
```

### Add the route:

```typescript
<Route
  path="/admin/register"
  element={<UserRegisterPage />}
/>
```

### Use the service method:

```typescript
const response = await adminAuthService.registerUser(
  name,
  mobileNumber,
  email,
  password,
  role,
);
```

---

## 📊 Response Mapping

API returns user data that maps to admin auth store:

```
API Response          →  Auth Store
userId               →  adminId
name                 →  fullName
role                 →  role
token                →  token (JWT)
email                →  email
mobileNumber         →  mobileNumber (extra)
```

---

## ✨ Features Summary

✅ Real-time validation  
✅ Strength indicator for password  
✅ Show/hide password toggle  
✅ Visual role selection  
✅ Loading state during submission  
✅ Success notification  
✅ Auto-login after registration  
✅ Smart redirect based on role  
✅ Mobile responsive design  
✅ Clear error messages  
✅ Duplicate detection  
✅ Pakistan mobile format validation

---

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** April 16, 2026
