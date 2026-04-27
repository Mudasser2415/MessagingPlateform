# Registration Pages - Visual Guide & User Flow

## 📱 Page Layout Visualization

```
┌────────────────────────────────────────────┐
│          REGISTRATION PAGE                 │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────┐   │
│  │           REGISTRATION CARD        │   │
│  ├────────────────────────────────────┤   │
│  │                                    │   │
│  │  🧑 Messaging Platform             │   │
│  │                                    │   │
│  │  Create Account                    │   │
│  │  Register to start using...        │   │
│  │                                    │   │
│  ├────────────────────────────────────┤   │
│  │                                    │   │
│  │  Full Name                         │   │
│  │  [________________________]         │   │
│  │                                    │   │
│  │  Mobile Number                     │   │
│  │  [________________________]         │   │
│  │                                    │   │
│  │  Email Address (Optional)          │   │
│  │  [________________________]         │   │
│  │                                    │   │
│  │  Account Type                      │   │
│  │  ┌──────────┐  ┌──────────┐       │   │
│  │  │ ◉ Admin  │  │ O Emply  │       │   │
│  │  │ Full acc │  │ Limited  │       │   │
│  │  └──────────┘  └──────────┘       │   │
│  │                                    │   │
│  │  Password                          │   │
│  │  [________________________]  👁️     │   │
│  │                                    │   │
│  │  Confirm Password                  │   │
│  │  [________________________]  👁️     │   │
│  │                                    │   │
│  │  [   CREATE ACCOUNT    ]           │   │
│  │                                    │   │
│  ├────────────────────────────────────┤   │
│  │ Already have account?              │   │
│  │         [Login here]               │   │
│  └────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🔄 Registration Flow Diagram

```
START
  ↓
[Access /admin/register]
  ↓
[Display Registration Form]
  │
  ├─→ User fills form
  │    ↓
  ├─→ Real-time validation
  │    │
  │    ├─→ Error? Show inline message
  │    │    ↓
  │    │ User corrects
  │    │    ↓
  │    └─→ Continue
  │
  ├─→ Click "Create Account"
  │    ↓
  ├─→ Client-side validation
  │    │
  │    ├─→ Invalid? Show errors
  │    │    ↓
  │    │ Don't submit
  │    │
  │    └─→ Valid? Continue
  │         ↓
  ├─→ Submit to API
  │    ↓
  ├─→ Disable form (loading)
  │    ├─→ Show spinner
  │    ├─→ Disable inputs
  │    │    ↓
  │    ├─→ Wait for API response
  │    │
  │    ├─→ SUCCESS
  │    │    ├─→ Show green success
  │    │    ├─→ Auto-login user
  │    │    ├─→ Store JWT token
  │    │    ├─→ Wait 2 seconds
  │    │    ├─→ Redirect to:
  │    │    │   - Admin → /admin/dashboard
  │    │    │   - Employee → /dashboard
  │    │    └─→ END ✓
  │    │
  │    └─→ ERROR
  │         ├─→ Show red error message
  │         ├─→ Re-enable form
  │         ├─→ User can retry
  │         └─→ Continue filling form
  │
END
```

---

## 🎯 Form Fields with Validation

### Field 1: Full Name

```
┌─────────────────────────────────┐
│ Full Name *                     │
├─────────────────────────────────┤
│ John Doe (or John Ahmed Corp)   │  ← Placeholder
│                                 │
│ Input: "Jo"  → Error shown ❌    │
│ Input: "John Doe"  → OK ✓       │
└─────────────────────────────────┘

Validation Rules:
✓ Required
✓ Minimum 2 characters
✓ Any text accepted
```

### Field 2: Mobile Number

```
┌──────────────────────────────────┐
│ Mobile Number *                  │
├──────────────────────────────────┤
│ 03001234567 or +923001234567     │  ← Placeholder
│                                  │
│ Input: "123"  → Error ❌         │
│ Error: "Enter valid Pakistan..." │
│                                  │
│ Input: "03001234567"  → OK ✓     │
└──────────────────────────────────┘

Validation Rules:
✓ Required
✓ Pakistan format only:
  - 03XX-XXXXXXX (local)
  - +923XX-XXXXXXX (international)
✓ Must be unique in database
```

### Field 3: Email Address (Optional)

```
┌────────────────────────────────────┐
│ Email Address (Optional)           │
├────────────────────────────────────┤
│ john@example.com                   │  ← Placeholder
│                                    │
│ Input: "notvalidemail"  → Error ❌ │
│ Input: "john@domain.com"  → OK ✓   │
│ Input: "" (empty)  → OK ✓ (optional)
└────────────────────────────────────┘

