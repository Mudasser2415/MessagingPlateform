-- =============================================
-- MESSAGING PLATFORM DATABASE - FULL SETUP SCRIPT
-- Database: MessagingPlatformDB
-- Generated: 2026-05-03
-- =============================================
-- TABLE CREATION ORDER (respects FK dependencies):
--   1. Admins
--   2. Users
--   3. Partners
--   4. Clients
--   5. ClientEmployeeMappings
--   6. CreditTransactions
--   7. Templates
--   8. Groups
--   9. GroupMembers
--  10. Messages
--  11. ScheduledMessages
--  12. AuditLogs
-- =============================================

-- =============================================
-- DATABASE CREATION
-- =============================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MessagingPlatformDB')
BEGIN
    CREATE DATABASE MessagingPlatformDB;
    PRINT 'Database MessagingPlatformDB created.';
END
ELSE
BEGIN
    PRINT 'Database MessagingPlatformDB already exists.';
END
GO

USE MessagingPlatformDB;
GO

-- =============================================
-- 1. ADMINS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Admins' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Admins] (
        [Id]          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Email]       NVARCHAR(256)    NOT NULL,
        [Password]    NVARCHAR(MAX)    NOT NULL,
        [FullName]    NVARCHAR(256)    NOT NULL,
        [Role]        NVARCHAR(50)     NOT NULL DEFAULT 'Admin',    -- Admin | SuperAdmin
        [IsActive]    BIT              NOT NULL DEFAULT 1,
        [CreatedAt]   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] DATETIME2        NULL,

        CONSTRAINT UQ_Admins_Email UNIQUE ([Email]),
        CONSTRAINT CK_Admins_Role  CHECK  ([Role] IN ('Admin', 'SuperAdmin'))
    );

    CREATE INDEX [IX_Admins_Email] ON [dbo].[Admins] ([Email]);

    PRINT '1. Admins table created.';
END
ELSE
    PRINT '1. Admins table already exists.';
GO

-- =============================================
-- 2. USERS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id]               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Name]             NVARCHAR(256)    NOT NULL,
        [Email]            NVARCHAR(256)    NULL,
        [MobileNumber]     NVARCHAR(20)     NOT NULL,
        [PasswordHash]     NVARCHAR(500)    NOT NULL,
        [Role]             NVARCHAR(50)     NOT NULL DEFAULT 'Employee',  -- Admin | Employee | Partner
        [CanCreatePartners] BIT             NOT NULL DEFAULT 0,
        [IsActive]         BIT              NOT NULL DEFAULT 1,
        [CreatedAt]        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT CK_Users_Role CHECK ([Role] IN ('Admin', 'Employee', 'Partner'))
    );

    CREATE UNIQUE INDEX [IX_User_MobileNumber_Unique] ON [dbo].[Users] ([MobileNumber]);
    CREATE UNIQUE INDEX [IX_User_Email_Unique]        ON [dbo].[Users] ([Email])
        WHERE [Email] IS NOT NULL;

    PRINT '2. Users table created.';
END
ELSE
    PRINT '2. Users table already exists.';
GO

-- =============================================
-- 3. PARTNERS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Partners' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Partners] (
        [Id]              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [UserId]          UNIQUEIDENTIFIER NOT NULL,
        [CreatedByUserId] UNIQUEIDENTIFIER NULL,
        [CompanyName]     NVARCHAR(200)    NOT NULL,
        [CompanyAddress]  NVARCHAR(500)    NULL,
        [IsActive]        BIT              NOT NULL DEFAULT 1,
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt]     DATETIME2        NULL,

        CONSTRAINT FK_Partners_Users_UserId
            FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id])
            ON DELETE NO ACTION,

        CONSTRAINT FK_Partners_Users_CreatedBy
            FOREIGN KEY ([CreatedByUserId])
            REFERENCES [dbo].[Users] ([Id])
            ON DELETE NO ACTION
    );

    CREATE UNIQUE INDEX [IX_Partners_UserId_Unique]   ON [dbo].[Partners] ([UserId]);
    CREATE        INDEX [IX_Partners_CompanyName]     ON [dbo].[Partners] ([CompanyName]);
    CREATE        INDEX [IX_Partners_CreatedByUserId] ON [dbo].[Partners] ([CreatedByUserId]);

    PRINT '3. Partners table created.';
