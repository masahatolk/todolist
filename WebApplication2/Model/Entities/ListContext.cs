using Microsoft.EntityFrameworkCore;

namespace WebApplication2.Model.Entities;

public class ListContext : DbContext
{
    public DbSet<TodoItem> Tasks { get; set; }

    public ListContext(DbContextOptions options) : base(options)
    {
        Database.Migrate();
    }
}