using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartnerManagementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string legacyPartnerPasswordHash = "$2a$11$lxypFQNdm1xawOL/dxa0te.E/wX18ZKR7NPsQ/uJh7cgCPvesxRf6";

            migrationBuilder.Sql(@"
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF OBJECT_ID(N'[dbo].[Clients]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'[dbo].[Clients]', N'PartnerId') IS NULL
        ALTER TABLE [dbo].[Clients] ADD [PartnerId] UNIQUEIDENTIFIER NULL;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Clients_MobileNumber' AND object_id = OBJECT_ID(N'[dbo].[Clients]'))
        CREATE INDEX [IX_Clients_MobileNumber] ON [dbo].[Clients]([MobileNumber]);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Clients_PartnerId' AND object_id = OBJECT_ID(N'[dbo].[Clients]'))
        CREATE INDEX [IX_Clients_PartnerId] ON [dbo].[Clients]([PartnerId]);
END;

IF OBJECT_ID(N'[dbo].[Admins]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Admins] (
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [Email] NVARCHAR(MAX) NOT NULL,
        [Password] NVARCHAR(MAX) NOT NULL,
        [FullName] NVARCHAR(MAX) NOT NULL,
        [Role] NVARCHAR(MAX) NOT NULL,
        [IsActive] BIT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL,
        [LastLoginAt] DATETIME2 NULL,
        CONSTRAINT [PK_Admins] PRIMARY KEY ([Id])
    );
END;

IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(256) NOT NULL,
        [Email] NVARCHAR(256) NULL,
        [MobileNumber] NVARCHAR(20) NOT NULL,
        [PasswordHash] NVARCHAR(500) NOT NULL,
        [Role] NVARCHAR(50) NOT NULL CONSTRAINT [DF_Users_Role] DEFAULT N'Employee',
        [IsActive] BIT NOT NULL CONSTRAINT [DF_Users_IsActive] DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF OBJECT_ID(N'[dbo].[Partners]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Partners] (
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [CompanyName] NVARCHAR(200) NOT NULL,
        [CompanyAddress] NVARCHAR(500) NOT NULL,
        [IsActive] BIT NOT NULL CONSTRAINT [DF_Partners_IsActive] DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Partners_CreatedAt] DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Partners_UpdatedAt] DEFAULT GETUTCDATE(),
        [LastLoginAt] DATETIME2 NULL,
        CONSTRAINT [PK_Partners] PRIMARY KEY ([Id])
    );
END;

IF OBJECT_ID(N'[dbo].[Partners]', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'[dbo].[Partners]', N'UserId') IS NULL
        ALTER TABLE [dbo].[Partners] ADD [UserId] UNIQUEIDENTIFIER NULL;

    IF COL_LENGTH(N'[dbo].[Partners]', N'CompanyAddress') IS NULL
        ALTER TABLE [dbo].[Partners] ADD [CompanyAddress] NVARCHAR(500) NULL;

    IF COL_LENGTH(N'[dbo].[Partners]', N'IsActive') IS NULL
        ALTER TABLE [dbo].[Partners] ADD [IsActive] BIT NOT NULL CONSTRAINT [DF_Partners_IsActive] DEFAULT 1;

    IF COL_LENGTH(N'[dbo].[Partners]', N'UpdatedAt') IS NULL
        ALTER TABLE [dbo].[Partners] ADD [UpdatedAt] DATETIME2 NULL;

    IF COL_LENGTH(N'[dbo].[Partners]', N'LastLoginAt') IS NULL
        ALTER TABLE [dbo].[Partners] ADD [LastLoginAt] DATETIME2 NULL;