END
ELSE
    PRINT '3. Partners table already exists.';
GO

-- =============================================
-- 4. CLIENTS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Clients' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Clients] (
        [Id]               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [Name]             NVARCHAR(100)    NOT NULL,
        [MobileNumber]     NVARCHAR(20)     NOT NULL,
        [Address]          NVARCHAR(250)    NULL,
        [Location]         NVARCHAR(100)    NULL,
        [BusinessType]     NVARCHAR(50)     NULL,
        [EmailId]          NVARCHAR(256)    NULL,
        [Password]         NVARCHAR(200)    NULL,
        [PartnerId]        UNIQUEIDENTIFIER NULL,
        [CreatedByUserId]  UNIQUEIDENTIFIER NULL,
        [AvailableCredits] INT              NOT NULL DEFAULT 0,
        [RowVersion]       ROWVERSION       NOT NULL,           -- optimistic concurrency
        [CreatedAt]        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Clients_Partners
            FOREIGN KEY ([PartnerId])
            REFERENCES [dbo].[Partners] ([Id])
            ON DELETE NO ACTION,

        CONSTRAINT FK_Clients_Users_CreatedBy
            FOREIGN KEY ([CreatedByUserId])
            REFERENCES [dbo].[Users] ([Id])
            ON DELETE NO ACTION
    );

    CREATE INDEX [IX_Clients_MobileNumber]   ON [dbo].[Clients] ([MobileNumber]);
    CREATE INDEX [IX_Clients_CreatedByUserId] ON [dbo].[Clients] ([CreatedByUserId]);

    PRINT '4. Clients table created.';
END
ELSE
    PRINT '4. Clients table already exists.';
GO

-- =============================================
-- 5. CLIENT EMPLOYEE MAPPINGS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ClientEmployeeMappings' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[ClientEmployeeMappings] (
        [Id]        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ClientId]  UNIQUEIDENTIFIER NOT NULL,
        [UserId]    UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt] DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_ClientEmployeeMappings_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE CASCADE,

        CONSTRAINT FK_ClientEmployeeMappings_Users
            FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id])
            ON DELETE CASCADE,

        CONSTRAINT UQ_ClientEmployeeMappings_ClientId_UserId
            UNIQUE ([ClientId], [UserId])
    );

    CREATE INDEX [IX_ClientEmployeeMappings_ClientId] ON [dbo].[ClientEmployeeMappings] ([ClientId]);
    CREATE INDEX [IX_ClientEmployeeMappings_UserId]   ON [dbo].[ClientEmployeeMappings] ([UserId]);

    PRINT '5. ClientEmployeeMappings table created.';
END
ELSE
    PRINT '5. ClientEmployeeMappings table already exists.';
GO

-- =============================================
-- 6. CREDIT TRANSACTIONS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'CreditTransactions' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[CreditTransactions] (
        [Id]           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ClientId]     UNIQUEIDENTIFIER NOT NULL,
        [Type]         NVARCHAR(20)     NOT NULL,    -- 'Credit' | 'Debit'
        [Amount]       INT              NOT NULL,
        [BalanceAfter] INT              NOT NULL,
        [Reference]    NVARCHAR(200)    NOT NULL,
        [CreatedAt]    DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_CreditTransactions_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE CASCADE,

        CONSTRAINT CK_CreditTransactions_Type
            CHECK ([Type] IN ('Credit', 'Debit'))
    );

    CREATE INDEX [IX_CreditTransactions_ClientId] ON [dbo].[CreditTransactions] ([ClientId]);

    PRINT '6. CreditTransactions table created.';
END
ELSE
    PRINT '6. CreditTransactions table already exists.';
GO

