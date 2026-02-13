import { useState } from 'react';

function TaskList({ spec, tasks, groups, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditData({ title: task.title, description: task.description || '' });
  };

  const handleSave = (taskId) => {
    onUpdate(taskId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleReorder = (taskId, newOrder) => {
    onUpdate(taskId, { order: newOrder });
  };

  const handleGroupCreate = () => {
    if (newGroupName.trim()) {
      // This would be handled by parent component
      onUpdate(null, null, { createGroup: newGroupName });
      setNewGroupName('');
      setShowGroupForm(false);
    }
  };

  const handleGroupAssign = (taskId, groupId) => {
    onUpdate(taskId, { group_id: groupId });
  };

  // Group tasks
  const groupedTasks = {};
  const ungroupedTasks = [];

  tasks.forEach(task => {
    if (task.group_id) {
      if (!groupedTasks[task.group_id]) {
        groupedTasks[task.group_id] = [];
      }
      groupedTasks[task.group_id].push(task);
    } else {
      ungroupedTasks.push(task);
    }
  });

  // Sort tasks by order
  Object.keys(groupedTasks).forEach(groupId => {
    groupedTasks[groupId].sort((a, b) => a.order - b.order);
  });
  ungroupedTasks.sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Generated Tasks</h2>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          {showGroupForm ? 'Cancel' : '+ New Group'}
        </button>
      </div>

      {showGroupForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleGroupCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      )}

      {/* Grouped tasks */}
      {groups && groups.length > 0 && Object.keys(groupedTasks).length > 0 && (
        <div className="space-y-6 mb-6">
          {groups.map(group => {
            const groupTasks = groupedTasks[group.id] || [];
            if (groupTasks.length === 0) return null;

            return (
              <div key={group.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                <div className="space-y-2">
                  {groupTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      editingId={editingId}
                      editData={editData}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onEditChange={setEditData}
                      groups={groups}
                      onGroupAssign={handleGroupAssign}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ungrouped tasks by type */}
      {ungroupedTasks.length > 0 && (
        <div className="space-y-4">
          {['user_story', 'engineering'].map(type => {
            const typeTasks = ungroupedTasks.filter(t => t.type === type);
            if (typeTasks.length === 0) return null;

            return (
              <div key={type}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {type.replace('_', ' ')}s
                </h3>
                <div className="space-y-2">
                  {typeTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      editingId={editingId}
                      editData={editData}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onEditChange={setEditData}
                      groups={groups}
                      onGroupAssign={handleGroupAssign}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-gray-500 text-center py-8">No tasks generated yet</p>
      )}
    </div>
  );
}

function TaskItem({ task, editingId, editData, onEdit, onSave, onCancel, onEditChange, groups, onGroupAssign }) {
  const isEditing = editingId === task.id;

  return (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => onEditChange({ ...editData, title: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          />
          <textarea
            value={editData.description}
            onChange={(e) => onEditChange({ ...editData, description: e.target.value })}
            rows={2}
            className="w-full px-2 py-1 border border-gray-300 rounded"
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(task.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {groups && groups.length > 0 && (
                <select
                  value={task.group_id || ''}
                  onChange={(e) => onGroupAssign(task.id, e.target.value ? parseInt(e.target.value) : null)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="">No group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => onEdit(task)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
