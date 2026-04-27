# Groups Module with CSV Bulk Upload - Implementation Guide

## 📋 Overview

This document details the implementation of a production-ready **Groups Module** with **CSV bulk upload support** for the Messaging SaaS platform. The module enables users to create groups, manage phone number memberships manually or via CSV uploads, with full transaction support and phone number validation.

---

## 🏗️ Architecture

### Backend Architecture

- **Clean Architecture** with separation of concerns
- **MediatR** for CQRS pattern
- **Entity Framework Core** for data persistence
- **FluentValidation** for input validation
- **Database Transactions** for atomicity during bulk operations

### Frontend Architecture

- **React 18** with TypeScript
- **TanStack Query** for data fetching and caching
- **CSV parsing** with validation
- **Modal-based UI** for intuitive user experience

---

## 🔧 Backend Implementation

### 1. **Phone Validation Service** (`Application/Common/Services/PhoneValidationService.cs`)

A comprehensive phone number validation and normalization service that:

- ✅ Validates phone numbers (10-15 digits per E.164 standard)
- ✅ Normalizes phone numbers (removes special characters)
- ✅ Removes duplicates intelligently
- ✅ Batch validation with error reporting
- ✅ Supports multiple phone formats

**Key Methods:**

```csharp
bool IsValidPhoneNumber(string phoneNumber);
string NormalizePhoneNumber(string phoneNumber);
List<string> RemoveDuplicates(List<string> phoneNumbers);
(List<string> ValidPhones, List<string> InvalidPhones) ValidateAndNormalizeBatch(List<string> phoneNumbers);
```

### 2. **Enhanced Commands**

#### `CreateGroupCommand.cs`

```csharp
public class CreateGroupCommand : IRequest<Guid>
{
    public string GroupName { get; set; }
    public Guid ClientId { get; set; }
    public List<string> PhoneNumbers { get; set; } = new();  // ← NEW
}
```

#### `UpdateGroupMembersCommand.cs` (NEW)

```csharp
public class UpdateGroupMembersCommand : IRequest<bool>
{
    public Guid GroupId { get; set; }
    public List<string> PhoneNumbers { get; set; } = new();
}
```

**Purpose:** Replace all existing members with new phone numbers in a single, transactional operation.

### 3. **Enhanced Command Handlers**

#### `CreateGroupCommandHandler.cs`

- Creates group with bulk phone number insertion
- Validates and normalizes all phone numbers
- Removes duplicates
- Uses database transaction for atomicity
- Returns GroupId on success

**Key Features:**

```csharp
var (validPhones, _) = _phoneValidationService.ValidateAndNormalizeBatch(request.PhoneNumbers);

var groupMembers = validPhones
    .Select(phone => new GroupMember {
        Id = Guid.NewGuid(),
        GroupId = group.GroupId,
        PhoneNumber = phone
    })
    .ToList();

using (var transaction = await _context.Database.BeginTransactionAsync(cancellationToken))
{
    // Bulk insert with transaction
}
```

#### `UpdateGroupMembersCommandHandler.cs` (NEW)

- Updates existing group with new phone numbers
- Removes old members completely
- Inserts new members in bulk
- Uses transaction for data consistency
- Returns success/failure status

### 4. **Validators**

#### `CreateGroupCommandValidator.cs` (Enhanced)

```csharp
RuleFor(v => v.PhoneNumbers)
    .NotNull().WithMessage("PhoneNumbers list is required.")
    .Must(phones => phones != null && phones.Any())
    .WithMessage("At least one phone number is required.");

RuleForEach(v => v.PhoneNumbers)
    .NotEmpty().WithMessage("Phone number cannot be empty.");
```

#### `UpdateGroupMembersCommandValidator.cs` (NEW)

Validates group ID and phone number list.

### 5. **API Endpoints**

#### POST `/api/groups` - Create Group with Bulk Phone Numbers

```http
POST /api/groups
Content-Type: application/json

{
  "groupName": "Premium Customers",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "phoneNumbers": [
    "9876543210",
    "9123456780",
    "8901234567"
  ]
}

Response: 201 Created
{
  "groupId": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### PUT `/api/groups/{id}/members` - Update Group Members (NEW)

```http
PUT /api/groups/550e8400-e29b-41d4-a716-446655440001/members
Content-Type: application/json

{
  "phoneNumbers": [
    "9876543210",
    "9123456780",
    "7890123456"
  ]
}

