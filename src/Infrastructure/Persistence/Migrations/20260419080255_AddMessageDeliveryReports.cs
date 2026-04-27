using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageDeliveryReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ClientId",
                table: "Messages");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ClientId_CreatedAt",
                table: "Messages",
                columns: new[] { "ClientId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_Status_CreatedAt",
                table: "Messages",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ClientId_CreatedAt",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_Status_CreatedAt",
                table: "Messages");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ClientId",
                table: "Messages",
                column: "ClientId");
        }
    }
}
