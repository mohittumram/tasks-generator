import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';

function Status() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Failed to load health status');
      setHealth({
        backend: false,
        database: false,
        llm: { connected: false, error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === true || (typeof status === 'object' && status.connected)) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status) => {
    if (status === true || (typeof status === 'object' && status.connected)) {
      return '✓';
    }
    return '✗';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-gray-600">Health check for backend, database, and LLM connection</p>
      </div>

      {loading && !health && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Loading status...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {health && (
        <div className="space-y-4">
          {/* Backend Status */}
          <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${getStatusColor(health.backend)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Backend</h2>
                <p className="text-sm opacity-75">
                  {health.backend ? 'API server is running' : 'API server is not responding'}
                </p>
              </div>
              <div className="text-3xl font-bold">
                {getStatusIcon(health.backend)}
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${getStatusColor(health.database)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Database</h2>
                <p className="text-sm opacity-75">
                  {health.database 
                    ? 'Database connection is active' 
                    : `Database connection failed${health.database_error ? `: ${health.database_error}` : ''}`}
                </p>
              </div>
              <div className="text-3xl font-bold">
                {getStatusIcon(health.database)}
              </div>
            </div>
          </div>

          {/* LLM Status */}
          <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${getStatusColor(health.llm)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">LLM Connection</h2>
                <p className="text-sm opacity-75">
                  {health.llm.connected 
                    ? `Connected to ${health.llm.provider || 'LLM service'}` 
                    : `LLM connection failed${health.llm.error ? `: ${health.llm.error}` : ''}`}
                </p>
                {health.llm.provider && (
                  <p className="text-xs mt-1 opacity-60">
                    Provider: {health.llm.provider}
                  </p>
                )}
              </div>
              <div className="text-3xl font-bold">
                {getStatusIcon(health.llm)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={loadHealth}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Status;