-- =============================================
-- 7. TEMPLATES TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Templates' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Templates] (
        [TemplateId]      UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [TemplateName]    NVARCHAR(150)    NOT NULL,
        [TemplateContent] NVARCHAR(MAX)    NOT NULL,
        [Category]        NVARCHAR(50)     NOT NULL,    -- Utility | Marketing | Authentication
        [TemplateType]    NVARCHAR(50)     NOT NULL,    -- Text | Text+Image | Text+Link
        [ClientId]        UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Templates_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE CASCADE,

        CONSTRAINT CK_Templates_Category
            CHECK ([Category] IN ('Utility', 'Marketing', 'Authentication')),

        CONSTRAINT CK_Templates_TemplateType
            CHECK ([TemplateType] IN ('Text', 'Text+Image', 'Text+Link'))
    );

    CREATE INDEX [IX_Templates_ClientId] ON [dbo].[Templates] ([ClientId]);

    PRINT '7. Templates table created.';
END
ELSE
    PRINT '7. Templates table already exists.';
GO

-- =============================================
-- 8. GROUPS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Groups' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Groups] (
        [GroupId]   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [GroupName] NVARCHAR(150)    NOT NULL,
        [ClientId]  UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt] DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Groups_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_Groups_ClientId] ON [dbo].[Groups] ([ClientId]);

    PRINT '8. Groups table created.';
END
ELSE
    PRINT '8. Groups table already exists.';
GO

-- =============================================
-- 9. GROUP MEMBERS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'GroupMembers' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[GroupMembers] (
        [Id]             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [GroupId]        UNIQUEIDENTIFIER NOT NULL,
        [PhoneNumber]    NVARCHAR(20)     NOT NULL,
        [IsKnownContact] BIT              NOT NULL DEFAULT 0,

        CONSTRAINT FK_GroupMembers_Groups
            FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_GroupMembers_GroupId] ON [dbo].[GroupMembers] ([GroupId]);

    PRINT '9. GroupMembers table created.';
END
ELSE
    PRINT '9. GroupMembers table already exists.';
GO

-- =============================================
-- 10. MESSAGES TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Messages' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Messages] (
        [Id]             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ClientId]       UNIQUEIDENTIFIER NOT NULL,
        [TemplateId]     UNIQUEIDENTIFIER NOT NULL,
        [GroupId]        UNIQUEIDENTIFIER NULL,
        [PhoneNumber]    NVARCHAR(20)     NOT NULL,
        [MessageContent] NVARCHAR(MAX)    NOT NULL,
        [Status]         NVARCHAR(20)     NOT NULL DEFAULT 'Pending',
        [RetryCount]     INT              NOT NULL DEFAULT 0,
        [ErrorMessage]   NVARCHAR(1000)   NULL,
        [CreatedAt]      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [SentAt]         DATETIME2        NULL,

        CONSTRAINT FK_Messages_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE NO ACTION,

        CONSTRAINT FK_Messages_Templates
            FOREIGN KEY ([TemplateId])
            REFERENCES [dbo].[Templates] ([TemplateId])
            ON DELETE NO ACTION,

        CONSTRAINT FK_Messages_Groups
            FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId])
            ON DELETE SET NULL,

        CONSTRAINT CK_Messages_Status
            CHECK ([Status] IN ('Pending', 'Sent', 'Failed', 'Delivered'))
    );

    CREATE INDEX [IX_Messages_ClientId_CreatedAt] ON [dbo].[Messages] ([ClientId], [CreatedAt]);
    CREATE INDEX [IX_Messages_Status_CreatedAt]   ON [dbo].[Messages] ([Status], [CreatedAt]);

    PRINT '10. Messages table created.';
END
ELSE
    PRINT '10. Messages table already exists.';
GO