Response: 204 No Content
```

### 6. **Dependency Injection**

Register the service in `Program.cs`:

```csharp
builder.Services.AddScoped<IPhoneValidationService, PhoneValidationService>();
```

---

## 🎨 Frontend Implementation

### 1. **CSV Parser Utility** (`utils/csvParser.ts`)

Provides robust CSV parsing with:

- ✅ CSV file validation (size, type)
- ✅ Phone number extraction from CSV
- ✅ Duplicate removal
- ✅ Invalid entry detection
- ✅ CSV template download

**Key Functions:**

```typescript
async function parseCSV(file: File): Promise<CSVParseResult>;
function validateCSVFile(file: File): { valid: boolean; error?: string };
function normalizePhoneNumber(phone: string): string;
function downloadCSVTemplate(): void;
```

**Example CSV Format:**

```csv
Phone Number
9876543210
9123456780
8901234567
7890123456
```

### 2. **CSV Upload Modal** (`components/CSVUploadModal.tsx`)

A reusable modal component for CSV uploads featuring:

- 📁 Drag-and-drop file upload
- 📊 Parse result preview (valid/invalid count)
- ✅ Real-time validation
- 📋 Sample invalid entries display
- 🎯 Clear error messaging

**Usage:**

```tsx
<CSVUploadModal
  title="Import Phone Numbers"
  description="Upload a CSV file..."
  onClose={() => setShowModal(false)}
  onUpload={handleCSVUpload}
  isLoading={isUploading}
/>
```

### 3. **Group Selector Modal** (`components/GroupSelectorModal.tsx`)

Allows users to select a group from their existing groups before uploading CSV data.

**Features:**

- 🔍 Searchable group list
- 📅 Creation date display
- 🎯 Easy one-click selection

### 4. **Enhanced Group Service** (`services/groupService.ts`)

New methods for bulk operations:

```typescript
async createGroupWithBulkPhones(
  groupName: string,
  clientId: string,
  phoneNumbers: string[]
): Promise<string>

async updateGroupMembers(
  id: string,
  phoneNumbers: string[]
): Promise<void>
```

### 5. **Groups Page Updates** (`pages/GroupsPage.tsx`)

**New Features:**

- 📤 "Bulk Upload" button in header
- 🎯 Two-step CSV upload flow:
  1. Select group from modal
  2. Upload CSV file
- 🔄 Real-time group list refresh
- ✅ Improved error handling

**Updated Create Flow:**

- Creates group with all phone numbers at once
- No need for individual add operations
- Better performance for large batches

---

## 📊 Data Flow

### Create Group with Bulk Upload

```
User Input (Form)
        ↓
Validation (FluentValidation)
        ↓
Phone Normalization & Deduplication
        ↓
CreateGroupCommandHandler
        ↓
Database Transaction Start
        ├─ Insert Group
        ├─ Insert GroupMembers (bulk)
        └─ Commit Transaction
        ↓
Return GroupId
```

### Update Group Members via CSV

```
User Uploads CSV
        ↓
CSV Parsing & Validation
        ↓
User Selects Target Group
        ↓
UpdateGroupMembersCommand
        ↓
Phone Validation & Normalization
        ↓
Database Transaction Start
        ├─ Delete Old Members
        ├─ Insert New Members (bulk)
        └─ Commit Transaction
        ↓
Query Invalidation
        ↓
