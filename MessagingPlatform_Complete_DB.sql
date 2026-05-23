-- ============================================================
-- MessagingPlatform - Complete Database Script
-- Database  : MessagingPlatformDB
-- Generated : 2026
-- Description: Full CREATE TABLE script for all 19 domain
--              entities (19 tables + database creation guard).
--              Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

-- -------------------------------------------------------
-- 1. Create Database (if it doesn't exist)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MessagingPlatformDB')
BEGIN
    CREATE DATABASE [MessagingPlatformDB]
        COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT 'Database [MessagingPlatformDB] created.';
END
ELSE
    PRINT 'Database [MessagingPlatformDB] already exists – skipping creation.';
GO

USE [MessagingPlatformDB];
GO

-- ============================================================
-- TABLE  1: Admins
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Admins' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Admins] (
        [Id]          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Admins_Id          DEFAULT NEWID(),
        [Email]       NVARCHAR(256)    NOT NULL,
        [Password]    NVARCHAR(256)    NOT NULL,
        [FullName]    NVARCHAR(200)    NOT NULL,
        [Role]        NVARCHAR(50)     NOT NULL CONSTRAINT DF_Admins_Role        DEFAULT 'Admin',
        [IsActive]    BIT              NOT NULL CONSTRAINT DF_Admins_IsActive    DEFAULT 1,
        [CreatedAt]   DATETIME2        NOT NULL CONSTRAINT DF_Admins_CreatedAt   DEFAULT GETUTCDATE(),
        [LastLoginAt] DATETIME2        NULL,

        CONSTRAINT PK_Admins          PRIMARY KEY ([Id]),
        CONSTRAINT UX_Admins_Email    UNIQUE ([Email]),
        CONSTRAINT CHK_Admins_Role    CHECK ([Role] IN ('Admin', 'SuperAdmin'))
    );

    CREATE INDEX IX_Admins_Email    ON [dbo].[Admins] ([Email]);
    CREATE INDEX IX_Admins_IsActive ON [dbo].[Admins] ([IsActive]);

    PRINT 'Table [Admins] created.';
END
ELSE
    PRINT 'Table [Admins] already exists – skipped.';
GO

-- ============================================================
-- TABLE  2: Users
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id]                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Users_Id                DEFAULT NEWID(),
        [Name]               NVARCHAR(200)    NOT NULL,
        [Email]              NVARCHAR(256)    NULL,
        [MobileNumber]       NVARCHAR(20)     NOT NULL,
        [PasswordHash]       NVARCHAR(256)    NOT NULL,
        [Role]               NVARCHAR(50)     NOT NULL CONSTRAINT DF_Users_Role               DEFAULT 'Employee',
        [CanCreatePartners]  BIT              NOT NULL CONSTRAINT DF_Users_CanCreatePartners  DEFAULT 0,
        [IsActive]           BIT              NOT NULL CONSTRAINT DF_Users_IsActive           DEFAULT 1,
        [CreatedAt]          DATETIME2        NOT NULL CONSTRAINT DF_Users_CreatedAt          DEFAULT GETUTCDATE(),

        CONSTRAINT PK_Users          PRIMARY KEY ([Id]),
        CONSTRAINT UX_Users_Mobile   UNIQUE ([MobileNumber]),
        CONSTRAINT CHK_Users_Role    CHECK ([Role] IN ('Admin', 'Employee', 'Partner'))
    );

    CREATE INDEX IX_Users_Email        ON [dbo].[Users] ([Email]);
    CREATE INDEX IX_Users_MobileNumber ON [dbo].[Users] ([MobileNumber]);
    CREATE INDEX IX_Users_IsActive     ON [dbo].[Users] ([IsActive]);
    CREATE INDEX IX_Users_Role         ON [dbo].[Users] ([Role]);

    PRINT 'Table [Users] created.';
END
ELSE
    PRINT 'Table [Users] already exists – skipped.';
GO

-- ============================================================
-- TABLE  3: Partners
-- Depends on: Users
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Partners' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Partners] (
        [Id]                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Partners_Id             DEFAULT NEWID(),
        [UserId]            UNIQUEIDENTIFIER NOT NULL,
        [CreatedByUserId]   UNIQUEIDENTIFIER NULL,
        [CompanyName]       NVARCHAR(200)    NOT NULL,
        [CompanyAddress]    NVARCHAR(500)    NOT NULL,
        [IsActive]          BIT              NOT NULL CONSTRAINT DF_Partners_IsActive       DEFAULT 1,
        [CreatedAt]         DATETIME2        NOT NULL CONSTRAINT DF_Partners_CreatedAt      DEFAULT GETUTCDATE(),
        [UpdatedAt]         DATETIME2        NOT NULL CONSTRAINT DF_Partners_UpdatedAt      DEFAULT GETUTCDATE(),
        [LastLoginAt]       DATETIME2        NULL,

        CONSTRAINT PK_Partners                    PRIMARY KEY ([Id]),
        CONSTRAINT UX_Partners_UserId             UNIQUE ([UserId]),
        CONSTRAINT FK_Partners_Users_UserId       FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_Partners_Users_CreatedBy    FOREIGN KEY ([CreatedByUserId])
            REFERENCES [dbo].[Users] ([Id]) ON DELETE NO ACTION
    );

    CREATE INDEX IX_Partners_UserId          ON [dbo].[Partners] ([UserId]);
    CREATE INDEX IX_Partners_CreatedByUserId ON [dbo].[Partners] ([CreatedByUserId]);
    CREATE INDEX IX_Partners_IsActive        ON [dbo].[Partners] ([IsActive]);

    PRINT 'Table [Partners] created.';
