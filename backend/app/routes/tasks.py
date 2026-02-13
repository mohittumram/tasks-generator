from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Spec, Task, TaskGroup
from ..schemas import (
    GenerateRequest, SpecResponse, SpecSummary, TaskResponse,
    TasksUpdateRequest, TaskGroupResponse
)
from ..llm_service import LLMService
from ..utils import format_tasks_for_export

router = APIRouter()


@router.post("/generate", response_model=SpecResponse)
async def generate_tasks(request: GenerateRequest, db: Session = Depends(get_db)):
    """Generate tasks from feature specification"""
    try:
        # Validate input
        if not request.goal or not request.users:
            raise HTTPException(status_code=400, detail="Goal and users are required")
        
        # Generate tasks using LLM
        llm_service = LLMService()
        llm_result = llm_service.generate_tasks(
            goal=request.goal,
            users=request.users,
            constraints=request.constraints,
            risks=request.risks,
            template=request.template
        )
        
        # Create spec
        spec = Spec(
            goal=request.goal,
            users=request.users,
            constraints=request.constraints,
            risks=request.risks,
            template=request.template
        )
        db.add(spec)
        db.flush()  # Get the spec ID
        
        # Create task groups
        group_map = {}
        if "groups" in llm_result:
            for idx, group_data in enumerate(llm_result["groups"]):
                group = TaskGroup(
                    spec_id=spec.id,
                    name=group_data.get("name", f"Group {idx + 1}"),
                    order=idx
                )
                db.add(group)
                db.flush()
                group_map[group_data.get("name", f"Group {idx + 1}")] = group.id
        
        # Create tasks
        task_order = 0
        
        # Add user stories
        if "user_stories" in llm_result:
            for story in llm_result["user_stories"]:
                task = Task(
                    spec_id=spec.id,
                    title=story.get("title", ""),
                    description=story.get("description"),
                    type="user_story",
                    order=task_order,
                    group_id=None
                )
                # Assign to group if specified
                if "groups" in llm_result:
                    for group_data in llm_result["groups"]:
                        if story.get("title") in group_data.get("tasks", []):
                            task.group_id = group_map.get(group_data.get("name"))
                            break
                
                db.add(task)
                task_order += 1
        
        # Add engineering tasks
        if "engineering_tasks" in llm_result:
            for eng_task in llm_result["engineering_tasks"]:
                task = Task(
                    spec_id=spec.id,
                    title=eng_task.get("title", ""),
                    description=eng_task.get("description"),
                    type="engineering",
                    order=task_order,
                    group_id=None
                )
                # Assign to group if specified
                if "groups" in llm_result:
                    for group_data in llm_result["groups"]:
                        if eng_task.get("title") in group_data.get("tasks", []):
                            task.group_id = group_map.get(group_data.get("name"))
                            break
                
                db.add(task)
                task_order += 1
        
        db.commit()
        db.refresh(spec)
        
        return spec
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"LLM service unavailable: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating tasks: {str(e)}")


@router.get("/specs", response_model=List[SpecSummary])
async def get_specs(db: Session = Depends(get_db)):
    """Get last 5 specs"""
    specs = db.query(Spec).order_by(Spec.created_at.desc()).limit(5).all()
    
    result = []
    for spec in specs:
        task_count = db.query(Task).filter(Task.spec_id == spec.id).count()
        result.append(SpecSummary(
            id=spec.id,
            goal=spec.goal,
            created_at=spec.created_at,
            task_count=task_count
        ))
    
    return result


@router.get("/specs/{spec_id}", response_model=SpecResponse)
async def get_spec(spec_id: int, db: Session = Depends(get_db)):
    """Get specific spec with tasks"""
    spec = db.query(Spec).filter(Spec.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Spec not found")
    return spec


@router.put("/specs/{spec_id}/tasks", response_model=SpecResponse)
async def update_tasks(spec_id: int, request: TasksUpdateRequest, db: Session = Depends(get_db)):
    """Update tasks (reorder, edit, group)"""
    spec = db.query(Spec).filter(Spec.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Spec not found")
    
    try:
        # Update existing tasks
        for task_update in request.tasks:
            task = db.query(Task).filter(Task.id == task_update.id).first()
            if task and task.spec_id == spec_id:
                if task_update.title is not None:
                    task.title = task_update.title
                if task_update.description is not None:
                    task.description = task_update.description
                if task_update.order is not None:
                    task.order = task_update.order
                if task_update.group_id is not None:
                    # Validate group belongs to this spec
                    if task_update.group_id:
                        group = db.query(TaskGroup).filter(
                            TaskGroup.id == task_update.group_id,
                            TaskGroup.spec_id == spec_id
                        ).first()
                        if not group:
                            raise HTTPException(status_code=400, detail=f"Group {task_update.group_id} not found")
                    task.group_id = task_update.group_id
        
        # Create new groups if provided
        if request.groups:
            for idx, group_data in enumerate(request.groups):
                existing_group = db.query(TaskGroup).filter(
                    TaskGroup.spec_id == spec_id,
                    TaskGroup.name == group_data.name
                ).first()
                
                if not existing_group:
                    group = TaskGroup(
                        spec_id=spec_id,
                        name=group_data.name,
                        order=group_data.order if hasattr(group_data, 'order') else idx
                    )
                    db.add(group)
        
        db.commit()
        db.refresh(spec)
        return spec
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating tasks: {str(e)}")


@router.get("/specs/{spec_id}/export")
async def export_spec(spec_id: int, db: Session = Depends(get_db)):
    """Export spec as markdown text"""
    spec = db.query(Spec).filter(Spec.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Spec not found")
    
    tasks = db.query(Task).filter(Task.spec_id == spec_id).order_by(Task.order).all()
    groups = db.query(TaskGroup).filter(TaskGroup.spec_id == spec_id).order_by(TaskGroup.order).all()
    
    # Build export content
    export_lines = [f"# {spec.goal}\n"]
    export_lines.append(f"**Target Users:** {spec.users}\n")
    
    if spec.constraints:
        export_lines.append(f"**Constraints:** {spec.constraints}\n")
    
    if spec.risks:
        export_lines.append(f"**Risks:** {spec.risks}\n")
    
    export_lines.append("\n---\n\n")
    export_lines.append(format_tasks_for_export(tasks, groups if groups else None))
    
    return {"content": "\n".join(export_lines)}
