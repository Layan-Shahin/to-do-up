using FluentValidation;
using ListToDo.Models;
using ListToDo.Validators;

namespace ListToDo.Modules;

public static class TodoModule
{
    private static List<Todo> todos = new List<Todo>
    {
        new() { Id = 1, Title = "UI/UX", Description = "do design for project", IsCompleted = true },
        new() { Id = 2, Title = "Requirement", Description = "collect requirement", IsCompleted = false },
        new() { Id = 3, Title = "testing", Description = "testing project", IsCompleted = true },
        new() { Id = 4, Title = "development", Description = "develop project", IsCompleted = false }
    };

    public static void MapTodoEndpoints(this WebApplication app)
    {
        app.MapGet("/todos", () => todos);

        app.MapGet("/todos/{id}", (int id) =>
        {
            var todo = todos.FirstOrDefault(x => x.Id == id);

            return todo is not null
                ? Results.Ok(todo)
                : Results.NotFound();
        });

        app.MapPost("/todos", async (Todo newToDo, IValidator<Todo> validator) =>
        {
            newToDo.Id = (todos?.Max(t => t.Id) ?? 0) + 1;

            var result = await validator.ValidateAsync(newToDo);
            
            if (!result.IsValid)
            {
                var errors = result.Errors
                    .GroupBy(x => x.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );
            
                return Results.ValidationProblem(errors);
            }

            todos.Add(newToDo);

            return Results.Created($"/todos/{newToDo.Id}", newToDo);
        });

        app.MapPut("/todos/{id}", async (int id, Todo updatedTodo, IValidator<Todo> validator
            ) =>
        {
            var result = await validator.ValidateAsync(updatedTodo);
            
            if (!result.IsValid)
            {
                var errors = result.Errors
                    .GroupBy(x => x.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );
                return Results.ValidationProblem(errors);
            }

            var todo = todos.FirstOrDefault(t => t.Id == id);
            if (todo is null) return Results.NotFound();

            todo.Description = updatedTodo.Description;
            todo.Title = updatedTodo.Title;
            todo.IsCompleted = updatedTodo.IsCompleted;

            return Results.Ok(todo);
        });

        app.MapDelete("/todos/{id}", (int id) =>
        {
            var todo = todos.FirstOrDefault(t => t.Id == id);
            if (todo is null) return Results.NotFound();

            todos.Remove(todo);
            return Results.NoContent();
        });
    }
}