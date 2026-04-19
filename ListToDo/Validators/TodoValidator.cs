using FluentValidation;
using ListToDo.Models;

namespace ListToDo.Validators;

public class TodoValidator : AbstractValidator<Todo>
{
    public TodoValidator()
    {
        RuleFor(x =>x.Title)
            .NotEmpty().WithMessage("العنوان مطلوب")
            .MinimumLength(3).WithMessage("العنوان لازم يكون 3 حروف على الأقل")
            .MaximumLength(100).WithMessage("العنوان ما يتجاوز 100 حرف");
        
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("الوصف مطلوب")
            .MinimumLength(5).WithMessage("الوصف لازم يكون 5 حروف على الأقل")
            .MaximumLength(500).WithMessage("الوصف ما يتجاوز 500 حرف");
    }
}