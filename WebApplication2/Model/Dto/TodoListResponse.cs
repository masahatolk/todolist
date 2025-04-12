using WebApplication2.Model.Entities;

namespace WebApplication2.Model.Dto;

public record TodoListResponse(
    List<TodoItem> TodoItems
);