// This part of the code provides simplified React hooks that use the WorkflowCreationService
// It provides a clean interface between React components and the workflow service layer

import { useState, useEffect, useCallback } from 'react';
import { workflowCreationService } from '../services/workflowCreationService';
import { CreatedWorkflow } from '../utils/workflowStorage';

// This part of the code manages all workflow state and provides automatic refresh on navigation and focus changes
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<CreatedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  // This part of the code loads workflows from the service with error handling
  const loadWorkflows = useCallback(() => {
    try {
      const storedWorkflows = workflowCreationService.getWorkflows();
      setWorkflows(storedWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // This part of the code sets up automatic refresh listeners for cross-tab updates and navigation changes
  useEffect(() => {
    loadWorkflows(); // Initial load

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cargocore_workflows') {
        loadWorkflows();
      }
    };

    // Listen for window focus to refresh when user navigates back
    const handleWindowFocus = () => {
      loadWorkflows();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadWorkflows]);

  // This part of the code updates workflow status using the service
  const updateWorkflowStatus = useCallback((workflowId: string, updates: Partial<CreatedWorkflow>) => {
    try {
      const success = workflowCreationService.updateWorkflow(workflowId, updates);
      if (success) {
        loadWorkflows(); // Refresh from service
      }
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  }, [loadWorkflows]);

  // This part of the code removes a workflow using the service
  const removeWorkflow = useCallback((workflowId: string) => {
    try {
      const success = workflowCreationService.deleteWorkflow(workflowId);
      if (success) {
        loadWorkflows(); // Refresh from service
      }
    } catch (error) {
      console.error('Failed to remove workflow:', error);
    }
  }, [loadWorkflows]);

  // This part of the code calculates real-time statistics using the service
  const stats = workflowCreationService.getWorkflowStats();

  // This part of the code filters workflows by status for tab display
  const workflowsByStatus = {
    todo: workflows.filter(w => w.status === 'todo'),
    inProgress: workflows.filter(w => w.status === 'in_progress'),
    completed: workflows.filter(w => w.status === 'completed')
  };

  return {
    workflows,
    loading,
    stats,
    workflowsByStatus,
    updateWorkflowStatus,
    removeWorkflow,
    refreshWorkflows: loadWorkflows
  };
};

// This part of the code provides a simple hook for workflow creation using the service
export const useWorkflowCreation = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkflow = useCallback(async (insightData: {
    id?: string;
    title?: string;
    description?: string;
    severity?: 'critical' | 'warning' | 'info';
    suggestedActions?: string[];
    dollarImpact?: number;
    source?: string;
  }) => {
    setCreating(true);
    setError(null);

    try {
      // This part of the code creates a suggested action from insight data
      const priority = insightData.severity === 'critical' ? 'critical' : 
                      insightData.severity === 'warning' ? 'high' : 'medium';
      
      const suggestedAction = {
        label: insightData.title || 'AI Generated Action',
        type: 'create_workflow' as const,
        context: insightData.description,
        priority: priority as 'low' | 'medium' | 'high' | 'critical'
      };

      const workflow = workflowCreationService.createWorkflowFromAction(
        suggestedAction,
        'ai_insight',
        insightData.id || `insight_${Date.now()}`,
        insightData.title
      );

      // Dispatch custom event for toast notification
      window.dispatchEvent(new CustomEvent('workflowCreated', { 
        detail: { workflow, insightTitle: insightData.title || 'Workflow' } 
      }));

      return workflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to create workflow:', err);
      throw new Error(`Unable to create workflow: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    createWorkflow,
    creating,
    error
  };
};