Validation Rules:
✓ Optional field
✓ Valid email if provided
✓ Must be unique if provided
```

### Field 4: Account Type (Role Selection)

```
┌──────────────────────────────────┐
│ Account Type *                   │
├──────────────────────────────────┤
│                                  │
│  ┌─────────────┐ ┌─────────────┐│
│  │ ◉ Admin     │ │ O Employee  ││
│  │             │ │             ││
│  │ Full access │ │ Limited     ││
│  │ to platform │ │ access      ││
│  └─────────────┘ └─────────────┘│
│                                  │
│ Admin selected → Role = "Admin"   │
│ Employee selected → Role = "Employee"
└──────────────────────────────────┘

Validation Rules:
✓ Required - must select one
✓ Determines dashboard redirect
✓ Cannot be changed after registration
```

### Field 5: Password

```
┌──────────────────────────────────────┐
│ Password *                           │
├──────────────────────────────────────┤
│ ••••••••••••••  [👁️ show]            │
│                                      │
│ Input: "123"  → Error ❌             │
│ Errors:                              │
│ ❌ Too short (need 6+ chars)         │
│ ❌ No uppercase letter               │
│ ❌ No number                         │
│                                      │
│ Input: "SecurePass123"  → OK ✓       │
│ Reqs met:                            │
│ ✓ 6+ characters                      │
│ ✓ Uppercase letter (S, P)            │
│ ✓ Lowercase letters                  │
│ ✓ Number (1, 2, 3)                   │
└──────────────────────────────────────┘

Validation Rules:
✓ Required
✓ Minimum 6 characters
✓ At least 1 uppercase (A-Z)
✓ At least 1 lowercase (a-z)
✓ At least 1 number (0-9)
✓ Show/hide toggle available
```

### Field 6: Confirm Password

```
┌──────────────────────────────────────┐
│ Confirm Password *                   │
├──────────────────────────────────────┤
│ ••••••••••••••  [👁️ show]            │
│                                      │
│ If Password: "SecurePass123"         │
│ Confirm: "DifferentPass456"  → ❌    │
│ Error: "Passwords do not match"      │
│                                      │
│ Confirm: "SecurePass123"  → ✓        │
│                                      │
└──────────────────────────────────────┘

Validation Rules:
✓ Required
✓ Must exactly match Password field
✓ Show/hide toggle available
✓ Case-sensitive
```

---

## 🎨 Form States Visualization

### DEFAULT STATE (All fields empty, ready to fill)

```
┌─────────────────────────────┐
│ Full Name                   │
│ [                         ] │ ← Gray border
│                             │
│ Mobile Number               │
│ [                         ] │ ← Gray border
│                             │
│ [CREATE ACCOUNT]            │ ← Blue button, enabled
└─────────────────────────────┘
```

### FOCUSED STATE (Field has focus)

```
┌─────────────────────────────┐
│ Full Name                   │
│ [███████████████████████]   │ ← Blue border, blue shadow
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ (focused)
└─────────────────────────────┘
```

### ERROR STATE (Field has validation error)

```
┌─────────────────────────────┐
│ Full Name                   │
│ [Jo                       ] │ ← Red border
│ ❌ Name must be 2+ characters
│                             │
│ [CREATE ACCOUNT]            │ ← Button disabled?  NO
└─────────────────────────────┘
(User can still try to submit, server will catch)
```

### LOADING STATE (Form submitting)

```
┌──────────────────────────────────┐
│ Full Name                        │
│ [John Doe               ]         │ ← Disabled (grayed)
│                                  │
│ Mobile Number                    │
│ [03001234567            ]        │ ← Disabled (grayed)
│                                  │
│ [ ↻ CREATING ACCOUNT...]         │ ← Spinner, disabled
│                                  │
│ Already have account? Login here │
└──────────────────────────────────┘
Forms locked, user cannot change it
```

### SUCCESS STATE (Registration complete)

```
┌─────────────────────────────────┐
│           🟢                     │
│ Registration successful!         │
│ Redirecting...                  │
│                                 │
│ (Progress: 2 seconds until...)  │
│            ▓▓▓░░░░░░░░          │
│                                 │
│ Will redirect to:               │
│ /admin/dashboard or /dashboard  │
└─────────────────────────────────┘
```

---

## 🎯 User Journey Examples

### Journey 1: Successful Admin Registration

```
1. User clicks: "Register here"
   ↓
2. Opens: /admin/register
   ↓
3. Fills form:
   - Name: "Ahmed Hassan"
   - Mobile: "03001234567"
   - Email: "ahmed@example.com"
   - Role: ◉ Admin
   - Password: "MyPassword2024"
   - Confirm: "MyPassword2024"
   ↓
4. Clicks: "Create Account"
   ↓
5. Form validates ✓
   ↓
