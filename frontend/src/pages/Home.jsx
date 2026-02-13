import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import SpecHistory from '../components/SpecHistory';
import { generateTasks, getSpec, updateTasks, exportSpec } from '../services/api';

function Home() {
  const [currentSpec, setCurrentSpec] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleGenerate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate input
      if (!formData.goal || !formData.goal.trim()) {
        setError('Goal is required');
        setLoading(false);
        return;
      }
      if (!formData.users || !formData.users.trim()) {
        setError('Target users are required');
        setLoading(false);
        return;
      }
      
      const spec = await generateTasks(formData);
      setCurrentSpec(spec);
      setTasks(spec.tasks || []);
      setGroups(spec.groups || []);
      setSuccess('Tasks generated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate tasks';
      setError(errorMessage);
      if (err.response?.status === 503) {
        setError('LLM service is currently unavailable. Please try again later.');
      } else if (err.response?.status === 400) {
        setError(`Invalid input: ${errorMessage}`);
      } else if (!err.response) {
        setError('Network error: Could not connect to server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSpec = async (specId) => {
    try {
      setLoading(true);
      setError(null);
      if (!specId) {
        setError('Invalid spec ID');
        setLoading(false);
        return;
      }
      const spec = await getSpec(specId);
      setCurrentSpec(spec);
      setTasks(spec.tasks || []);
      setGroups(spec.groups || []);
      setSuccess('Spec loaded successfully!');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Spec not found');
      } else if (!err.response) {
        setError('Network error: Could not connect to server');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load spec');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates, groupAction = null) => {
    if (!currentSpec) return;

    try {
      if (groupAction && groupAction.createGroup) {
        // Create new group via API
        const updatedSpec = await updateTasks(currentSpec.id, {
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            order: t.order,
            group_id: t.group_id
          })),
          groups: [...groups.map(g => ({ name: g.name, order: g.order })), 
                   { name: groupAction.createGroup, order: groups.length }]
        });
        setCurrentSpec(updatedSpec);
        setTasks(updatedSpec.tasks || []);
        setGroups(updatedSpec.groups || []);
        return;
      }

      // Update task locally first for immediate feedback
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      );
      setTasks(updatedTasks);

      // Then sync with backend
      const taskUpdates = updatedTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || null,
        order: t.order,
        group_id: t.group_id || null
      }));

      const updatedSpec = await updateTasks(currentSpec.id, {
        tasks: taskUpdates,
        groups: groups ? groups.map(g => ({ name: g.name, order: g.order })) : []
      });

      setCurrentSpec(updatedSpec);
      setTasks(updatedSpec.tasks || []);
      setGroups(updatedSpec.groups || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update task');
      // Reload to get correct state
      if (currentSpec) {
        handleLoadSpec(currentSpec.id);
      }
    }
  };

  const handleExport = async (format = 'copy') => {
    if (!currentSpec) {
      setError('No spec to export. Please generate or load a spec first.');
      return;
    }

    try {
      const exportData = await exportSpec(currentSpec.id);
      const content = exportData.content;

      if (!content || content.trim().length === 0) {
        setError('No content to export');
        return;
      }

      if (format === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(content);
          setSuccess('Copied to clipboard!');
        } else {
          // Fallback for browsers without clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = content;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setSuccess('Copied to clipboard!');
        }
      } else {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${currentSpec.id}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccess('Downloaded!');
      }
    } catch (err) {
      if (!err.response) {
        setError('Network error: Could not export. Please check your connection.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to export');
      }
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks Generator</h1>
        <p className="text-gray-600">Generate user stories and engineering tasks from feature specifications</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TaskForm onSubmit={handleGenerate} loading={loading} />
          
          {currentSpec && (
            <>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleExport('copy')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                >
                  Copy as Markdown
                </button>
                <button
                  onClick={() => handleExport('download')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Download Markdown
                </button>
              </div>
              <TaskList
                spec={currentSpec}
                tasks={tasks}
                groups={groups}
                onUpdate={handleTaskUpdate}
              />
            </>
          )}
        </div>

        <div>
          <SpecHistory onLoadSpec={handleLoadSpec} />
        </div>
      </div>
    </div>
  );
}

export default Home;