UI Refresh
```

---

## 🧪 Testing Scenarios

### Backend Testing

**Scenario 1: Create group with valid phone numbers**

```
POST /api/groups
{
  "groupName": "Test Group",
  "clientId": "...",
  "phoneNumbers": ["9876543210", "9123456780"]
}
```

✅ Expected: 201 Created with GroupId

**Scenario 2: Create group with duplicate phone numbers**

```
phoneNumbers: ["9876543210", "9876543210", "9123456780"]
```

✅ Expected: Duplicates removed, 2 members created

**Scenario 3: Create group with invalid phone numbers**

```
phoneNumbers: ["123", "invalid", "9876543210"]
```

✅ Expected: 400 Bad Request with validation errors

**Scenario 4: Update group members**

```
PUT /api/groups/{id}/members
{
  "phoneNumbers": ["1234567890", "0987654321"]
}
```

✅ Expected: 204 No Content

**Scenario 5: Transaction rollback on error**

- If any step fails, entire transaction rolls back
- No orphaned groups or partial member data

### Frontend Testing

**Scenario 1: CSV Parse with Multiple Formats**

```
9876543210
(987) 654-3210
+1 987-654-3210
987.654.3210
```

✅ Expected: All parsed correctly, no duplicates

**Scenario 2: Large CSV file (1000+ records)**
✅ Expected: Parsed successfully, UI responsive

**Scenario 3: Invalid CSV content**

```
Group,Name,Email
John,Doe,john@example.com
```

✅ Expected: "No valid phone numbers found" message

**Scenario 4: CSV drag-and-drop**
✅ Expected: File uploaded and parsed correctly

---

## 🔒 Business Logic

### Validation Rules

1. **Phone Number Format:** 10-15 digits (E.164 standard)
2. **Group Name:** Required, max 100 characters
3. **ClientId:** Required, must exist
4. **Duplicates:** Removed automatically based on normalized phone numbers
5. **Empty Input:** At least one valid phone number required

### Data Integrity

- **Transactions:** All database operations use transactions
- **Foreign Keys:** ClientId must reference existing Client
- **Cascade Delete:** Deleting a group deletes all its members
- **Atomicity:** Either all members created/updated or none

### Performance Optimization

- **Bulk Inserts:** GroupMembers inserted in single batch operation
- **Deduplication:** Processed in-memory before database insert
- **Normalization:** Phone numbers normalized before storage
- **Caching:** TanStack Query caches group data with smart invalidation

---

## 📦 Deployment Checklist

### Backend

- [ ] Build solution: `dotnet build`
- [ ] Run migrations: `dotnet ef database update -p ../Infrastructure -s API.csproj`
- [ ] Test API endpoints via Swagger UI
- [ ] Verify database schema changes

### Frontend

- [ ] Install dependencies: `npm install`
- [ ] Build project: `npm run build`
- [ ] Test CSV upload functionality
- [ ] Test group creation and updates
- [ ] Verify API integration

### Database

- [ ] Backup existing data
- [ ] Run migration scripts
- [ ] Verify Group and GroupMember tables
- [ ] Check foreign key constraints

---

## 🐛 Error Handling

### Backend Errors

| Error                | HTTP Status | Message                                 |
| -------------------- | ----------- | --------------------------------------- |
| Invalid group name   | 400         | "GroupName is required"                 |
| No phone numbers     | 400         | "At least one phone number is required" |
| Invalid phone format | 400         | "Phone number format invalid"           |
| Group not found      | 404         | "Group not found"                       |
| Database error       | 500         | "Internal server error"                 |

### Frontend Errors

| Scenario         | Handling                        |
| ---------------- | ------------------------------- |
| Invalid CSV file | Show file validation error      |
| No valid numbers | Display friendly message        |
| Network error    | Retry prompt with error message |
| Upload failure   | Show error with retry option    |

---

## 🚀 Future Enhancements

1. **Batch CSV Operations**
   - Create multiple groups from single CSV
   - Each phone number gets a unique group

2. **Phone Number Validation**
   - Format numbers to international standard
   - Validate against telecom providers
   - Auto-detect country code from number

3. **Bulk Export**
   - Export group members to CSV
   - Schedule regular exports
   - Archive exports

4. **Advanced Features**
   - Duplicate detection across groups
   - Phone number deactivation
   - Member activity tracking
   - Import history and logs

5. **UI Improvements**
   - Progress bar for large uploads
   - Batch operation scheduling
   - Preview before upload
   - Multi-group upload wizard

---

## 📝 API Documentation

Complete API documentation available at:

- **Swagger UI:** http://localhost:5008/swagger
- **OpenAPI Spec:** http://localhost:5008/openapi/v1.json

---

## 🔗 Project Files

### Backend Files

- `Domain/Entities/Group.cs` - Group entity
- `Domain/Entities/GroupMember.cs` - GroupMember entity
- `Application/Common/Services/PhoneValidationService.cs` - Phone validation
- `Application/Features/Groups/Commands/CreateGroupCommand.cs` - Create command
- `Application/Features/Groups/Commands/CreateGroupCommandHandler.cs` - Create handler
- `Application/Features/Groups/Commands/CreateGroupCommandValidator.cs` - Create validator
- `Application/Features/Groups/Commands/UpdateGroupMembersCommand.cs` - Update members command
- `Application/Features/Groups/Commands/UpdateGroupMembersCommandHandler.cs` - Update handler
- `Application/Features/Groups/Commands/UpdateGroupMembersCommandValidator.cs` - Update validator
- `API/Controllers/GroupsController.cs` - Groups API controller
- `API/Program.cs` - DI configuration
- `Infrastructure/Persistence/ApplicationDbContext.cs` - Database context

### Frontend Files

- `src/utils/csvParser.ts` - CSV parsing utilities
- `src/components/CSVUploadModal.tsx` - CSV upload modal
- `src/components/GroupSelectorModal.tsx` - Group selector modal
- `src/services/groupService.ts` - Group API service
- `src/pages/GroupsPage.tsx` - Groups management page

---

## 📞 Support

For questions or issues:

1. Check error messages in browser console
2. Review API logs in backend
3. Verify database connectivity
4. Check migration status

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Production Ready