END
ELSE
    PRINT 'Table [Partners] already exists – skipped.';
GO

-- ============================================================
-- TABLE  4: Clients
-- Depends on: Partners, Users
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Clients' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Clients] (
        [Id]                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Clients_Id              DEFAULT NEWID(),
        [Name]              NVARCHAR(200)    NOT NULL,
        [MobileNumber]      NVARCHAR(20)     NOT NULL,
        [Address]           NVARCHAR(500)    NOT NULL,
        [Location]          NVARCHAR(200)    NOT NULL,
        [BusinessType]      NVARCHAR(100)    NOT NULL,
        [EmailId]           NVARCHAR(256)    NOT NULL,
        [Password]          NVARCHAR(256)    NOT NULL,
        [PartnerId]         UNIQUEIDENTIFIER NULL,
        [CreatedByUserId]   UNIQUEIDENTIFIER NULL,
        [AvailableCredits]  INT              NOT NULL CONSTRAINT DF_Clients_AvailableCredits DEFAULT 0,
        [RowVersion]        ROWVERSION       NOT NULL,
        [CreatedAt]         DATETIME2        NOT NULL CONSTRAINT DF_Clients_CreatedAt       DEFAULT GETUTCDATE(),

        CONSTRAINT PK_Clients                         PRIMARY KEY ([Id]),
        CONSTRAINT UX_Clients_MobileNumber            UNIQUE ([MobileNumber]),
        CONSTRAINT FK_Clients_Partners_PartnerId      FOREIGN KEY ([PartnerId])
            REFERENCES [dbo].[Partners] ([Id]) ON DELETE SET NULL,
        CONSTRAINT FK_Clients_Users_CreatedByUserId   FOREIGN KEY ([CreatedByUserId])
            REFERENCES [dbo].[Users] ([Id]) ON DELETE SET NULL,
        CONSTRAINT CHK_Clients_AvailableCredits       CHECK ([AvailableCredits] >= 0)
    );

    CREATE INDEX IX_Clients_PartnerId       ON [dbo].[Clients] ([PartnerId]);
    CREATE INDEX IX_Clients_CreatedByUserId ON [dbo].[Clients] ([CreatedByUserId]);
    CREATE INDEX IX_Clients_MobileNumber    ON [dbo].[Clients] ([MobileNumber]);

    PRINT 'Table [Clients] created.';
END
ELSE
    PRINT 'Table [Clients] already exists – skipped.';
GO

-- ============================================================
-- TABLE  5: ClientEmployeeMappings
-- Depends on: Clients, Users
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ClientEmployeeMappings' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[ClientEmployeeMappings] (
        [Id]        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ClientEmployeeMappings_Id        DEFAULT NEWID(),
        [ClientId]  UNIQUEIDENTIFIER NOT NULL,
        [UserId]    UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt] DATETIME2        NOT NULL CONSTRAINT DF_ClientEmployeeMappings_CreatedAt DEFAULT GETUTCDATE(),

        CONSTRAINT PK_ClientEmployeeMappings                     PRIMARY KEY ([Id]),
        CONSTRAINT UX_ClientEmployeeMappings_ClientId_UserId     UNIQUE ([ClientId], [UserId]),
        CONSTRAINT FK_ClientEmployeeMappings_Clients_ClientId    FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_ClientEmployeeMappings_Users_UserId        FOREIGN KEY ([UserId])
            REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );

    CREATE INDEX IX_ClientEmployeeMappings_ClientId ON [dbo].[ClientEmployeeMappings] ([ClientId]);
    CREATE INDEX IX_ClientEmployeeMappings_UserId   ON [dbo].[ClientEmployeeMappings] ([UserId]);

    PRINT 'Table [ClientEmployeeMappings] created.';
END
ELSE
    PRINT 'Table [ClientEmployeeMappings] already exists – skipped.';
GO

-- ============================================================
-- TABLE  6: CreditTransactions
-- Depends on: Clients
-- Enum: CreditTransactionType — Credit=1, Debit=2
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'CreditTransactions' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[CreditTransactions] (
        [Id]           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_CreditTransactions_Id        DEFAULT NEWID(),
        [ClientId]     UNIQUEIDENTIFIER NOT NULL,
        [Type]         INT              NOT NULL,  -- 1=Credit, 2=Debit
        [Amount]       INT              NOT NULL,
        [BalanceAfter] INT              NOT NULL,
        [Reference]    NVARCHAR(500)    NOT NULL,
        [CreatedAt]    DATETIME2        NOT NULL CONSTRAINT DF_CreditTransactions_CreatedAt DEFAULT GETUTCDATE(),

        CONSTRAINT PK_CreditTransactions                         PRIMARY KEY ([Id]),
        CONSTRAINT FK_CreditTransactions_Clients_ClientId        FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE,
        CONSTRAINT CHK_CreditTransactions_Type                   CHECK ([Type] IN (1, 2)),
        CONSTRAINT CHK_CreditTransactions_Amount                 CHECK ([Amount] > 0)
    );

    CREATE INDEX IX_CreditTransactions_ClientId  ON [dbo].[CreditTransactions] ([ClientId]);
    CREATE INDEX IX_CreditTransactions_Type      ON [dbo].[CreditTransactions] ([Type]);
    CREATE INDEX IX_CreditTransactions_CreatedAt ON [dbo].[CreditTransactions] ([CreatedAt]);

    PRINT 'Table [CreditTransactions] created.';
