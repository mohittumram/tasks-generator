from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # 'user_story' or 'engineering'
    order: int = 0


class TaskCreate(TaskBase):
    group_id: Optional[int] = None


class TaskUpdate(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    group_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    spec_id: int
    group_id: Optional[int] = None

    class Config:
        from_attributes = True


class TaskGroupBase(BaseModel):
    name: str
    order: int = 0


class TaskGroupCreate(TaskGroupBase):
    pass


class TaskGroupResponse(TaskGroupBase):
    id: int
    spec_id: int
    tasks: List[TaskResponse] = []

    class Config:
        from_attributes = True


class SpecBase(BaseModel):
    goal: str
    users: str
    constraints: Optional[str] = None
    risks: Optional[str] = None
    template: Optional[str] = None


class SpecCreate(SpecBase):
    pass


class SpecResponse(SpecBase):
    id: int
    created_at: datetime
    tasks: List[TaskResponse] = []
    groups: List[TaskGroupResponse] = []

    class Config:
        from_attributes = True


class SpecSummary(BaseModel):
    id: int
    goal: str
    created_at: datetime
    task_count: int = 0

    class Config:
        from_attributes = True


class GenerateRequest(BaseModel):
    goal: str
    users: str
    constraints: Optional[str] = None
    risks: Optional[str] = None
    template: Optional[str] = None


class TasksUpdateRequest(BaseModel):
    tasks: List[TaskUpdate]
    groups: Optional[List[TaskGroupCreate]] = None
