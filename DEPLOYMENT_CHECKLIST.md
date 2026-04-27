# Groups Module - Deployment & Verification Checklist

## 📋 Pre-Deployment Verification

### Code Quality

- [ ] All code compiles without warnings
- [ ] No console errors in browser
- [ ] No API validation errors
- [ ] All linting rules pass
- [ ] TypeScript types are correct
- [ ] No commented-out code

### Testing

- [ ] Unit tests pass (if applicable)
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] CSV parsing tested
- [ ] Phone validation tested
- [ ] Error handling tested
- [ ] Database transactions verified

### Documentation

- [ ] README.md updated
- [ ] Technical documentation complete
- [ ] API examples provided
- [ ] Setup guide created
- [ ] Troubleshooting section included
- [ ] Comments in code where needed

---

## 🔧 Backend Deployment Checklist

### Preparation

- [ ] Environment variables configured
- [ ] Database connection string set
- [ ] SQL Server accessible
- [ ] LocalDB running (if using)
- [ ] File permissions verified
- [ ] Required ports open (5008 for API)

### Build & Release

- [ ] Solution builds successfully
  ```powershell
  cd src
  dotnet build -c Release
  ```
- [ ] No build warnings
- [ ] All NuGet packages restored
- [ ] Project files valid

### Database Migration

- [ ] Backup existing database
  ```sql
  -- Backup to file
  BACKUP DATABASE MessagePlatformDb
  TO DISK='C:\Backups\MessagePlatformDb_2026-04-15.bak'
  ```
- [ ] Migration script ready
  ```powershell
  cd API
  dotnet ef database update -p ../Infrastructure/Infrastructure.csproj -s API.csproj
  ```
- [ ] Verify migration succeeds
- [ ] Check Groups table created
- [ ] Check GroupMembers table created
- [ ] Verify foreign keys
- [ ] Verify indexes

### API Deployment

- [ ] Publish API
  ```powershell
  dotnet publish -c Release -o ./publish
  ```
- [ ] Copy to deployment directory
- [ ] Verify file permissions
- [ ] Test API startup
- [ ] Check port availability
  ```powershell
  netstat -ano | findstr :5008
  ```
- [ ] Swagger UI accessible
- [ ] Health check passes

### API Testing

- [ ] [✓] GET /api/groups works
- [ ] [✓] POST /api/groups accepts bulk data
- [ ] [✓] PUT /api/groups/{id}/members works
- [ ] [✓] Phone validation functioning
- [ ] [✓] Database persists data
- [ ] [✓] Transactions rollback on error

### API Verification

```powershell
# Test basic endpoint
curl http://localhost:5008/api/groups

# Test with sample data
curl -X POST http://localhost:5008/api/groups `
  -H "Content-Type: application/json" `
  -d @- <<'EOF'
{
  "groupName": "Test Group",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "phoneNumbers": ["9876543210", "9123456780"]
}
EOF
```

---

## 🎨 Frontend Deployment Checklist

### Preparation

- [ ] Node.js installed (v16+)
- [ ] npm up to date
- [ ] Dependencies cached
- [ ] Build directory clean
- [ ] Environment variables set
- [ ] API endpoint configured

### Build

- [ ] Dependencies install successfully
  ```bash
  npm install
  ```
- [ ] No installation warnings
- [ ] Build completes
  ```bash
  npm run build
  ```
- [ ] Build artifacts in `dist/` folder
- [ ] No build errors or warnings
- [ ] Output size reasonable

### Bundle Analysis

- [ ] Check bundle size
  ```bash
  npm run build -- --analyze
  ```
- [ ] Size < 500KB (gzipped)
- [ ] No unnecessary dependencies
- [ ] Tree-shaking working

### Frontend Testing

- [ ] Application starts
  ```bash
  npm run dev
  ```
- [ ] No console errors
- [ ] Groups page loads
- [ ] "Bulk Upload" button visible
- [ ] CSV upload modal opens
- [ ] Group selector modal works
- [ ] Form submission works
- [ ] API integration works

### Frontend Verification

```bash
# Build production
npm run build

# Test (local)
npm run preview

# Check artifacts
ls dist/
```

---

## 🗄️ Database Verification

### Table Verification

```sql
-- Check tables exist
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('Groups', 'GroupMembers');

-- Check columns
EXEC sp_columns Groups;
EXEC sp_columns GroupMembers;

-- Check indexes
SELECT * FROM sys.indexes
WHERE OBJECT_NAME(object_id) IN ('Groups', 'GroupMembers');

-- Check foreign keys
SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME = 'GroupMembers';
```