END
ELSE
    PRINT 'Table [CreditTransactions] already exists – skipped.';
GO

-- ============================================================
-- TABLE  7: Templates
-- Depends on: Clients
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Templates' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Templates] (
        [TemplateId]      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Templates_TemplateId      DEFAULT NEWID(),
        [TemplateName]    NVARCHAR(200)    NOT NULL,
        [TemplateContent] NVARCHAR(MAX)    NOT NULL,
        [Category]        NVARCHAR(50)     NOT NULL,  -- Utility, Marketing, Authentication
        [TemplateType]    NVARCHAR(50)     NOT NULL,  -- Text, Text+Image, Text+Link
        [ClientId]        UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt]       DATETIME2        NOT NULL CONSTRAINT DF_Templates_CreatedAt       DEFAULT GETUTCDATE(),

        CONSTRAINT PK_Templates                          PRIMARY KEY ([TemplateId]),
        CONSTRAINT FK_Templates_Clients_ClientId         FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE,
        CONSTRAINT CHK_Templates_Category                CHECK ([Category] IN ('Utility', 'Marketing', 'Authentication')),
        CONSTRAINT CHK_Templates_TemplateType            CHECK ([TemplateType] IN ('Text', 'Text+Image', 'Text+Link'))
    );

    CREATE INDEX IX_Templates_ClientId ON [dbo].[Templates] ([ClientId]);
    CREATE INDEX IX_Templates_Category ON [dbo].[Templates] ([Category]);

    PRINT 'Table [Templates] created.';
END
ELSE
    PRINT 'Table [Templates] already exists – skipped.';
GO

-- ============================================================
-- TABLE  8: Groups
-- Depends on: Clients
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Groups' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Groups] (
        [GroupId]   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Groups_GroupId   DEFAULT NEWID(),
        [GroupName] NVARCHAR(200)    NOT NULL,
        [ClientId]  UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt] DATETIME2        NOT NULL CONSTRAINT DF_Groups_CreatedAt DEFAULT GETUTCDATE(),

        CONSTRAINT PK_Groups                       PRIMARY KEY ([GroupId]),
        CONSTRAINT FK_Groups_Clients_ClientId      FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE
    );

    CREATE INDEX IX_Groups_ClientId ON [dbo].[Groups] ([ClientId]);

    PRINT 'Table [Groups] created.';
END
ELSE
    PRINT 'Table [Groups] already exists – skipped.';
GO

-- ============================================================
-- TABLE  9: GroupMembers
-- Depends on: Groups
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'GroupMembers' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[GroupMembers] (
        [Id]             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_GroupMembers_Id             DEFAULT NEWID(),
        [GroupId]        UNIQUEIDENTIFIER NOT NULL,
        [PhoneNumber]    NVARCHAR(20)     NOT NULL,
        [IsKnownContact] BIT              NOT NULL CONSTRAINT DF_GroupMembers_IsKnownContact DEFAULT 0,

        CONSTRAINT PK_GroupMembers                        PRIMARY KEY ([Id]),
        CONSTRAINT FK_GroupMembers_Groups_GroupId         FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId]) ON DELETE CASCADE
    );

    CREATE INDEX IX_GroupMembers_GroupId     ON [dbo].[GroupMembers] ([GroupId]);
    CREATE INDEX IX_GroupMembers_PhoneNumber ON [dbo].[GroupMembers] ([PhoneNumber]);

    PRINT 'Table [GroupMembers] created.';
END
ELSE
    PRINT 'Table [GroupMembers] already exists – skipped.';
GO

-- ============================================================
-- TABLE 10: Messages
-- Depends on: Clients, Templates, Groups
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Messages' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Messages] (
        [Id]             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Messages_Id             DEFAULT NEWID(),
        [ClientId]       UNIQUEIDENTIFIER NOT NULL,
        [TemplateId]     UNIQUEIDENTIFIER NOT NULL,
        [GroupId]        UNIQUEIDENTIFIER NULL,
        [PhoneNumber]    NVARCHAR(20)     NOT NULL,
        [MessageContent] NVARCHAR(MAX)    NOT NULL,
        [Status]         NVARCHAR(20)     NOT NULL CONSTRAINT DF_Messages_Status         DEFAULT 'Pending',
        [RetryCount]     INT              NOT NULL CONSTRAINT DF_Messages_RetryCount     DEFAULT 0,
        [ErrorMessage]   NVARCHAR(MAX)    NULL,
        [CreatedAt]      DATETIME2        NOT NULL CONSTRAINT DF_Messages_CreatedAt      DEFAULT GETUTCDATE(),
        [SentAt]         DATETIME2        NULL,

        CONSTRAINT PK_Messages                           PRIMARY KEY ([Id]),
        CONSTRAINT FK_Messages_Clients_ClientId          FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT FK_Messages_Templates_TemplateId      FOREIGN KEY ([TemplateId])
            REFERENCES [dbo].[Templates] ([TemplateId]) ON DELETE NO ACTION,
        CONSTRAINT FK_Messages_Groups_GroupId            FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId]) ON DELETE SET NULL,
        CONSTRAINT CHK_Messages_Status                   CHECK ([Status] IN ('Pending', 'Sent', 'Failed', 'Delivered')),
        CONSTRAINT CHK_Messages_RetryCount               CHECK ([RetryCount] >= 0)
    );

    CREATE INDEX IX_Messages_ClientId    ON [dbo].[Messages] ([ClientId]);
    CREATE INDEX IX_Messages_TemplateId  ON [dbo].[Messages] ([TemplateId]);
    CREATE INDEX IX_Messages_GroupId     ON [dbo].[Messages] ([GroupId]);
    CREATE INDEX IX_Messages_Status      ON [dbo].[Messages] ([Status]);
    CREATE INDEX IX_Messages_CreatedAt   ON [dbo].[Messages] ([CreatedAt]);

    PRINT 'Table [Messages] created.';
