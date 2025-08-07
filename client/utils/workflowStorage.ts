// This part of the code manages workflow persistence using localStorage for Vercel deployment
// It provides simple utilities to store, retrieve, and manage workflows without backend dependencies

export interface WorkflowStep {
  id: string;
  title: string;
  completed: boolean;
  type: 'create_workflow' | 'send_notification' | 'escalate_order' | 'restock_item' | 'notify_team' | 'review_carrier' | 'contact_supplier';
}

export interface CreatedWorkflow {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'completed';
  source: 'ai_insight' | 'manual';
  sourceId: string;
  steps: WorkflowStep[];
  estimatedTime: string;
  tags: string[];
  createdAt: string;
  dollarImpact: number;
}

const STORAGE_KEY = 'cargocore_workflows';

// This part of the code maps insight severity levels to workflow priorities for proper classification
export const mapSeverityToPriority = (severity: 'critical' | 'warning' | 'info'): CreatedWorkflow['priority'] => {
  switch (severity) {
    case 'critical': return 'critical';
    case 'warning': return 'high';
    case 'info': return 'medium';
    default: return 'medium';
  }
};

// This part of the code determines workflow action types based on suggested action text using keyword detection
export const mapActionToType = (action: string): WorkflowStep['type'] => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('review') || actionLower.includes('analyze')) return 'review_carrier';
  if (actionLower.includes('restock') || actionLower.includes('inventory')) return 'restock_item';
  if (actionLower.includes('notify') || actionLower.includes('alert')) return 'notify_team';
  if (actionLower.includes('escalate') || actionLower.includes('management')) return 'escalate_order';
  if (actionLower.includes('contact') || actionLower.includes('supplier')) return 'contact_supplier';
  if (actionLower.includes('send') || actionLower.includes('message')) return 'send_notification';
  return 'create_workflow'; // default fallback
};

// This part of the code saves a new workflow to localStorage and maintains chronological order
export const saveWorkflow = (workflow: CreatedWorkflow): void => {
  try {
    const existing = getWorkflows();
    const updated = [workflow, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save workflow:', error);
  }
};

// This part of the code retrieves all workflows from localStorage with error handling
export const getWorkflows = (): CreatedWorkflow[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load workflows:', error);
    return [];
  }
};

// This part of the code updates an existing workflow's status or properties
export const updateWorkflow = (workflowId: string, updates: Partial<CreatedWorkflow>): void => {
  try {
    const workflows = getWorkflows();
    const updatedWorkflows = workflows.map(workflow => 
      workflow.id === workflowId ? { ...workflow, ...updates } : workflow
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkflows));
  } catch (error) {
    console.error('Failed to update workflow:', error);
  }
};

// This part of the code removes a workflow from storage completely
export const deleteWorkflow = (workflowId: string): void => {
  try {
    const workflows = getWorkflows();
    const filtered = workflows.filter(workflow => workflow.id !== workflowId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete workflow:', error);
  }
};

// This part of the code creates a workflow from an insight with proper structure and metadata
export const createWorkflowFromInsight = (insight: {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  suggestedActions: string[];
  dollarImpact?: number;
  source: string;
}): CreatedWorkflow => {
  const steps: WorkflowStep[] = insight.suggestedActions.map((action, index) => ({
    id: `step_${Date.now()}_${index}`,
    title: action,
    completed: false,
    type: mapActionToType(action)
  }));

  return {
    id: `workflow_${Date.now()}`,
    title: insight.title,
    description: insight.description,
    priority: mapSeverityToPriority(insight.severity),
    status: 'todo',
    source: 'ai_insight',
    sourceId: insight.id,
    steps,
    estimatedTime: `${steps.length * 15} minutes`, // 15 minutes per step estimate
    tags: [insight.source.replace('_', ' '), insight.severity],
    createdAt: new Date().toISOString(),
    dollarImpact: insight.dollarImpact || 0
  };
};

// This part of the code calculates workflow statistics for KPI displays
export const calculateWorkflowStats = (workflows: CreatedWorkflow[]) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const active = workflows.filter(w => w.status !== 'completed').length;
  const completedThisWeek = workflows.filter(w => 
    w.status === 'completed' && new Date(w.createdAt) >= oneWeekAgo
  ).length;
  const overdue = workflows.filter(w => 
    w.status !== 'completed' && new Date(w.createdAt) < oneWeekAgo
  ).length;
  const totalSaved = workflows
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.dollarImpact, 0);

  return {
    active,
    completedThisWeek,
    overdue,
    totalSaved
  };
};
