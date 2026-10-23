using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtisanConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    /// <remarks>
    /// Hand-written so existing budgets survive: EF's default for a property
    /// rename is drop + add, which would lose every job's budget. The old
    /// single Budget becomes BudgetMin, and BudgetMax starts at the same value.
    /// </remarks>
    public partial class SplitJobBudgetIntoRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Budget",
                table: "Jobs",
                newName: "BudgetMin");

            migrationBuilder.AddColumn<decimal>(
                name: "BudgetMax",
                table: "Jobs",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql("UPDATE \"Jobs\" SET \"BudgetMax\" = \"BudgetMin\";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BudgetMax",
                table: "Jobs");

            migrationBuilder.RenameColumn(
                name: "BudgetMin",
                table: "Jobs",
                newName: "Budget");
        }
    }
}
