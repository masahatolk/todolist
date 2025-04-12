using WebApplication2.Model.Enums;

namespace WebApplication2.Model.Dto;

public class CreateTodoRequest
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime? Deadline { get; set; }
    public Status Status { get; set; } = Status.Active;
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime CreatedOn { get; set; } = DateTime.Now;
    public DateTime? ModifiedOn { get; set; } = DateTime.Now;
}