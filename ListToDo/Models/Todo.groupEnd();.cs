namespace ListToDo.Models;

public class Todo
{
    public int Id { get; set; }
    public required string Title { get; set; } // not null
    public required string Description { get; set; } // not null
    public bool IsCompleted { get; set; }
}