// This part of the code creates a minimal test component to isolate workflow creation issues
// It bypasses all complex logic to test the core functionality

import React, { useState } from 'react';

export function MinimalWorkflowTest() {
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState<string | null>(null);

  const testBasicWorkflow = () => {
    setStatus('testing');
    setError(null);
    
    try {
      // This part of the code tests basic JavaScript functionality first
      const testData = {
        id: 'test-123',
        title: 'Test Workflow',
        timestamp: Date.now(),
        random: Math.random()
      };
      
      console.log('Basic test data:', testData);
      
      // This part of the code tests localStorage safely
      const testKey = 'test_workflow_key';
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        console.log('localStorage test successful:', parsed);
        setStatus('success');
      } else {
        throw new Error('localStorage test failed');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      console.error('Minimal test failed:', err);
    }
  };

  const testServiceImport = async () => {
    setStatus('testing-service');
    setError(null);
    
    try {
      // This part of the code tests if the service can be imported without crashing
      const { workflowCreationService } = await import('../services/workflowCreationService');
      console.log('Service imported successfully:', typeof workflowCreationService);
      
      // Test basic service method
      const stats = workflowCreationService.getWorkflowStats();
      console.log('Service stats:', stats);
      
      setStatus('service-success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('service-error');
      console.error('Service test failed:', err);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold text-lg mb-4">Workflow Debug Test</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testBasicWorkflow}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Basic Functionality
        </button>
        
        <button 
          onClick={testServiceImport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Service Import
        </button>
      </div>
      
      <div className="text-sm">
        <p><strong>Status:</strong> {status}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Environment: {typeof window !== 'undefined' ? 'Browser' : 'SSR'}</p>
        <p>localStorage: {typeof localStorage !== 'undefined' ? 'Available' : 'Not Available'}</p>
      </div>
    </div>
  );
}
