using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeOwnershipAndPartnerPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanCreatePartners",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Partners",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Clients",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Partners_CreatedByUserId",
                table: "Partners",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_CreatedByUserId",
                table: "Clients",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Users_CreatedByUserId",
                table: "Clients",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_Users_CreatedByUserId",
                table: "Partners",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Users_CreatedByUserId",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Partners_Users_CreatedByUserId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_CreatedByUserId",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Clients_CreatedByUserId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "CanCreatePartners",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Clients");
        }
    }
}
