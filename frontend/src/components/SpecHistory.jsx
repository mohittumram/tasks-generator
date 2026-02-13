import { useEffect, useState } from 'react';
import { getSpecs } from '../services/api';

function SpecHistory({ onLoadSpec }) {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecs();
  }, []);

  const loadSpecs = async () => {
    try {
      setLoading(true);
      const data = await getSpecs();
      setSpecs(data);
    } catch (error) {
      console.error('Error loading specs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Specs</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (specs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Specs</h2>
        <p className="text-gray-500">No specs generated yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Specs</h2>
        <button
          onClick={loadSpecs}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {specs.map((spec) => (
          <div
            key={spec.id}
            className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            onClick={() => onLoadSpec(spec.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">{spec.goal}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(spec.created_at).toLocaleString()} • {spec.task_count} tasks
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpecHistory;
