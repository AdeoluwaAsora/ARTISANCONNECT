using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtisanConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bids",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArtisanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    EtaMinutes = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    RowVersion = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bids", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bids_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bids_Users_ArtisanId",
                        column: x => x.ArtisanId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_AssignedArtisanId",
                table: "Jobs",
                column: "AssignedArtisanId");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_ArtisanId",
                table: "Bids",
                column: "ArtisanId");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_JobId_Accepted",
                table: "Bids",
                column: "JobId",
                unique: true,
                filter: "\"Status\" = 'Accepted' AND NOT \"IsDeleted\"");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_JobId_ArtisanId_Active",
                table: "Bids",
                columns: new[] { "JobId", "ArtisanId" },
                unique: true,
                filter: "\"Status\" <> 'Withdrawn' AND NOT \"IsDeleted\"");

            migrationBuilder.CreateIndex(
                name: "IX_Bids_Status",
                table: "Bids",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_Users_AssignedArtisanId",
                table: "Jobs",
                column: "AssignedArtisanId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_Users_AssignedArtisanId",
                table: "Jobs");

            migrationBuilder.DropTable(
                name: "Bids");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_AssignedArtisanId",
                table: "Jobs");
        }
    }
}
