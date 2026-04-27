# Groups API Examples - HTTP Requests

This file contains HTTP request examples for all Groups API endpoints with detailed explanations.

---

## 📌 Base URL

```
http://localhost:5008/api
```

---

## 1️⃣ Create Group with Bulk Phone Numbers

### Request

```http
POST /api/groups
Content-Type: application/json

{
  "groupName": "Premium Customers",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "phoneNumbers": [
    "9876543210",
    "9123456780",
    "8901234567",
    "(555) 123-4567",
    "+1-555-789-0123"
  ]
}
```

### Response - Success (201 Created)

```http
HTTP/1.1 201 Created
Location: /api/groups

550e8400-e29b-41d4-a716-446655440001
```

### Response - Validation Error (400 Bad Request)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "errors": {
    "GroupName": [
      "GroupName is required."
    ],
    "PhoneNumbers": [
      "At least one phone number is required."
    ]
  }
}
```

### Notes

- ✅ Phone numbers are automatically normalized
- ✅ Duplicates are automatically removed
- ✅ All phone numbers must have 10-15 digits
- ✅ Special characters are removed before validation
- ✅ Operation is atomic (all-or-nothing)

**Common Phone Formats Accepted:**

```
9876543210              ← Plain digits
(987) 654-3210          ← With parentheses and hyphens
+1-987-654-3210         ← With country code
987.654.3210            ← With dots
+18776543210            ← With country code, no separators
1-987-654-3210          ← Country code without +
```

---

## 2️⃣ Get All Groups

### Request

```http
GET /api/groups
Content-Type: application/json
```

### Response - Success (200 OK)

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "groupId": "550e8400-e29b-41d4-a716-446655440001",
    "groupName": "Premium Customers",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-15T10:30:00Z"
  },
  {
    "groupId": "550e8400-e29b-41d4-a716-446655440002",
    "groupName": "Free Trial Users",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-15T11:45:00Z"
  }
]
```

---

## 3️⃣ Update Group Details (Name Only)

### Request

```http
PUT /api/groups/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "groupName": "VIP Customers"
}
```

### Response - Success (204 No Content)

```http
HTTP/1.1 204 No Content
```

### Response - Not Found (404 Not Found)

```http
HTTP/1.1 404 Not Found
```

### Notes

- ✅ This endpoint only updates the group name
- ✅ Doesn't touch group members
- ⚠️ Use the members endpoint to update phone numbers

---

## 4️⃣ Update Group Members (Replace All Phone Numbers)

### Request

```http
PUT /api/groups/550e8400-e29b-41d4-a716-446655440001/members
Content-Type: application/json

{
  "phoneNumbers": [
    "1234567890",
    "0987654321",
    "5555551234"
  ]
}
```

### Response - Success (204 No Content)

```http
HTTP/1.1 204 No Content
```

### Response - Not Found (404 Not Found)

```http
HTTP/1.1 404 Not Found
```

### Response - Validation Error (400 Bad Request)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "errors": {
    "PhoneNumbers": [
      "At least one phone number is required."
    ]
  }
}
```

### Important Notes

- ⚠️ **This REPLACES all existing members**
- ✅ Old members are deleted
- ✅ New members are inserted
- ✅ Operation is atomic
- ✅ Duplicates are automatically removed
- ✅ Phone numbers are validated and normalized

**Example Scenario:**

```
Before:
- Member 1: 9876543210
- Member 2: 9123456780
- Member 3: 8901234567

Request: ["1234567890", "0987654321", "5555551234"]

After:
- Member 1: 1234567890
- Member 2: 0987654321
- Member 3: 5555551234
```

---

## 5️⃣ Get Group Members

### Request

```http
GET /api/groups/550e8400-e29b-41d4-a716-446655440001/members
Content-Type: application/json
```

### Response - Success (200 OK)

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "groupId": "550e8400-e29b-41d4-a716-446655440001",
    "phoneNumber": "9876543210"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "groupId": "550e8400-e29b-41d4-a716-446655440001",
    "phoneNumber": "9123456780"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440102",
    "groupId": "550e8400-e29b-41d4-a716-446655440001",
    "phoneNumber": "8901234567"
  }
]
```

### Response - Group Not Found (404 Not Found)

```http
HTTP/1.1 404 Not Found
```

---

## 6️⃣ Delete Group

### Request

```http
DELETE /api/groups/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json
```

### Response - Success (204 No Content)

```http
HTTP/1.1 204 No Content
```

### Response - Not Found (404 Not Found)

```http
HTTP/1.1 404 Not Found
```

### Notes

