using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace ArtisanConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArtisanLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "ArtisanProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Point>(
                name: "Location",
                table: "ArtisanProfiles",
                type: "geography (Point, 4326)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArtisanProfiles_Location",
                table: "ArtisanProfiles",
                column: "Location")
                .Annotation("Npgsql:IndexMethod", "GIST");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ArtisanProfiles_Location",
                table: "ArtisanProfiles");

            migrationBuilder.DropColumn(
                name: "City",
                table: "ArtisanProfiles");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "ArtisanProfiles");
        }
    }
}
