from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Spec(Base):
    __tablename__ = "specs"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    users = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    template = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="spec", cascade="all, delete-orphan")
    groups = relationship("TaskGroup", back_populates="spec", cascade="all, delete-orphan")


class TaskGroup(Base):
    __tablename__ = "task_groups"

    id = Column(Integer, primary_key=True, index=True)
    spec_id = Column(Integer, ForeignKey("specs.id"), nullable=False)
    name = Column(String(200), nullable=False)
    order = Column(Integer, default=0)

    # Relationships
    spec = relationship("Spec", back_populates="groups")
    tasks = relationship("Task", back_populates="group")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    spec_id = Column(Integer, ForeignKey("specs.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("task_groups.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)  # 'user_story' or 'engineering'
    order = Column(Integer, default=0)

    # Relationships
    spec = relationship("Spec", back_populates="tasks")
    group = relationship("TaskGroup", back_populates="tasks")
