def format_tasks_for_export(tasks, groups=None):
    """Format tasks for markdown/text export"""
    output = []
    
    if groups:
        # Group tasks by group
        for group in sorted(groups, key=lambda g: g.order):
            output.append(f"## {group.name}\n")
            group_tasks = [t for t in tasks if t.group_id == group.id]
            for task in sorted(group_tasks, key=lambda t: t.order):
                output.append(f"- **{task.title}**")
                if task.description:
                    output.append(f"  - {task.description}")
                output.append("")
    else:
        # Ungrouped tasks
        user_stories = [t for t in tasks if t.type == "user_story"]
        engineering_tasks = [t for t in tasks if t.type == "engineering"]
        
        if user_stories:
            output.append("## User Stories\n")
            for task in sorted(user_stories, key=lambda t: t.order):
                output.append(f"- **{task.title}**")
                if task.description:
                    output.append(f"  - {task.description}")
                output.append("")
        
        if engineering_tasks:
            output.append("## Engineering Tasks\n")
            for task in sorted(engineering_tasks, key=lambda t: t.order):
                output.append(f"- **{task.title}**")
                if task.description:
                    output.append(f"  - {task.description}")
                output.append("")
    
    return "\n".join(output)