END
ELSE
    PRINT 'Table [Messages] already exists – skipped.';
GO

-- ============================================================
-- TABLE 11: ScheduledMessages
-- Depends on: Clients, Templates, Groups
-- Enum: ScheduledMessageStatus — 0=Scheduled, 1=Processing,
--       2=Completed, 3=Failed, 4=Cancelled
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ScheduledMessages' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[ScheduledMessages] (
        [Id]               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ScheduledMessages_Id               DEFAULT NEWID(),
        [ClientId]         UNIQUEIDENTIFIER NOT NULL,
        [TemplateId]       UNIQUEIDENTIFIER NOT NULL,
        [GroupId]          UNIQUEIDENTIFIER NULL,
        [PhoneNumber]      NVARCHAR(20)     NULL,
        [ScheduledAt]      DATETIME2        NOT NULL,
        [Status]           INT              NOT NULL CONSTRAINT DF_ScheduledMessages_Status           DEFAULT 0,
        [RetryCount]       INT              NOT NULL CONSTRAINT DF_ScheduledMessages_RetryCount       DEFAULT 0,
        [HangfireJobId]    NVARCHAR(100)    NULL,
        [ErrorMessage]     NVARCHAR(MAX)    NULL,
        [CreatedAt]        DATETIME2        NOT NULL CONSTRAINT DF_ScheduledMessages_CreatedAt        DEFAULT GETUTCDATE(),
        [ProcessedAt]      DATETIME2        NULL,
        [CreatedByUserId]  NVARCHAR(100)    NULL,

        CONSTRAINT PK_ScheduledMessages                              PRIMARY KEY ([Id]),
        CONSTRAINT FK_ScheduledMessages_Clients_ClientId             FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT FK_ScheduledMessages_Templates_TemplateId         FOREIGN KEY ([TemplateId])
            REFERENCES [dbo].[Templates] ([TemplateId]) ON DELETE NO ACTION,
        CONSTRAINT FK_ScheduledMessages_Groups_GroupId               FOREIGN KEY ([GroupId])
            REFERENCES [dbo].[Groups] ([GroupId]) ON DELETE SET NULL,
        CONSTRAINT CHK_ScheduledMessages_Status                      CHECK ([Status] BETWEEN 0 AND 4),
        CONSTRAINT CHK_ScheduledMessages_RetryCount                  CHECK ([RetryCount] >= 0)
    );

    CREATE INDEX IX_ScheduledMessages_ClientId   ON [dbo].[ScheduledMessages] ([ClientId]);
    CREATE INDEX IX_ScheduledMessages_TemplateId ON [dbo].[ScheduledMessages] ([TemplateId]);
    CREATE INDEX IX_ScheduledMessages_GroupId    ON [dbo].[ScheduledMessages] ([GroupId]);
    CREATE INDEX IX_ScheduledMessages_Status     ON [dbo].[ScheduledMessages] ([Status]);
    CREATE INDEX IX_ScheduledMessages_ScheduledAt ON [dbo].[ScheduledMessages] ([ScheduledAt]);

    PRINT 'Table [ScheduledMessages] created.';
END
ELSE
    PRINT 'Table [ScheduledMessages] already exists – skipped.';
GO

-- ============================================================
-- TABLE 12: AuditLogs
-- (no FK – stores any entity audit trail)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'AuditLogs' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[AuditLogs] (
        [Id]              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_AuditLogs_Id              DEFAULT NEWID(),
        [EntityName]      NVARCHAR(100)    NOT NULL,
        [EntityId]        UNIQUEIDENTIFIER NOT NULL,
        [Action]          NVARCHAR(50)     NOT NULL,
        [OldValues]       NVARCHAR(MAX)    NULL,
        [NewValues]       NVARCHAR(MAX)    NULL,
        [PerformedBy]     UNIQUEIDENTIFIER NULL,
        [PerformedByName] NVARCHAR(256)    NOT NULL,
        [Timestamp]       DATETIME2        NOT NULL CONSTRAINT DF_AuditLogs_Timestamp       DEFAULT GETUTCDATE(),
        [IpAddress]       NVARCHAR(64)     NULL,

        CONSTRAINT PK_AuditLogs PRIMARY KEY ([Id])
    );

    CREATE INDEX IX_AuditLogs_EntityName  ON [dbo].[AuditLogs] ([EntityName]);
    CREATE INDEX IX_AuditLogs_EntityId    ON [dbo].[AuditLogs] ([EntityId]);
    CREATE INDEX IX_AuditLogs_PerformedBy ON [dbo].[AuditLogs] ([PerformedBy]);
    CREATE INDEX IX_AuditLogs_Timestamp   ON [dbo].[AuditLogs] ([Timestamp]);

    PRINT 'Table [AuditLogs] created.';
