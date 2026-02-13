import { useState } from 'react';

const TEMPLATES = {
  '': 'None',
  'mobile': 'Mobile App',
  'web': 'Web App',
  'internal': 'Internal Tool'
};

function TaskForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    goal: '',
    users: '',
    constraints: '',
    risks: '',
    template: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.goal.trim() || !formData.users.trim()) {
      alert('Goal and users are required');
      return;
    }
    if (formData.goal.trim().length < 10) {
      alert('Goal must be at least 10 characters');
      return;
    }
    if (formData.users.trim().length < 5) {
      alert('Users description must be at least 5 characters');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const applyTemplate = (template) => {
    setFormData({ ...formData, template });
    const templateConstraints = {
      mobile: 'Mobile-first design, iOS and Android support, offline capability',
      web: 'Responsive design, cross-browser compatibility, SEO optimization',
      internal: 'Internal use only, admin authentication, data privacy'
    };
    if (template && templateConstraints[template]) {
      setFormData({
        ...formData,
        template,
        constraints: formData.constraints 
          ? `${formData.constraints}\n${templateConstraints[template]}`
          : templateConstraints[template]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Specification</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Goal *
        </label>
        <textarea
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the feature goal..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Users *
        </label>
        <textarea
          name="users"
          value={formData.users}
          onChange={handleChange}
          required
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Who will use this feature?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template
        </label>
        <div className="flex gap-2 mb-2">
          {Object.entries(TEMPLATES).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => applyTemplate(value)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                formData.template === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Constraints (optional)
        </label>
        <textarea
          name="constraints"
          value={formData.constraints}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Technical constraints, deadlines, resources..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risks & Unknowns (optional)
        </label>
        <textarea
          name="risks"
          value={formData.risks}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Potential risks, unknowns, dependencies..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Generating Tasks...' : 'Generate Tasks'}
      </button>
    </form>
  );
}

export default TaskForm;