### Data Verification

```sql
-- Count records
SELECT COUNT(*) FROM Groups;
SELECT COUNT(*) FROM GroupMembers;

-- Check for orphaned records
SELECT gm.* FROM GroupMembers gm
LEFT JOIN Groups g ON gm.GroupId = g.GroupId
WHERE g.GroupId IS NULL;

-- Check for invalid phone numbers
SELECT * FROM GroupMembers
WHERE LEN(PhoneNumber) < 10 OR LEN(PhoneNumber) > 15;

-- Sample data
SELECT TOP 10 * FROM Groups;
SELECT TOP 10 * FROM GroupMembers ORDER BY GroupId;
```

### Index Performance

```sql
-- Check index usage
SELECT OBJECT_NAME(ips.object_id) as TableName,
  i.name as IndexName,
  ips.user_seeks,
  ips.user_scans,
  ips.user_lookups
FROM sys.dm_db_index_usage_stats ips
JOIN sys.indexes i ON ips.object_id = i.object_id
WHERE OBJECT_NAME(ips.object_id) IN ('Groups', 'GroupMembers');
```

---

## 🧪 Integration Testing

### Create Group With Phones

- [ ] Send POST request with 10 phones
- [ ] Verify 201 Created response
- [ ] Check GroupId returned
- [ ] Verify database has new group
- [ ] Verify 10 members created
- [ ] Check no duplicates

### CSV Upload

- [ ] Upload valid CSV file
- [ ] Verify parse succeeds
- [ ] Check valid count displays
- [ ] Verify members update
- [ ] Check database reflects change
- [ ] Verify UI refreshes

### Error Handling

- [ ] Send invalid group name (empty)
  - [ ] Receive 400 error
- [ ] Send no phone numbers
  - [ ] Receive 400 error
- [ ] Send invalid phone format
  - [ ] Receive validation error with details
- [ ] Send non-existent GroupId
  - [ ] Receive 404 error
- [ ] Send malformed CSV
  - [ ] Receive friendly error message
- [ ] Test duplicate detection
  - [ ] Verify only 1 copy stored

### Performance Testing

```powershell
# Test with 100 phone numbers
$phones = @()
for ($i = 0; $i -lt 100; $i++) {
  $phones += "555000$('{0:d4}' -f $i)"
}

$body = @{
  groupName = "Performance Test"
  clientId = "550e8400-e29b-41d4-a716-446655440000"
  phoneNumbers = $phones
} | ConvertTo-Json

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
Invoke-RestMethod -Uri "http://localhost:5008/api/groups" `
  -Method Post -Body $body -ContentType "application/json"
$stopwatch.Stop()

Write-Host "Time taken: $($stopwatch.ElapsedMilliseconds)ms"
# Should be < 1000ms
```

---

## 📊 Performance Checklist

### Backend Performance

- [ ] API response time < 200ms (95th percentile)
- [ ] Database query time < 50ms
- [ ] Memory usage stable
- [ ] CPU usage < 50%
- [ ] No connection pool exhaustion
- [ ] No timeout issues

### Frontend Performance

- [ ] Page load time < 3 seconds
- [ ] CSV parse < 500ms for 1000 entries
- [ ] Upload button responsive
- [ ] Modal opens instantly
- [ ] No UI lag
- [ ] Smooth animations

### Stress Testing

```bash
# Use Apache Bench or similar
ab -n 1000 -c 10 http://localhost:5008/api/groups
```

Expected: 99% requests < 500ms

---

## 🔐 Security Verification

### Input Validation

- [ ] Empty strings rejected
- [ ] XSS attempts prevented
- [ ] SQL injection prevented
- [ ] File upload validation working
- [ ] File size limits enforced
- [ ] File type validation working

### Data Protection

- [ ] Phone numbers stored securely
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] Authentication enforced
- [ ] Authorization working
- [ ] No hardcoded secrets

### Testing Commands

```powershell
# Test empty group name
curl -X POST http://localhost:5008/api/groups `
  -H "Content-Type: application/json" `
  -d '{"groupName":"","clientId":"...","phoneNumbers":["1234567890"]}'

# Should receive: 400 Bad Request

# Test SQL injection
# (Should be sanitized by EF Core)
curl -X POST http://localhost:5008/api/groups `
  -H "Content-Type: application/json" `
  -d '{"groupName":"test'; DROP TABLE Groups;--","clientId":"...","phoneNumbers":["1234567890"]}'

# Should fail gracefully
```