END
ELSE
    PRINT 'Table [AuditLogs] already exists – skipped.';
GO

-- ============================================================
-- TABLE 13: SubscriptionPlans
-- Enum: DurationType — 1=Monthly, 3=Quarterly,
--       6=HalfYearly, 12=Yearly
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'SubscriptionPlans' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[SubscriptionPlans] (
        [Id]               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_SubscriptionPlans_Id              DEFAULT NEWID(),
        [PlanName]         NVARCHAR(100)    NOT NULL,
        [Description]      NVARCHAR(500)    NOT NULL,
        [DurationType]     INT              NOT NULL,  -- 1=Monthly,3=Quarterly,6=HalfYearly,12=Yearly
        [DurationInDays]   INT              NOT NULL,
        [Price]            DECIMAL(18,2)    NOT NULL,
        [IncludedCredits]  INT              NOT NULL CONSTRAINT DF_SubscriptionPlans_IncludedCredits DEFAULT 0,
        [GracePeriodDays]  INT              NOT NULL CONSTRAINT DF_SubscriptionPlans_GracePeriodDays DEFAULT 0,
        [IsTrial]          BIT              NOT NULL CONSTRAINT DF_SubscriptionPlans_IsTrial         DEFAULT 0,
        [MaxUsers]         INT              NULL,
        [MaxGroups]        INT              NULL,
        [MaxTemplates]     INT              NULL,
        [IsActive]         BIT              NOT NULL CONSTRAINT DF_SubscriptionPlans_IsActive        DEFAULT 1,
        [CreatedAt]        DATETIME2        NOT NULL CONSTRAINT DF_SubscriptionPlans_CreatedAt       DEFAULT GETUTCDATE(),
        [UpdatedAt]        DATETIME2        NULL,
        [CreatedBy]        NVARCHAR(100)    NULL,

        CONSTRAINT PK_SubscriptionPlans                            PRIMARY KEY ([Id]),
        CONSTRAINT UX_SubscriptionPlans_PlanName                   UNIQUE ([PlanName]),
        CONSTRAINT CHK_SubscriptionPlans_DurationType              CHECK ([DurationType] IN (1, 3, 6, 12)),
        CONSTRAINT CHK_SubscriptionPlans_Price                     CHECK ([Price] >= 0),
        CONSTRAINT CHK_SubscriptionPlans_IncludedCredits           CHECK ([IncludedCredits] >= 0),
        CONSTRAINT CHK_SubscriptionPlans_DurationInDays            CHECK ([DurationInDays] > 0)
    );

    CREATE INDEX IX_SubscriptionPlans_PlanName ON [dbo].[SubscriptionPlans] ([PlanName]);
    CREATE INDEX IX_SubscriptionPlans_IsActive ON [dbo].[SubscriptionPlans] ([IsActive]);

    PRINT 'Table [SubscriptionPlans] created.';
END
ELSE
    PRINT 'Table [SubscriptionPlans] already exists – skipped.';
GO

-- ============================================================
-- TABLE 14: ClientSubscriptions
-- Depends on: Clients, SubscriptionPlans
-- Enum: SubscriptionStatus — 0=Pending, 1=Active,
--       2=Expired, 3=Cancelled
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ClientSubscriptions' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[ClientSubscriptions] (
        [Id]                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ClientSubscriptions_Id                   DEFAULT NEWID(),
        [ClientId]              UNIQUEIDENTIFIER NOT NULL,
        [SubscriptionPlanId]    UNIQUEIDENTIFIER NOT NULL,
        [StartDate]             DATETIME2        NOT NULL,
        [EndDate]               DATETIME2        NOT NULL,
        [TrialEndsAt]           DATETIME2        NULL,
        [Status]                INT              NOT NULL CONSTRAINT DF_ClientSubscriptions_Status              DEFAULT 0,
        [TotalCreditsAllocated] INT              NOT NULL CONSTRAINT DF_ClientSubscriptions_TotalCredits        DEFAULT 0,
        [RemainingCredits]      INT              NOT NULL CONSTRAINT DF_ClientSubscriptions_RemainingCredits    DEFAULT 0,
        [AutoRenew]             BIT              NOT NULL CONSTRAINT DF_ClientSubscriptions_AutoRenew           DEFAULT 0,
        [LastRenewedAt]         DATETIME2        NULL,
        [CreatedAt]             DATETIME2        NOT NULL CONSTRAINT DF_ClientSubscriptions_CreatedAt           DEFAULT GETUTCDATE(),
        [UpdatedAt]             DATETIME2        NULL,
        [CreatedBy]             NVARCHAR(100)    NULL,

        CONSTRAINT PK_ClientSubscriptions                                    PRIMARY KEY ([Id]),
        CONSTRAINT FK_ClientSubscriptions_Clients_ClientId                   FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_ClientSubscriptions_SubscriptionPlans_PlanId           FOREIGN KEY ([SubscriptionPlanId])
            REFERENCES [dbo].[SubscriptionPlans] ([Id]) ON DELETE RESTRICT,
        CONSTRAINT CHK_ClientSubscriptions_Status                            CHECK ([Status] BETWEEN 0 AND 3),
        CONSTRAINT CHK_ClientSubscriptions_Credits                           CHECK ([TotalCreditsAllocated] >= 0 AND [RemainingCredits] >= 0)
    );

    CREATE INDEX IX_ClientSubscriptions_ClientId           ON [dbo].[ClientSubscriptions] ([ClientId]);
    CREATE INDEX IX_ClientSubscriptions_SubscriptionPlanId ON [dbo].[ClientSubscriptions] ([SubscriptionPlanId]);
    CREATE INDEX IX_ClientSubscriptions_Status_EndDate     ON [dbo].[ClientSubscriptions] ([Status], [EndDate]);

    PRINT 'Table [ClientSubscriptions] created.';