- ⚠️ **This is permanent**
- ✅ All group members are also deleted (cascade)
- ✅ Group history is lost
- ❌ This cannot be undone

---

## 7️⃣ Batch Examples

### Create Multiple Groups at Once

```powershell
# PowerShell script
$clientId = "550e8400-e29b-41d4-a716-446655440000"
$groups = @(
  @{groupName = "Sales Team"; phoneNumbers = @("9876543210", "9123456780")},
  @{groupName = "Support Team"; phoneNumbers = @("8901234567", "7890123456")},
  @{groupName = "Marketing"; phoneNumbers = @("5555551234", "5555555678")}
)

foreach ($group in $groups) {
  $body = @{
    groupName = $group.groupName
    clientId = $clientId
    phoneNumbers = $group.phoneNumbers
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:5008/api/groups" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
}
```

### Update Multiple Groups' Members

```powershell
$groupIds = @(
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002"
)

$phones = @("1234567890", "0987654321")

foreach ($groupId in $groupIds) {
  $body = @{
    phoneNumbers = $phones
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:5008/api/groups/$groupId/members" `
    -Method Put `
    -Body $body `
    -ContentType "application/json"
}
```

---

## 🧪 Testing with cURL

### Create Group

```bash
curl -X POST http://localhost:5008/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Test Group",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumbers": ["9876543210", "9123456780"]
  }'
```

### Get Groups

```bash
curl -X GET http://localhost:5008/api/groups \
  -H "Content-Type: application/json"
```

### Update Members

```bash
curl -X PUT http://localhost:5008/api/groups/550e8400-e29b-41d4-a716-446655440001/members \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": ["1234567890", "0987654321"]
  }'
```

### Get Members

```bash
curl -X GET http://localhost:5008/api/groups/550e8400-e29b-41d4-a716-446655440001/members \
  -H "Content-Type: application/json"
```

### Delete Group

```bash
curl -X DELETE http://localhost:5008/api/groups/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json"
```

---

## 📊 Response Status Codes

| Code | Meaning                            | Example                    |
| ---- | ---------------------------------- | -------------------------- |
| 200  | OK - Request succeeded             | GET groups                 |
| 201  | Created - Resource created         | POST group                 |
| 204  | No Content - Operation succeeded   | PUT/DELETE                 |
| 400  | Bad Request - Validation failed    | Invalid phone format       |
| 404  | Not Found - Resource doesn't exist | GET invalid group ID       |
| 500  | Server Error - Unexpected error    | Database connection failed |

---

## ⚠️ Error Response Examples

### Validation Error

```json
{
  "errors": {
    "GroupName": ["GroupName is required."],
    "PhoneNumbers": ["At least one phone number is required."]
  }
}
```

### Invalid Phone Numbers

```json
{
  "errors": {
    "PhoneNumbers": [
      "Phone number '123' is invalid. Minimum 10 digits required."
    ]
  }
}
```

### Group Not Found

```json
{
  "message": "Group with ID '550e8400-invalid' not found."
}
```

---

## 🔐 Security Notes

1. **Authentication Required** - Add Bearer token for production
2. **Rate Limiting** - Consider implementing for bulk operations
3. **Input Validation** - All inputs are validated server-side
4. **SQL Injection Protection** - Using parameterized queries
5. **CORS Enabled** - Configured for frontend access

---

## ✨ Pro Tips

### Tip 1: Large Batch Operations

For uploading 10,000+ phone numbers:

- Split into chunks of 1,000
- Upload in parallel (3-5 concurrent requests)
- Wait for all to complete

### Tip 2: Duplicate Handling

Frontend deduplicates, but backend also validates:

```
Input: ["1234567890", "1234567890", "0987654321"]
Stored: ["1234567890", "0987654321"]  ← Automatic deduplication
```

### Tip 3: Phone Format Flexibility

Users can enter phone numbers in ANY common format:

```
✅ 9876543210
✅ (987) 654-3210
✅ 987-654-3210
✅ +1-987-654-3210
All normalized to: 9876543210
```

### Tip 4: Monitoring Bulk Operations

```csharp
var startTime = DateTime.UtcNow;
var result = await groupService.CreateGroupAsync(command);
var duration = DateTime.UtcNow - startTime;
logger.LogInformation($"Bulk operation completed in {duration.TotalMilliseconds}ms");
```

---

## 📝 Notes

- All timestamps are in UTC (ISO 8601 format)
- GUIDs are in standard format (UUID v4)
- Phone numbers are stored normalized (digits only)
- Timezone information comes from client

**Last Updated:** April 2026  
**API Version:** 1.0.0