6. API called: POST /api/user-auth/register
   ↓
7. SUCCESS ✓
   - JWT token: eyJ...
   - Stored in localStorage
   ↓
8. Shows: "Registration successful!"
   ↓
9. Waits: 2 seconds
   ↓
10. Redirects to: /admin/dashboard
    ↓
11. User logged in as Admin
```

### Journey 2: Failed Validation

```
1. User tries to register
   ↓
2. Enters:
   - Name: "A" ← Too short!
   - Mobile: "123" ← Invalid!
   ↓
3. Leaves Password empty
   ↓
4. Clicks: "Create Account"
   ↓
5. Form validation fails
   ↓
6. Shows errors:
   ❌ Name: "Name must be 2+ characters"
   ❌ Mobile: "Invalid Pakistan format"
   ❌ Password: "Password is required"
   ↓
7. Does NOT submit to API
   ↓
8. Form stays on page
   ↓
9. User corrects fields
   ↓
10. Retries and succeeds
```

### Journey 3: Server Error (Duplicate Mobile)

```
1. User fills form correctly
   ✓ Name: "New User"
   ✓ Mobile: "03001111111" ← Already exists!
   ✓ Password: validated
   ↓
2. Clicks: "Create Account"
   ↓
3. Client validation passes ✓
   ↓
4. API called
   ↓
5. Server returns error:
   "Mobile number already registered"
   ↓
6. Shows red error: "Mobile number already registered"
   ↓
7. Form re-enabled
   ↓
8. User changes mobile to new one
   ↓
9. Clicks "Create Account" again
   ↓
10. SUCCESS ✓
```

---

## 📊 Color & State Reference

| State    | Color           | Icon | Interaction   |
| -------- | --------------- | ---- | ------------- |
| Normal   | Gray (#ddd)     | -    | Enabled       |
| Focused  | Blue (#6366f1)  | -    | Editable      |
| Error    | Red (#ef4444)   | ❌   | Show message  |
| Success  | Green (#dcfce7) | ✓    | Notification  |
| Disabled | Gray (#f5f5f5)  | -    | Not clickable |
| Loading  | Gray (#cbd5e1)  | ↻    | Spinner       |

---

## 🎬 Animation States

### Button Loading Animation

```
Step 1: [CREATE ACCOUNT]
        ↓
Step 2: [↻      CREATING ACCOUNT...]
        ↓
        Spinner rotates continuously
        Text updates to "Creating..."
        ↓
Step 3: [✓ Registration successful!] (optional)
        ↓
Step 4: Page redirects
```

### Success Toast Notification

```
Appears at: Top-right corner
Duration: 1-2 seconds (then auto-redirect)
Style: Green background, white text
Icon: ✓ Checkmark
Text: "Registration successful! Redirecting..."
```

---

## 🎯 Responsive Breakpoints

```
MOBILE (< 480px)
┌───────────┐
│ Register  │
│ [Field 1] │
│ [Field 2] │
│ [Button]  │
└───────────┘

TABLET (480px - 1024px)
┌─────────────────────────┐
│     Registration Page   │
│ [Field 1] [Field 2]    │
│ [Field 3] [Button]     │
└─────────────────────────┘

DESKTOP (> 1024px)
┌────────────────────────────────┐
│      Registration Card         │
│ [All fields in one column]    │
│    Max width: 600px            │
│    Centered on page            │
└────────────────────────────────┘
```

---

## 📋 Complete Form Submission Flow

```
USER INPUT
    ↓
REAL-TIME VALIDATION (as typing)
    ├─ Valid → No error shown
    └─ Invalid → Error appears
    ↓
SUBMIT BUTTON CLICK
    ↓
CLIENT-SIDE VALIDATION
    ├─ Any error → Don't submit, show all errors
    ├─ All valid → Continue
    ↓
DISABLE FORM & SHOW LOADING
    ├─ Inputs disabled
    ├─ Button shows spinner
    ├─ Show "Creating Account..."
    ↓
API CALL: POST /api/user-auth/register
    ├─ Timeout/network error → Show error
    ├─ Invalid response → Show generic error
    ├─ Server error (400/500) → Show API error message
    │   ├─ "Mobile number already registered"
    │   ├─ "Invalid request"
    │   └─ Re-enable form for retry
    ├─ Success (200) → Continue
    ↓
ON SUCCESS
    ├─ Show green notification
    ├─ Store JWT token
    ├─ Auto-login user
    ├─ Wait 2 seconds
    ├─ Redirect to dashboard
    └─ Page navigation complete

ON ERROR
    ├─ Show red error message
    ├─ Re-enable form
    ├─ Keep user on page
    └─ User can correct and retry
```

---

**Version:** 1.0  
**Last Updated:** April 16, 2026