---

## ✅ Final Verification Steps

### Sanity Checks

- [ ] Application starts without errors
- [ ] No prerequisites missing
- [ ] Database migrations completed
- [ ] All endpoints responding
- [ ] UI renders correctly
- [ ] No 500 errors in logs

### User Workflows

- [ ] [ ] User creates group with form
- [ ] [ ] User uploads CSV file
- [ ] [ ] User selects group
- [ ] [ ] User views group members
- [ ] [ ] User edits group name
- [ ] [ ] User deletes group

### Browser Compatibility

- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Edge ✓
- [ ] Safari ✓
- [ ] Mobile browsers ✓

### Responsive Design

- [ ] Desktop (1920x1080) ✓
- [ ] Tablet (768x1024) ✓
- [ ] Mobile (375x667) ✓
- [ ] Ultra-wide (2560x1440) ✓

---

## 📈 Monitoring Setup

### Logging Configuration

- [ ] Application logs enabled
- [ ] Log level set appropriately
- [ ] Logs stored securely
- [ ] Log rotation configured
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled

### Alerts to Configure

```
Alert: API response time > 500ms
Alert: Database query time > 100ms
Alert: Error rate > 0.1%
Alert: CSV upload failure rate > 1%
Alert: Disk space < 10%
```

### Dashboard Metrics

- [ ] CSV upload success rate
- [ ] Average upload time
- [ ] Database performance
- [ ] API response times
- [ ] Error rates
- [ ] User activity

---

## 🚨 Rollback Plan

### If Deployment Fails

1. **Stop affected service**

   ```powershell
   # Stop API
   Stop-Service -Name "MessagePlatformAPI" -Force

   # Or kill process
   Get-Process | Where {$_.Name -eq "API"} | Stop-Process -Force
   ```

2. **Restore from backup**

   ```sql
   -- Restore database
   RESTORE DATABASE MessagePlatformDb
   FROM DISK='C:\Backups\MessagePlatformDb_2026-04-14.bak'
   WITH REPLACE
   ```

3. **Revert frontend**
   - Replace `dist/` with previous version
   - Clear browser cache
   - Restart web server

4. **Verify rollback**
   - [ ] API responding
   - [ ] Database accessible
   - [ ] Previous version working
   - [ ] No errors in logs

5. **Communicate**
   - [ ] Notify team of rollback
   - [ ] Update status page
   - [ ] Document issue
   - [ ] Schedule fix

---

## ✨ Post-Deployment Tasks

### Day 1

- [ ] Monitor error logs hourly
- [ ] Check database size
- [ ] Verify API response times
- [ ] Test all features once more
- [ ] Check user reports

### Week 1

- [ ] Monitor performance daily
- [ ] Review customer feedback
- [ ] Check database backups
- [ ] Update documentation if needed
- [ ] Plan improvements

### Month 1

- [ ] Analyze performance metrics
- [ ] Review error trends
- [ ] Optimize if needed
- [ ] Plan next features
- [ ] Gather user feedback

---

## 📞 Support Contacts

**Backend Issues:**

- API not starting → Check logs, verify .NET SDK
- Database connection → Verify SQL Server running
- Phone validation fails → Check regex pattern

**Frontend Issues:**

- CSV not uploading → Check file size and type
- Page not loading → Check browser console
- API connection error → Verify API endpoint URL

**Emergency:**

- Critical error → Initiate rollback procedure
- Data corruption → Restore from backup
- Security breach → Isolate affected systems

---

## ✅ Sign-Off

| Task              | Completed | Last Updated | Notes |
| ----------------- | --------- | ------------ | ----- |
| Backend Build     | [ ]       |              |       |
| Backend Deploy    | [ ]       |              |       |
| Frontend Build    | [ ]       |              |       |
| Frontend Deploy   | [ ]       |              |       |
| Database Migrate  | [ ]       |              |       |
| Integration Tests | [ ]       |              |       |
| Performance Tests | [ ]       |              |       |
| Security Tests    | [ ]       |              |       |
| UAT Approval      | [ ]       |              |       |
| Production Ready  | [ ]       |              |       |

---

**Deployment Date:** ****\_\_\_****  
**Deployed By:** ****\_\_\_****  
**Verified By:** ****\_\_\_****

---

**Status: READY FOR DEPLOYMENT** ✅

Use this checklist to ensure a smooth and successful deployment of the Groups module.
