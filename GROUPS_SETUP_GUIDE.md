# Groups Module - Setup & Deployment Guide

## 🎯 Quick Start

This guide walks you through setting up the new Groups module with CSV bulk upload support.

---

## ⚙️ Prerequisites

✅ Completed Database Migrations  
✅ Dependencies Installed  
✅ API Server Running  
✅ Frontend Dev Server Running

---

## 🏃 Step-by-Step Setup

### **Step 1: Backend Setup**

#### 1.1 Verify Dependencies

The project uses the following NuGet packages (already configured):

- ✅ `MediatR` - CQRS pattern
- ✅ `FluentValidation` - Input validation
- ✅ `AutoMapper` - Object mapping
- ✅ `EntityFrameworkCore` - ORM

#### 1.2 Build the Solution

```powershell
cd src
dotnet build
```

#### 1.3 Run Database Migrations

```powershell
cd API
dotnet ef database update -p ../Infrastructure/Infrastructure.csproj -s API.csproj
```

**What this does:**

- Creates/updates `Groups` and `GroupMembers` tables
- Sets up foreign key relationships
- Indexes for performance

#### 1.4 Start the API Server

```powershell
cd API
dotnet run
```

**Expected Output:**

```
info: Microsoft.Hosting.Lifetime[0]
    Now listening on: http://localhost:5008
```

#### 1.5 Test API with Swagger

Open browser: **http://localhost:5008/swagger**

Looking for these endpoints:

- ✅ `POST /api/groups` - Create group with phone numbers
- ✅ `PUT /api/groups/{id}/members` - Update group members
- ✅ Existing CRUD endpoints

---

### **Step 2: Frontend Setup**

#### 2.1 Install Dependencies

```powershell
cd MessagingPlatefromUI
npm install
```

#### 2.2 Start Development Server

```powershell
npm run dev
```

**Expected Output:**

```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### 2.3 Verify Integration

- Navigate to Groups page
- See new "Bulk Upload" button
- Test group creation with phone numbers

---

## 🧪 Testing the Features

### **Test 1: Create Group via Form**

1. Go to **Groups Management** page
2. Fill in group name: `"Test Team"`
3. Add phone numbers:
   - `9876543210`
   - `(987) 654-3210`
   - `+1-234-567-8900`
4. Click **"Create Group"**

**Expected Result:**
✅ Group created with 3 members  
✅ Duplicates automatically removed  
✅ Different formats accepted

---

### **Test 2: Bulk Upload via CSV**

#### 2.1 Download Template

1. Click **"Download CSV template"** in upload modal
2. File saved: `phone-numbers-template.csv`

#### 2.2 Prepare CSV

Edit the template with test numbers:

```csv
Phone Number
9876543210
9123456780
8901234567
7890123456
(555) 123-4567
+1-555-123-4568
```

#### 2.3 Upload CSV

1. Click **"Bulk Upload"** button
2. In modal, click **"Select Group to Update"**
3. Choose a group
4. Drag CSV file or click to select
5. Click **"Import Numbers"**

**Expected Result:**
✅ CSV parsed successfully  
✅ Valid numbers: 6  
✅ Group members updated  
✅ List refreshed automatically

---

### **Test 3: Error Handling**

#### Test 3a: Invalid CSV

Create file `invalid.csv`:

```csv
Name,Email
John,john@example.com
Jane,jane@example.com
```

**Expected Result:**
❌ Error message: "No valid phone numbers found in the CSV file"

#### Test 3b: Corrupted File

Upload a `.pdf` or `.docx` file

**Expected Result:**
❌ Validation error: "Please upload a CSV file"

#### Test 3c: Large File

Create CSV with 10,000+ records

**Expected Result:**
✅ File processed  
✅ Duplicates removed  
✅ Valid count displayed

---

### **Test 4: Data Integrity**

#### 4.1 Check Database

```sql
-- Verify groups created
SELECT COUNT(*) FROM Groups;

-- Verify group members
SELECT GroupId, COUNT(*) as MemberCount
FROM GroupMembers
GROUP BY GroupId;

-- Check for duplicates (should be 0)
SELECT PhoneNumber, COUNT(*) as Count
FROM GroupMembers
WHERE Count > 1
GROUP BY PhoneNumber;

