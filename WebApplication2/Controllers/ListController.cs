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

    // Просмотр списка дел
    [HttpGet]
    [Route("list")]
    public async Task<TodoListResponse> Get()
    {
        var list = await _dbContext.Tasks.ToListAsync();
        return new TodoListResponse(list);
    }

    // Добавление дела
    [HttpPost]
    public async Task<ActionResult> AddTodoItem([FromBody] CreateTodoRequest request)
    {
        var parseValid = Guid.TryParse(request.Id, out var id);
        if (!parseValid)
        {
            return BadRequest($"Invalid Task Id: {request.Id}");
        }

        await _dbContext.Tasks.AddAsync(new TodoItem
        {
            Id = id,
            Name = request.Name,
            Description = request.Description,
            Deadline = request.Deadline,
            Status = request.Status,
            Priority = request.Priority,
            CreatedOn = request.CreatedOn,
            ModifiedOn = request.ModifiedOn,
        });

        await _dbContext.SaveChangesAsync();
        return Ok();
    }


    // Удаление дела
    [HttpDelete]
    [Route("{id:guid}")]
    public async Task DeleteTodoItem(Guid id)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        if (todoItem != null) _dbContext.Tasks.Remove(todoItem);

        await _dbContext.SaveChangesAsync();
    }


    // Редактирование текста-описания дела
    [HttpPatch]
    [Route("{id:guid}/text")]
    public async Task EditTextTodoItem(Guid id, [FromBody] string text)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        if (todoItem != null) todoItem.Name = text;

        await _dbContext.SaveChangesAsync();
    }


    // Изменение состояния дела
    [HttpPatch]
    [Route("{id:guid}/state")]
    public async Task ChangeStateTodoItem(Guid id)
    {
        var todoItem = _dbContext.Tasks.FirstOrDefault(el => el.Id == id);
        if (todoItem != null)
            todoItem.Status = (todoItem.Status == Status.Active) ? Status.Completed : Status.Active;

        await _dbContext.SaveChangesAsync();
    }
}