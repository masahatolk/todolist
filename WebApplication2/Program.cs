using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using WebApplication2.Model.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ListContext>(options =>
{
    options.UseNpgsql("Host=localhost;Port=5435;Database=todolist;Username=postgres;Password=12345678");
    //options.UseNpgsql("Host=todolist-db;Port=5432;Database=todolist;Username=postgres;Password=12345678");
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // c.EnableAnnotations();
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Backend.Api",
        Version = "v1",
        Description = "Backend API"
    });
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});


const string policyName = "CorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: policyName, builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors(policyName);

// Auto Migration
using var serviceScope = app.Services.CreateScope();
var context = serviceScope.ServiceProvider.GetService<ListContext>();
context?.Database.Migrate();

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();