END
ELSE
    PRINT 'Table [ClientSubscriptions] already exists – skipped.';
GO

-- ============================================================
-- TABLE 15: SubscriptionTransactions
-- Depends on: ClientSubscriptions
-- Enum: PaymentStatus  — 0=Pending, 1=Paid, 2=Failed
-- Enum: PaymentMethod  — 0=Cash, 1=UPI, 2=BankTransfer,
--                        3=Razorpay, 4=Stripe
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'SubscriptionTransactions' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[SubscriptionTransactions] (
        [Id]                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_SubscriptionTransactions_Id             DEFAULT NEWID(),
        [ClientSubscriptionId]  UNIQUEIDENTIFIER NOT NULL,
        [Amount]                DECIMAL(18,2)    NOT NULL,
        [PaymentStatus]         INT              NOT NULL CONSTRAINT DF_SubscriptionTransactions_PaymentStatus  DEFAULT 0,
        [PaymentMethod]         INT              NOT NULL CONSTRAINT DF_SubscriptionTransactions_PaymentMethod  DEFAULT 0,
        [TransactionReference]  NVARCHAR(200)    NULL,
        [PaidAt]                DATETIME2        NULL,
        [CreatedAt]             DATETIME2        NOT NULL CONSTRAINT DF_SubscriptionTransactions_CreatedAt      DEFAULT GETUTCDATE(),

        CONSTRAINT PK_SubscriptionTransactions                                         PRIMARY KEY ([Id]),
        CONSTRAINT FK_SubscriptionTransactions_ClientSubscriptions_SubscriptionId      FOREIGN KEY ([ClientSubscriptionId])
            REFERENCES [dbo].[ClientSubscriptions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT CHK_SubscriptionTransactions_PaymentStatus                          CHECK ([PaymentStatus] BETWEEN 0 AND 2),
        CONSTRAINT CHK_SubscriptionTransactions_PaymentMethod                          CHECK ([PaymentMethod] BETWEEN 0 AND 4),
        CONSTRAINT CHK_SubscriptionTransactions_Amount                                 CHECK ([Amount] >= 0)
    );

    CREATE INDEX IX_SubscriptionTransactions_ClientSubscriptionId ON [dbo].[SubscriptionTransactions] ([ClientSubscriptionId]);
    CREATE INDEX IX_SubscriptionTransactions_PaymentStatus        ON [dbo].[SubscriptionTransactions] ([PaymentStatus]);

    PRINT 'Table [SubscriptionTransactions] created.';
END
ELSE
    PRINT 'Table [SubscriptionTransactions] already exists – skipped.';
GO

-- ============================================================
-- TABLE 16: Quotations
-- Depends on: Clients, SubscriptionPlans
-- Enum: QuotationStatus — 0=Draft, 1=Sent, 2=Approved,
--                         3=Rejected, 4=Expired
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Quotations' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Quotations] (
        [Id]                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Quotations_Id              DEFAULT NEWID(),
        [ClientId]           UNIQUEIDENTIFIER NOT NULL,
        [SubscriptionPlanId] UNIQUEIDENTIFIER NOT NULL,
        [QuotationNumber]    NVARCHAR(30)     NOT NULL,
        [OriginalPrice]      DECIMAL(18,2)    NOT NULL,
        [DiscountAmount]     DECIMAL(18,2)    NOT NULL CONSTRAINT DF_Quotations_DiscountAmount  DEFAULT 0,
        [FinalPrice]         DECIMAL(18,2)    NOT NULL,
        [IncludedCredits]    INT              NOT NULL CONSTRAINT DF_Quotations_IncludedCredits DEFAULT 0,
        [ValidFrom]          DATETIME2        NOT NULL,
        [ValidTo]            DATETIME2        NOT NULL,
        [Status]             INT              NOT NULL CONSTRAINT DF_Quotations_Status          DEFAULT 0,
        [Notes]              NVARCHAR(1000)   NULL,
        [CreatedBy]          NVARCHAR(100)    NULL,
        [CreatedAt]          DATETIME2        NOT NULL CONSTRAINT DF_Quotations_CreatedAt       DEFAULT GETUTCDATE(),
        [UpdatedAt]          DATETIME2        NULL,

        CONSTRAINT PK_Quotations                                     PRIMARY KEY ([Id]),
        CONSTRAINT UX_Quotations_QuotationNumber                     UNIQUE ([QuotationNumber]),
        CONSTRAINT FK_Quotations_Clients_ClientId                    FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_Quotations_SubscriptionPlans_SubscriptionPlanId FOREIGN KEY ([SubscriptionPlanId])
            REFERENCES [dbo].[SubscriptionPlans] ([Id]) ON DELETE RESTRICT,
        CONSTRAINT CHK_Quotations_Status                             CHECK ([Status] BETWEEN 0 AND 4),
        CONSTRAINT CHK_Quotations_OriginalPrice                      CHECK ([OriginalPrice] >= 0),
        CONSTRAINT CHK_Quotations_DiscountAmount                     CHECK ([DiscountAmount] >= 0),
        CONSTRAINT CHK_Quotations_FinalPrice                         CHECK ([FinalPrice] >= 0)
    );

    CREATE INDEX IX_Quotations_ClientId           ON [dbo].[Quotations] ([ClientId]);
    CREATE INDEX IX_Quotations_SubscriptionPlanId ON [dbo].[Quotations] ([SubscriptionPlanId]);
    CREATE INDEX IX_Quotations_Status             ON [dbo].[Quotations] ([Status]);
    CREATE INDEX IX_Quotations_ValidTo            ON [dbo].[Quotations] ([ValidTo]);

    PRINT 'Table [Quotations] created.';
