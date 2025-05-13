using System.ComponentModel.DataAnnotations;
using WebApplication2.Model.Enums;

namespace WebApplication2.Model.Entities;

public class TodoItem
{
    public Guid Id { get; set; }
    [StringLength(50, MinimumLength = 4)] public string Name { get; set; } = "Новая задача";
    public string? Description { get; set; } = null;
    public DateTime? Deadline { get; set; }
    public Status Status { get; set; } = Status.Active;
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ModifiedOn { get; set; }
}