using FluentValidation;
using ListToDo.Models;
using ListToDo.Modules;
using ListToDo.Validators;
using Clerk.Net.DependencyInjection;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IValidator<Todo>, TodoValidator>();

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddClerkApiClient(config =>
{
    config.SecretKey = builder.Configuration["Clerk:SecretKey"];
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();

app.MapFallbackToFile("html/index.html");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapTodoEndpoints();

app.Run();