-- Verify no orphaned members
SELECT gm.*
FROM GroupMembers gm
LEFT JOIN Groups g ON gm.GroupId = g.GroupId
WHERE g.GroupId IS NULL;
```

**Expected Result:**
✅ All groups present  
✅ No duplicates  
✅ No orphaned data  
✅ Correct member counts

---

## 🔍 Troubleshooting

### **Issue: "PhoneValidationService not found"**

<details>
<summary>Solution</summary>

Ensure DI registration in `Program.cs`:

```csharp
builder.Services.AddScoped<IPhoneValidationService, PhoneValidationService>();
```

Then rebuild and restart:

```powershell
dotnet build
dotnet run
```

</details>

### **Issue: "CSV Upload button not showing"**

<details>
<summary>Solution</summary>

1. Verify `CSVUploadModal.tsx` exists in components folder
2. Check imports in `GroupsPage.tsx`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Restart dev server: `npm run dev`
</details>

### **Issue: "Phone numbers not validating"**

<details>
<summary>Solution</summary>

Verify phone number format:

- Minimum 10 digits
- Maximum 15 digits
- Numbers only after normalization

Valid formats:

```
9876543210         ✅
(987) 654-3210     ✅
+1-987-654-3210    ✅
987.654.3210       ✅
123                ❌ (too short)
9876-543210ABC     ❌ (has letters)
```

</details>

### **Issue: "Database migration failed"**

<details>
<summary>Solution</summary>

Check migration status:

```powershell
dotnet ef migrations list -p ../Infrastructure -s API.csproj
```

If needed, revert to initial state:

```powershell
# Remove migrations
Remove-Migration -StartupProject API.csproj

# Re-add migrations
Add-Migration InitialCreate

# Update database
Update-Database
```

</details>

### **Issue: "API returning 500 error"**

<details>
<summary>Solution</summary>

1. Check logs in console
2. Verify database connection
3. Check SQL Server is running
4. Try test query in Swagger UI

Example test:

```json
{
  "groupName": "Test",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "phoneNumbers": ["9876543210"]
}
```

</details>

---

## 📊 Performance Optimization

### Database Indexes

The GroupMember table benefits from these indexes:

```sql
CREATE INDEX idx_groupmember_groupid ON GroupMembers(GroupId);
CREATE INDEX idx_groupmember_phonenumber ON GroupMembers(PhoneNumber);
```

### Batch Size Recommendations

- **Small batches:** < 100 phone numbers
- **Medium batches:** 100-1,000 numbers
- **Large batches:** 1,000-10,000 numbers
- **Very large:** > 10,000 (consider pagination)

### Frontend Optimization

- CSV files are parsed in-memory
- Deduplication happens client-side
- Bulk operations sent in single request
- Query caching prevents unnecessary re-fetches

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passed
- [ ] No console errors
- [ ] Database verified
- [ ] Migrations applied
- [ ] API endpoints tested

### Backend Deployment

- [ ] Build release: `dotnet build -c Release`
- [ ] Publish: `dotnet publish -c Release -o ./publish`
- [ ] Copy to server
- [ ] Run migrations on production DB
- [ ] Restart API service

### Frontend Deployment

- [ ] Build: `npm run build`
- [ ] Check output in `dist/` folder
- [ ] Deploy to hosting (Vercel, Azure, etc.)
- [ ] Update API endpoint config
- [ ] Test in production

### Post-Deployment

- [ ] Monitor error logs
- [ ] Test CSV upload in production
- [ ] Verify database changes
- [ ] Check API response times
- [ ] Monitor user feedback

---

## 📈 Monitoring

### Key Metrics to Monitor

1. **CSV Upload Success Rate** - Target: > 99%
2. **Average Upload Time** - Target: < 2 seconds
3. **Database Query Performance** - Target: < 100ms
4. **Memory Usage** - Monitor for leaks
5. **API Response Time** - Target: < 200ms

### Logs to Check

- API Application logs
- Database query logs
- Browser console (F12)
- Network requests (DevTools Network tab)

---

## 📚 Additional Resources

📖 **Backend Documentation**  
See: `GROUPS_MODULE_DOCUMENTATION.md`

📖 **Clean Architecture Pattern**  
Search: "Clean Architecture C#"

📖 **CQRS Pattern**  
Search: "CQRS MediatR"

📖 **Entity Framework Core**  
Docs: https://learn.microsoft.com/en-us/ef/core/

---

## ✅ Verification Checklist

After following all steps, verify:

- [ ] API server running on port 5008
- [ ] Swagger UI accessible
- [ ] Frontend running on port 5173
- [ ] Groups page loads without errors
- [ ] Can create group with phone numbers
- [ ] CSV upload button visible
- [ ] Can upload CSV file
- [ ] Groups refresh automatically
- [ ] Database reflects changes
- [ ] No console errors

---

## 🎉 You're Done!

The Groups module is now fully configured and ready for use.

**Next Steps:**

1. Train users on CSV upload feature
2. Set up monitoring alerts
3. Establish backup procedures
4. Plan for future enhancements

---

**Need Help?**

- Check error messages carefully
- Review logs in both frontend and backend
- Test each component independently
- Refer to troubleshooting section above

**Happy Coding! 🚀**