END
ELSE
    PRINT 'Table [Quotations] already exists – skipped.';
GO

-- ============================================================
-- TABLE 17: Billings
-- Depends on: Quotations, Clients
-- Enum: BillingPaymentStatus — 0=Pending, 1=PartiallyPaid,
--       2=Approved, 3=Rejected, 4=Draft
-- Enum: PaymentMethod        — 0=Cash, 1=UPI, 2=BankTransfer,
--       3=Razorpay, 4=Stripe
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Billings' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Billings] (
        [Id]               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Billings_Id              DEFAULT NEWID(),
        [BillingNumber]    NVARCHAR(30)     NOT NULL,
        [QuotationId]      UNIQUEIDENTIFIER NOT NULL,
        [ClientId]         UNIQUEIDENTIFIER NOT NULL,
        [TotalAmount]      DECIMAL(18,2)    NOT NULL,
        [PaidAmount]       DECIMAL(18,2)    NOT NULL CONSTRAINT DF_Billings_PaidAmount      DEFAULT 0,
        [PaymentStatus]    INT              NOT NULL CONSTRAINT DF_Billings_PaymentStatus   DEFAULT 0,
        [PaymentMethod]    INT              NOT NULL CONSTRAINT DF_Billings_PaymentMethod   DEFAULT 0,
        [Notes]            NVARCHAR(1000)   NULL,
        [CreatedBy]        NVARCHAR(200)    NULL,
        [CreatedAt]        DATETIME2        NOT NULL CONSTRAINT DF_Billings_CreatedAt       DEFAULT GETUTCDATE(),
        [UpdatedAt]        DATETIME2        NULL,
        -- Approval fields
        [ApprovedBy]       NVARCHAR(MAX)    NULL,
        [ApprovedAt]       DATETIME2        NULL,
        [ApprovalNotes]    NVARCHAR(MAX)    NULL,
        -- Rejection fields
        [RejectedBy]       NVARCHAR(MAX)    NULL,
        [RejectedAt]       DATETIME2        NULL,
        [RejectionReason]  NVARCHAR(MAX)    NULL,
        -- Legacy verify
        [VerifiedBy]       NVARCHAR(200)    NULL,
        [VerifiedAt]       DATETIME2        NULL,

        CONSTRAINT PK_Billings                           PRIMARY KEY ([Id]),
        CONSTRAINT UX_Billings_BillingNumber             UNIQUE ([BillingNumber]),
        CONSTRAINT UX_Billings_QuotationId               UNIQUE ([QuotationId]),
        CONSTRAINT FK_Billings_Quotations_QuotationId    FOREIGN KEY ([QuotationId])
            REFERENCES [dbo].[Quotations] ([Id]) ON DELETE RESTRICT,
        CONSTRAINT FK_Billings_Clients_ClientId          FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE RESTRICT,
        CONSTRAINT CHK_Billings_PaymentStatus            CHECK ([PaymentStatus] BETWEEN 0 AND 4),
        CONSTRAINT CHK_Billings_PaymentMethod            CHECK ([PaymentMethod] BETWEEN 0 AND 4),
        CONSTRAINT CHK_Billings_TotalAmount              CHECK ([TotalAmount] >= 0),
        CONSTRAINT CHK_Billings_PaidAmount               CHECK ([PaidAmount] >= 0)
    );

    CREATE INDEX IX_Billings_ClientId       ON [dbo].[Billings] ([ClientId]);
    CREATE INDEX IX_Billings_QuotationId    ON [dbo].[Billings] ([QuotationId]);
    CREATE INDEX IX_Billings_PaymentStatus  ON [dbo].[Billings] ([PaymentStatus]);
    CREATE INDEX IX_Billings_CreatedAt      ON [dbo].[Billings] ([CreatedAt]);

    PRINT 'Table [Billings] created.';
END
ELSE
    PRINT 'Table [Billings] already exists – skipped.';
GO

-- ============================================================
-- TABLE 18: PaymentReferences
-- Depends on: Billings
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'PaymentReferences' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[PaymentReferences] (
        [Id]          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_PaymentReferences_Id          DEFAULT NEWID(),
        [BillingId]   UNIQUEIDENTIFIER NOT NULL,
        [FileName]    NVARCHAR(260)    NOT NULL,
        [FileUrl]     NVARCHAR(500)    NOT NULL,
        [FileType]    NVARCHAR(50)     NOT NULL,
        [FileSize]    BIGINT           NOT NULL,
        [UploadedAt]  DATETIME2        NOT NULL CONSTRAINT DF_PaymentReferences_UploadedAt  DEFAULT GETUTCDATE(),
        [UploadedBy]  NVARCHAR(200)    NULL,

        CONSTRAINT PK_PaymentReferences                          PRIMARY KEY ([Id]),
        CONSTRAINT FK_PaymentReferences_Billings_BillingId       FOREIGN KEY ([BillingId])
            REFERENCES [dbo].[Billings] ([Id]) ON DELETE CASCADE,
        CONSTRAINT CHK_PaymentReferences_FileSize                CHECK ([FileSize] > 0)
    );

    CREATE INDEX IX_PaymentReferences_BillingId ON [dbo].[PaymentReferences] ([BillingId]);

    PRINT 'Table [PaymentReferences] created.';
