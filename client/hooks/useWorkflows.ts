// This part of the code provides React hooks for workflow state management with automatic refresh capabilities
// It handles localStorage persistence, cross-tab synchronization, and real-time updates for Vercel deployment

import { useState, useEffect, useCallback } from 'react';
import { 
  CreatedWorkflow, 
  getWorkflows, 
  saveWorkflow, 
  updateWorkflow, 
  deleteWorkflow,
  calculateWorkflowStats,
  createWorkflowFromInsight
} from '../utils/workflowStorage';

// This part of the code manages all workflow state and provides automatic refresh on navigation and focus changes
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<CreatedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  // This part of the code loads workflows from localStorage with error handling
  const loadWorkflows = useCallback(() => {
    try {
      const storedWorkflows = getWorkflows();
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

  // This part of the code creates a new workflow and immediately updates the local state
  const addWorkflow = useCallback((workflow: CreatedWorkflow) => {
    saveWorkflow(workflow);
    setWorkflows(prev => [workflow, ...prev]);
  }, []);

  // This part of the code updates an existing workflow and refreshes the state
  const updateWorkflowStatus = useCallback((workflowId: string, updates: Partial<CreatedWorkflow>) => {
    updateWorkflow(workflowId, updates);
    setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, ...updates } : w));
  }, []);

  // This part of the code removes a workflow and updates the state immediately
  const removeWorkflow = useCallback((workflowId: string) => {
    deleteWorkflow(workflowId);
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  }, []);

  // This part of the code creates a workflow from an insight and adds it to the state
  const createFromInsight = useCallback((insight: {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    suggestedActions: string[];
    dollarImpact?: number;
    source: string;
  }) => {
    const workflow = createWorkflowFromInsight(insight);
    addWorkflow(workflow);
    return workflow;
  }, [addWorkflow]);

  // This part of the code calculates real-time statistics from current workflows
  const stats = calculateWorkflowStats(workflows);

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
    addWorkflow,
    updateWorkflowStatus,
    removeWorkflow,
    createFromInsight,
    refreshWorkflows: loadWorkflows
  };
};

// This part of the code provides a simple hook for workflow creation with toast notifications
export const useWorkflowCreation = () => {
  const { createFromInsight } = useWorkflows();
  const [creating, setCreating] = useState(false);

  const createWorkflow = useCallback(async (insight: Parameters<typeof createFromInsight>[0]) => {
    setCreating(true);
    try {
      // This part of the code validates insight data before creating workflow
      if (!insight || typeof insight !== 'object') {
        throw new Error('Invalid insight data provided');
      }
      
      const workflow = createFromInsight(insight);
      
      // Dispatch custom event for toast notification
      window.dispatchEvent(new CustomEvent('workflowCreated', { 
        detail: { workflow, insightTitle: insight.title || 'Workflow' } 
      }));
      
      return workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      // Re-throw with more user-friendly message
      throw new Error(`Unable to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  }, [createFromInsight]);

  return {
    createWorkflow,
    creating
  };
};