END;
");

            migrationBuilder.Sql(@"
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NOT NULL
BEGIN
    DECLARE @dropIndexesSql NVARCHAR(MAX) = N'';

    SELECT @dropIndexesSql += N'DROP INDEX [' + i.name + N'] ON [dbo].[Users];' + CHAR(10)
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic
        ON i.object_id = ic.object_id
       AND i.index_id = ic.index_id
    INNER JOIN sys.columns c
        ON ic.object_id = c.object_id
       AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID(N'[dbo].[Users]')
      AND c.name IN (N'Email', N'MobileNumber')
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0;

    IF @dropIndexesSql <> N''
        EXEC sp_executesql @dropIndexesSql;

    DECLARE @dropConstraintsSql NVARCHAR(MAX) = N'';

    SELECT @dropConstraintsSql += N'ALTER TABLE [dbo].[Users] DROP CONSTRAINT [' + kc.name + N'];' + CHAR(10)
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic
        ON kc.parent_object_id = ic.object_id
       AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c
        ON ic.object_id = c.object_id
       AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID(N'[dbo].[Users]')
      AND kc.type = N'UQ'
      AND c.name IN (N'Email', N'MobileNumber');

    IF @dropConstraintsSql <> N''
        EXEC sp_executesql @dropConstraintsSql;

    IF COL_LENGTH(N'[dbo].[Users]', N'Email') IS NULL
        ALTER TABLE [dbo].[Users] ADD [Email] NVARCHAR(256) NULL;

    UPDATE [dbo].[Users]
    SET [Email] = NULL
    WHERE LTRIM(RTRIM(ISNULL([Email], N''))) = N'';

    ALTER TABLE [dbo].[Users] ALTER COLUMN [Email] NVARCHAR(256) NULL;
    ALTER TABLE [dbo].[Users] ALTER COLUMN [MobileNumber] NVARCHAR(20) NOT NULL;

    IF COL_LENGTH(N'[dbo].[Users]', N'IsActive') IS NULL
        ALTER TABLE [dbo].[Users] ADD [IsActive] BIT NOT NULL CONSTRAINT [DF_Users_IsActive] DEFAULT 1;
    ELSE
    BEGIN
        UPDATE [dbo].[Users] SET [IsActive] = 1 WHERE [IsActive] IS NULL;
        ALTER TABLE [dbo].[Users] ALTER COLUMN [IsActive] BIT NOT NULL;
    END;

    IF COL_LENGTH(N'[dbo].[Users]', N'CreatedAt') IS NULL
        ALTER TABLE [dbo].[Users] ADD [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT GETUTCDATE();
    ELSE
    BEGIN
        UPDATE [dbo].[Users] SET [CreatedAt] = GETUTCDATE() WHERE [CreatedAt] IS NULL;
        ALTER TABLE [dbo].[Users] ALTER COLUMN [CreatedAt] DATETIME2 NOT NULL;
    END;
END;
");

            migrationBuilder.Sql($@"
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF OBJECT_ID(N'[dbo].[Partners]', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Partners]
    SET [CompanyAddress] = COALESCE(NULLIF(LTRIM(RTRIM([CompanyAddress])), N''), NULLIF(LTRIM(RTRIM([Location])), N''), NULLIF(LTRIM(RTRIM([CompanyName])), N''), N'Not provided')
    WHERE [CompanyAddress] IS NULL OR LTRIM(RTRIM([CompanyAddress])) = N'';

    UPDATE [dbo].[Partners]
    SET [UpdatedAt] = ISNULL([CreatedAt], GETUTCDATE())
    WHERE [UpdatedAt] IS NULL;

    DECLARE @PartnerId UNIQUEIDENTIFIER;
    DECLARE @PartnerName NVARCHAR(256);
    DECLARE @PartnerMobile NVARCHAR(20);
    DECLARE @PartnerEmail NVARCHAR(256);
    DECLARE @PartnerCreatedAt DATETIME2;
    DECLARE @UserId UNIQUEIDENTIFIER;
    DECLARE @ResolvedEmail NVARCHAR(256);

    DECLARE legacy_partner_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT
            [Id],
            COALESCE(NULLIF(LTRIM(RTRIM([Name])), N''), N'Partner'),
            LEFT(LTRIM(RTRIM([MobileNumber])), 20),
            NULLIF(LTRIM(RTRIM([Email])), N''),
            ISNULL([CreatedAt], GETUTCDATE())
        FROM [dbo].[Partners]
        WHERE [UserId] IS NULL;

    OPEN legacy_partner_cursor;
    FETCH NEXT FROM legacy_partner_cursor INTO @PartnerId, @PartnerName, @PartnerMobile, @PartnerEmail, @PartnerCreatedAt;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @UserId = NULL;
        SET @ResolvedEmail = @PartnerEmail;

        SELECT TOP (1) @UserId = [Id]
        FROM [dbo].[Users]
        WHERE [MobileNumber] = @PartnerMobile
           OR (@PartnerEmail IS NOT NULL AND [Email] = @PartnerEmail)
        ORDER BY [CreatedAt];

        IF @UserId IS NULL
        BEGIN
            IF @PartnerEmail IS NOT NULL AND EXISTS (
                SELECT 1
                FROM [dbo].[Users]
                WHERE [Email] = @PartnerEmail
            )
                SET @ResolvedEmail = NULL;

            SET @UserId = NEWID();

            INSERT INTO [dbo].[Users] ([Id], [Name], [Email], [MobileNumber], [PasswordHash], [Role], [IsActive], [CreatedAt])
            VALUES (@UserId, @PartnerName, @ResolvedEmail, @PartnerMobile, N'{legacyPartnerPasswordHash}', N'Partner', 1, @PartnerCreatedAt);
        END;

        UPDATE [dbo].[Partners]
        SET [UserId] = @UserId,
            [CompanyAddress] = COALESCE(NULLIF(LTRIM(RTRIM([CompanyAddress])), N''), NULLIF(LTRIM(RTRIM([CompanyName])), N''), N'Not provided'),
            [IsActive] = ISNULL([IsActive], 1),
            [UpdatedAt] = ISNULL([UpdatedAt], @PartnerCreatedAt)
        WHERE [Id] = @PartnerId;

        FETCH NEXT FROM legacy_partner_cursor INTO @PartnerId, @PartnerName, @PartnerMobile, @PartnerEmail, @PartnerCreatedAt;
    END;

    CLOSE legacy_partner_cursor;
    DEALLOCATE legacy_partner_cursor;

    ALTER TABLE [dbo].[Partners] ALTER COLUMN [CompanyAddress] NVARCHAR(500) NOT NULL;
    ALTER TABLE [dbo].[Partners] ALTER COLUMN [UpdatedAt] DATETIME2 NOT NULL;
    ALTER TABLE [dbo].[Partners] ALTER COLUMN [UserId] UNIQUEIDENTIFIER NOT NULL;
END;
");

            migrationBuilder.Sql(@"
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Partners_CompanyName' AND object_id = OBJECT_ID(N'[dbo].[Partners]'))
    CREATE INDEX [IX_Partners_CompanyName] ON [dbo].[Partners]([CompanyName]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Partners_UserId_Unique' AND object_id = OBJECT_ID(N'[dbo].[Partners]'))
   AND NOT EXISTS (SELECT [UserId] FROM [dbo].[Partners] GROUP BY [UserId] HAVING COUNT(*) > 1)
    CREATE UNIQUE INDEX [IX_Partners_UserId_Unique] ON [dbo].[Partners]([UserId]);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_User_Email_Unique' AND object_id = OBJECT_ID(N'[dbo].[Users]'))
   AND NOT EXISTS (SELECT [Email] FROM [dbo].[Users] WHERE [Email] IS NOT NULL GROUP BY [Email] HAVING COUNT(*) > 1)
    CREATE UNIQUE INDEX [IX_User_Email_Unique] ON [dbo].[Users]([Email]) WHERE [Email] IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_User_MobileNumber_Unique' AND object_id = OBJECT_ID(N'[dbo].[Users]'))
   AND NOT EXISTS (SELECT [MobileNumber] FROM [dbo].[Users] GROUP BY [MobileNumber] HAVING COUNT(*) > 1)
    CREATE UNIQUE INDEX [IX_User_MobileNumber_Unique] ON [dbo].[Users]([MobileNumber]);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Partners_Users_UserId')
    ALTER TABLE [dbo].[Partners] WITH CHECK ADD CONSTRAINT [FK_Partners_Users_UserId]
        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Clients_Partners_PartnerId')
    ALTER TABLE [dbo].[Clients] WITH CHECK ADD CONSTRAINT [FK_Clients_Partners_PartnerId]
        FOREIGN KEY([PartnerId]) REFERENCES [dbo].[Partners]([Id]) ON DELETE NO ACTION;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Partners_PartnerId",
                table: "Clients");

            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Partners");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Clients_MobileNumber",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_PartnerId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "PartnerId",
                table: "Clients");

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "EmailId",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Clients",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");
        }
    }
}
