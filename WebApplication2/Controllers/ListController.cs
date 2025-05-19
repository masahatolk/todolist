using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Model.Dto;
using WebApplication2.Model.Entities;
using WebApplication2.Model.Enums;

namespace WebApplication2.Controllers;

[Route("tasks")]
public class ListController : Controller
{
    private readonly ListContext _dbContext;

    public ListController(ListContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Просмотр списка задач
    [HttpGet]
    [Route("list")]
    public async Task<TodoListResponse> Get()
    {
        var list = await _dbContext.Tasks.ToListAsync();
        return new TodoListResponse(list);
    }
    
    // Просмотр выбранной задачи
    [HttpGet]
    [Route("{id:guid}")]
    public async Task<TodoItem?> GetTask(Guid id)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        
        await _dbContext.SaveChangesAsync();
        return todoItem;
    }


    // Добавление задачи
    [HttpPost]
    public async Task<ActionResult> AddTodoItem([FromBody] CreateTodoRequest request)
    {
        var newItem = new TodoItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Deadline = request.Deadline,
            Status = request.Status,
            Priority = request.Priority,
            CreatedOn = DateTime.UtcNow,
            ModifiedOn = DateTime.UtcNow,
        };

        await _dbContext.Tasks.AddAsync(newItem);
        await _dbContext.SaveChangesAsync();

        return Ok(newItem);
    }


    // Удаление задачи
    [HttpDelete]
    [Route("{id:guid}")]
    public async Task DeleteTodoItem(Guid id)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        if (todoItem != null) _dbContext.Tasks.Remove(todoItem);

        await _dbContext.SaveChangesAsync();
    }

    // Редактирование задачи
    [HttpPatch]
    [Route("edit/{id:guid}")]
    public async Task<ActionResult> EditTextTodoItem(Guid id, [FromBody] CreateTodoRequest request)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        
        if (todoItem != null)
        {
            todoItem.Name = request.Name;
            todoItem.Description = request.Description;
            todoItem.Deadline = request.Deadline;
            todoItem.Status = request.Status;
            todoItem.Priority = request.Priority;
            todoItem.ModifiedOn = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        return Ok(todoItem);
    }


    // Изменение состояния дела
    [HttpPatch]
    [Route("{id:guid}/state")]
    public async Task<ActionResult> ChangeStateTodoItem(Guid id, [FromBody] Status newStatus)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);

        if (todoItem != null)
        {
            todoItem.Status = newStatus;
        }
        
        await _dbContext.SaveChangesAsync();
        return Ok(newStatus);
    }
}