END
ELSE
    PRINT 'Table [PaymentReferences] already exists – skipped.';
GO

-- ============================================================
-- TABLE 19: Tickets
-- Depends on: Clients, Users (optional assignment)
-- Enum: TicketPriority — 0=Low, 1=Medium, 2=High, 3=Critical
-- Enum: TicketType     — 0=INC, 1=SR
-- Enum: TicketStatus   — 0=Open, 1=InProgress, 2=Resolved,
--                        3=Closed, 4=Rejected
-- Enum: SlaStatus      — 0=Met, 1=Breached
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Tickets' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Tickets] (
        [Id]                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Tickets_Id                  DEFAULT NEWID(),
        [TicketNumber]          NVARCHAR(50)     NOT NULL,
        [ClientId]              UNIQUEIDENTIFIER NOT NULL,
        [ClientName]            NVARCHAR(200)    NOT NULL,
        [MobileNumber]          NVARCHAR(20)     NOT NULL,
        [IssueDate]             DATETIME2        NOT NULL,
        [IssueDescription]      NVARCHAR(MAX)    NOT NULL,
        [Priority]              INT              NOT NULL CONSTRAINT DF_Tickets_Priority             DEFAULT 0,
        [TicketType]            INT              NOT NULL CONSTRAINT DF_Tickets_TicketType           DEFAULT 0,
        [Status]                INT              NOT NULL CONSTRAINT DF_Tickets_Status               DEFAULT 0,
        [ResolutionDescription] NVARCHAR(MAX)    NULL,
        [SlaStatus]             INT              NOT NULL CONSTRAINT DF_Tickets_SlaStatus            DEFAULT 0,
        [AssignedToUserId]      UNIQUEIDENTIFIER NULL,
        [ResolvedAt]            DATETIME2        NULL,
        [ClosedAt]              DATETIME2        NULL,
        [CreatedBy]             NVARCHAR(200)    NOT NULL,
        [CreatedAt]             DATETIME2        NOT NULL CONSTRAINT DF_Tickets_CreatedAt            DEFAULT GETUTCDATE(),
        [UpdatedAt]             DATETIME2        NOT NULL CONSTRAINT DF_Tickets_UpdatedAt            DEFAULT GETUTCDATE(),

        CONSTRAINT PK_Tickets                                   PRIMARY KEY ([Id]),
        CONSTRAINT UX_Tickets_TicketNumber                      UNIQUE ([TicketNumber]),
        CONSTRAINT FK_Tickets_Clients_ClientId                  FOREIGN KEY ([ClientId])
            REFERENCES [dbo].[Clients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT FK_Tickets_Users_AssignedToUserId            FOREIGN KEY ([AssignedToUserId])
            REFERENCES [dbo].[Users] ([Id]) ON DELETE SET NULL,
        CONSTRAINT CHK_Tickets_Priority                         CHECK ([Priority] BETWEEN 0 AND 3),
        CONSTRAINT CHK_Tickets_TicketType                       CHECK ([TicketType] BETWEEN 0 AND 1),
        CONSTRAINT CHK_Tickets_Status                           CHECK ([Status] BETWEEN 0 AND 4),
        CONSTRAINT CHK_Tickets_SlaStatus                        CHECK ([SlaStatus] BETWEEN 0 AND 1)
    );

    CREATE INDEX IX_Tickets_ClientId         ON [dbo].[Tickets] ([ClientId]);
    CREATE INDEX IX_Tickets_AssignedToUserId ON [dbo].[Tickets] ([AssignedToUserId]);
    CREATE INDEX IX_Tickets_Status           ON [dbo].[Tickets] ([Status]);
    CREATE INDEX IX_Tickets_Priority         ON [dbo].[Tickets] ([Priority]);
    CREATE INDEX IX_Tickets_CreatedAt        ON [dbo].[Tickets] ([CreatedAt]);

    PRINT 'Table [Tickets] created.';
END
ELSE
    PRINT 'Table [Tickets] already exists – skipped.';
GO

-- ============================================================
-- SUMMARY
-- ============================================================
PRINT '';
PRINT '=================================================';
PRINT 'MessagingPlatformDB - All tables provisioned:';
PRINT '  1.  Admins';
PRINT '  2.  Users';
PRINT '  3.  Partners';
PRINT '  4.  Clients';
PRINT '  5.  ClientEmployeeMappings';
PRINT '  6.  CreditTransactions';
PRINT '  7.  Templates';
PRINT '  8.  Groups';
PRINT '  9.  GroupMembers';
PRINT '  10. Messages';
PRINT '  11. ScheduledMessages';
PRINT '  12. AuditLogs';
PRINT '  13. SubscriptionPlans';
PRINT '  14. ClientSubscriptions';
PRINT '  15. SubscriptionTransactions';
PRINT '  16. Quotations';
PRINT '  17. Billings';
PRINT '  18. PaymentReferences';
PRINT '  19. Tickets';
PRINT '=================================================';
GO
