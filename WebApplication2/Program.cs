using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Model.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ListContext>(options =>
{
    // options.UseNpgsql("Host=localhost;Port=5435;Database=todolist;Username=postgres;Password=12345678");
    options.UseNpgsql("Host=todolist-db;Port=5432;Database=todolist;Username=postgres;Password=12345678");
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();