-- =============================================
-- 11. SCHEDULED MESSAGES TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ScheduledMessages' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[ScheduledMessages] (
        [Id]              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [ClientId]        UNIQUEIDENTIFIER NOT NULL,
        [TemplateId]      UNIQUEIDENTIFIER NOT NULL,
        [GroupId]         UNIQUEIDENTIFIER NULL,
        [PhoneNumber]     NVARCHAR(20)     NULL,
        [ScheduledAt]     DATETIME2        NOT NULL,
        [Status]          INT              NOT NULL DEFAULT 0,
        --  0 = Scheduled | 1 = Processing | 2 = Completed | 3 = Failed | 4 = Cancelled
        [RetryCount]      INT              NOT NULL DEFAULT 0,
        [HangfireJobId]   NVARCHAR(100)    NULL,
        [ErrorMessage]    NVARCHAR(1000)   NULL,
        [CreatedAt]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [ProcessedAt]     DATETIME2        NULL,
        [CreatedByUserId] NVARCHAR(100)    NULL,

        CONSTRAINT FK_ScheduledMessages_Clients
            FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id])
            ON DELETE NO ACTION,

        CONSTRAINT FK_ScheduledMessages_Templates
            FOREIGN KEY ([TemplateId])
            REFERENCES [dbo].[Templates] ([TemplateId])
            ON DELETE NO ACTION,

        CONSTRAINT FK_ScheduledMessages_Groups
            FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId])
            ON DELETE NO ACTION,

        CONSTRAINT CK_ScheduledMessages_Status
            CHECK ([Status] IN (0, 1, 2, 3, 4))
    );

    CREATE INDEX [IX_ScheduledMessages_ScheduledAt]      ON [dbo].[ScheduledMessages] ([ScheduledAt]);
    CREATE INDEX [IX_ScheduledMessages_Status]           ON [dbo].[ScheduledMessages] ([Status]);
    CREATE INDEX [IX_ScheduledMessages_ClientId_Status]  ON [dbo].[ScheduledMessages] ([ClientId], [Status]);

    PRINT '11. ScheduledMessages table created.';
END
ELSE
    PRINT '11. ScheduledMessages table already exists.';
GO

-- =============================================
-- 12. AUDIT LOGS TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'AuditLogs' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[AuditLogs] (
        [Id]              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        [EntityName]      NVARCHAR(100)    NOT NULL,
        [EntityId]        UNIQUEIDENTIFIER NOT NULL,
        [Action]          NVARCHAR(50)     NOT NULL,    -- Create | Update | Delete
        [OldValues]       NVARCHAR(MAX)    NULL,
        [NewValues]       NVARCHAR(MAX)    NULL,
        [PerformedBy]     UNIQUEIDENTIFIER NULL,
        [PerformedByName] NVARCHAR(256)    NOT NULL,
        [Timestamp]       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        [IpAddress]       NVARCHAR(50)     NULL
    );

    CREATE INDEX [IX_AuditLogs_EntityName_EntityId] ON [dbo].[AuditLogs] ([EntityName], [EntityId]);
    CREATE INDEX [IX_AuditLogs_PerformedBy]         ON [dbo].[AuditLogs] ([PerformedBy]);
    CREATE INDEX [IX_AuditLogs_Timestamp]           ON [dbo].[AuditLogs] ([Timestamp]);

    PRINT '12. AuditLogs table created.';
END
ELSE
    PRINT '12. AuditLogs table already exists.';
GO

-- =============================================
-- SEED DATA
-- =============================================

-- Default SuperAdmin user in Admins table
IF NOT EXISTS (SELECT 1 FROM [dbo].[Admins] WHERE [Email] = 'admin@messaging.com')
BEGIN
    INSERT INTO [dbo].[Admins] ([Id], [Email], [Password], [FullName], [Role], [IsActive], [CreatedAt])
    VALUES (
        NEWID(),
        'admin@messaging.com',
        'sWdkrVKwLaGD4VzYIuZM4j5fXvuRwAKg7+E9vI3TFAM=',  -- SHA-256 of "Admin@123"
        'System Administrator',
        'SuperAdmin',
        1,
        GETUTCDATE()
    );
    PRINT 'Default admin seeded  |  Email: admin@messaging.com  |  Password: Admin@123';
    PRINT 'IMPORTANT: Change the password after first login.';
END
ELSE
    PRINT 'Default admin already exists.';
GO

PRINT '==========================================='
PRINT 'MessagingPlatformDB setup complete.'
PRINT '==========================================='
GO
