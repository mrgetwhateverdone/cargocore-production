// This part of the code creates a robust workflow creation service that prevents crashes and handles all edge cases
// It implements the singleton pattern for consistent state management across the application

import { CreatedWorkflow, WorkflowStep } from '../utils/workflowStorage';

// This part of the code defines the interfaces for workflow creation with strict type safety
export interface SuggestedAction {
  label: string;
  type: 'send_notification' | 'create_workflow' | 'escalate_order' | 'restock_item' | 'notify_team' | 'review_carrier' | 'contact_supplier';
  context?: string;
  target?: string;
  values?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export type WorkflowSource = 'ai_insight' | 'anomaly_detection' | 'brand_analysis' | 'order_analysis' | 'manual';

// This part of the code defines the public interface for the workflow service
export interface IWorkflowCreationService {
  createWorkflowFromAction(action: any, source: string, sourceId: string, insightTitle?: string): CreatedWorkflow;
  getWorkflows(): CreatedWorkflow[];
  updateWorkflow(workflowId: string, updates: Partial<CreatedWorkflow>): boolean;
  deleteWorkflow(workflowId: string): boolean;
  getWorkflowStats(): { active: number; completedThisWeek: number; overdue: number; totalSaved: number };
}

// This part of the code implements the main workflow creation service with comprehensive error handling
class WorkflowCreationService implements IWorkflowCreationService {
  private workflows: CreatedWorkflow[] = [];
  private readonly STORAGE_KEY = 'cargocore_workflows';
  private initialized = false;

  constructor() {
    // This part of the code defers initialization to prevent import-time crashes
    // Initialization happens on first use instead of construction
  }

  // This part of the code ensures safe initialization on first access
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.loadWorkflows();
      this.initialized = true;
    }
  }

  // This part of the code safely loads workflows from localStorage with proper environment checks
  private loadWorkflows(): void {
    try {
      // Environment check prevents SSR issues
      if (typeof window === 'undefined' || !('localStorage' in window)) {
        console.warn('localStorage not available, workflows will not persist');
        this.workflows = [];
        return;
      }

      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.workflows = Array.isArray(parsed) ? parsed.map((w: any) => ({
          ...w,
          createdAt: typeof w.createdAt === 'string' ? w.createdAt : new Date().toISOString(),
          steps: Array.isArray(w.steps) ? w.steps : []
        })) : [];
      } else {
        this.workflows = [];
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      this.workflows = []; // Initialize empty array, don't crash
    }
  }

  // This part of the code safely saves workflows to localStorage with graceful degradation
  private saveWorkflows(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.workflows));
      }
    } catch (error) {
      console.error('Failed to save workflows:', error);
      // Don't throw - graceful degradation
    }
  }

  // This part of the code validates suggested actions to prevent runtime errors
  private validateSuggestedAction(action: any): SuggestedAction {
    const validTypes = ['send_notification', 'create_workflow', 'escalate_order', 'restock_item', 'notify_team', 'review_carrier', 'contact_supplier'];
    
    if (!action || typeof action !== 'object') {
      throw new Error('Action must be an object');
    }
    
    if (!action.label || typeof action.label !== 'string') {
      throw new Error('Action label is required and must be a string');
    }
    
    if (!validTypes.includes(action.type)) {
      // Default to create_workflow instead of throwing
      action.type = 'create_workflow';
    }
    
    return action as SuggestedAction;
  }

  // This part of the code validates workflow sources with fallback values
  private validateSource(source: string): WorkflowSource {
    const validSources: WorkflowSource[] = ['ai_insight', 'anomaly_detection', 'brand_analysis', 'order_analysis', 'manual'];
    return validSources.includes(source as WorkflowSource) ? source as WorkflowSource : 'manual';
  }

  // This part of the code generates professional workflow step templates based on action type
  private generateWorkflowSteps(action: SuggestedAction): WorkflowStep[] {
    const stepTemplates: Record<string, Omit<WorkflowStep, 'id' | 'completed'>[]> = {
      create_workflow: [
        { title: 'Review Items', type: 'create_workflow' },
        { title: 'Prioritize Actions', type: 'create_workflow' },
        { title: 'Execute Actions', type: 'create_workflow' },
        { title: 'Verify Completion', type: 'create_workflow' }
      ],
      send_notification: [
        { title: 'Identify Recipients', type: 'send_notification' },
        { title: 'Compose Message', type: 'send_notification' },
        { title: 'Send Notification', type: 'send_notification' },
        { title: 'Confirm Receipt', type: 'send_notification' }
      ],
      escalate_order: [
        { title: 'Document Issue', type: 'escalate_order' },
        { title: 'Notify Management', type: 'escalate_order' },
        { title: 'Coordinate Resolution', type: 'escalate_order' },
        { title: 'Update Customer', type: 'escalate_order' }
      ],
      restock_item: [
        { title: 'Check Current Levels', type: 'restock_item' },
        { title: 'Contact Supplier', type: 'restock_item' },
        { title: 'Place Order', type: 'restock_item' },
        { title: 'Track Delivery', type: 'restock_item' }
      ],
      notify_team: [
        { title: 'Prepare Notification', type: 'notify_team' },
        { title: 'Send to Team', type: 'notify_team' },
        { title: 'Confirm Acknowledgment', type: 'notify_team' }
      ],
      review_carrier: [
        { title: 'Gather Performance Data', type: 'review_carrier' },
        { title: 'Analyze Metrics', type: 'review_carrier' },
        { title: 'Document Findings', type: 'review_carrier' },
        { title: 'Recommend Actions', type: 'review_carrier' }
      ],
      contact_supplier: [
        { title: 'Prepare Contact Information', type: 'contact_supplier' },
        { title: 'Initiate Contact', type: 'contact_supplier' },
        { title: 'Discuss Requirements', type: 'contact_supplier' },
        { title: 'Follow Up', type: 'contact_supplier' }
      ]
    };

    const template = stepTemplates[action.type] || [
      { title: action.label || 'Execute Action', type: action.type },
      { title: 'Verify Completion', type: action.type }
    ];

    return template.map((step, index) => ({
      id: `step_${Date.now()}_${index}`,
      title: step.title,
      completed: false,
      type: step.type
    }));
  }

  // This part of the code generates appropriate workflow titles based on action context
  private generateWorkflowTitle(action: SuggestedAction, insightTitle?: string): string {
    if (insightTitle && insightTitle.trim()) {
      return `${action.label} - ${insightTitle}`;
    }
    return action.label || 'New Workflow';
  }

  // This part of the code generates detailed workflow descriptions
  private generateWorkflowDescription(action: SuggestedAction, insightTitle?: string): string {
    const baseDescription = action.context || action.label || 'Workflow created from AI suggestion';
    if (insightTitle && insightTitle.trim()) {
      return `${baseDescription}\n\nBased on insight: ${insightTitle}`;
    }
    return baseDescription;
  }

  // This part of the code infers workflow priority from action type and context
  private inferPriorityFromAction(action: SuggestedAction): CreatedWorkflow['priority'] {
    if (action.priority) {
      return action.priority;
    }

    // Infer priority based on action type
    const highPriorityTypes = ['escalate_order', 'send_notification'];
    const mediumPriorityTypes = ['restock_item', 'notify_team'];
    
    if (highPriorityTypes.includes(action.type)) {
      return 'high';
    } else if (mediumPriorityTypes.includes(action.type)) {
      return 'medium';
    }
    return 'low';
  }

  // This part of the code estimates workflow completion time based on step complexity
  private estimateWorkflowTime(action: SuggestedAction): string {
    const timeEstimates: Record<string, number> = {
      send_notification: 10,
      notify_team: 15,
      contact_supplier: 30,
      restock_item: 45,
      review_carrier: 60,
      escalate_order: 90,
      create_workflow: 30
    };

    const minutes = timeEstimates[action.type] || 30;
    return minutes < 60 ? `${minutes} minutes` : `${Math.round(minutes / 60)} hour${minutes >= 120 ? 's' : ''}`;
  }

  // This part of the code generates relevant tags for workflow categorization
  private generateWorkflowTags(action: SuggestedAction, source: WorkflowSource): string[] {
    const tags = [source.replace('_', ' ')];
    
    // Add action-specific tags
    if (action.type === 'escalate_order') tags.push('urgent');
    if (action.type === 'restock_item') tags.push('inventory');
    if (action.type === 'review_carrier') tags.push('analysis');
    if (action.context && action.context.toLowerCase().includes('critical')) tags.push('critical');
    
    return tags;
  }

  // This part of the code creates a complete workflow from an action with full error handling
  public createWorkflowFromAction(
    action: any,
    source: string,
    sourceId: string,
    insightTitle?: string
  ): CreatedWorkflow {
    this.ensureInitialized(); // Ensure service is initialized before use
    
    try {
      // Validate all inputs
      const validatedAction = this.validateSuggestedAction(action);
      const validatedSource = this.validateSource(source);
      
      // Generate unique workflow ID
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create complete workflow object
      const workflow: CreatedWorkflow = {
        id: workflowId,
        title: this.generateWorkflowTitle(validatedAction, insightTitle),
        description: this.generateWorkflowDescription(validatedAction, insightTitle),
        priority: this.inferPriorityFromAction(validatedAction),
        status: 'todo',
        source: 'ai_insight', // Map to our existing enum
        sourceId: sourceId || `${validatedSource}_${Date.now()}`,
        steps: this.generateWorkflowSteps(validatedAction),
        estimatedTime: this.estimateWorkflowTime(validatedAction),
        tags: this.generateWorkflowTags(validatedAction, validatedSource),
        createdAt: new Date().toISOString(),
        dollarImpact: 0 // Default value, can be enhanced later
      };

      // Add to workflows and save
      this.workflows.push(workflow);
      this.saveWorkflows();

      console.log('✅ Workflow created successfully:', workflow.id);
      return workflow;
      
    } catch (error) {
      console.error('❌ Failed to create workflow:', error);
      throw new Error(`Workflow creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // This part of the code provides safe access to all workflows
  public getWorkflows(): CreatedWorkflow[] {
    this.ensureInitialized(); // Ensure service is initialized before use
    return [...this.workflows]; // Return copy to prevent mutation
  }

  // This part of the code updates workflow status safely
  public updateWorkflow(workflowId: string, updates: Partial<CreatedWorkflow>): boolean {
    this.ensureInitialized(); // Ensure service is initialized before use
    
    try {
      const index = this.workflows.findIndex(w => w.id === workflowId);
      if (index === -1) {
        console.warn('Workflow not found:', workflowId);
        return false;
      }

      this.workflows[index] = { ...this.workflows[index], ...updates };
      this.saveWorkflows();
      return true;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      return false;
    }
  }

  // This part of the code removes workflows safely
  public deleteWorkflow(workflowId: string): boolean {
    this.ensureInitialized(); // Ensure service is initialized before use
    
    try {
      const initialLength = this.workflows.length;
      this.workflows = this.workflows.filter(w => w.id !== workflowId);
      
      if (this.workflows.length < initialLength) {
        this.saveWorkflows();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      return false;
    }
  }

  // This part of the code calculates workflow statistics safely
  public getWorkflowStats() {
    this.ensureInitialized(); // Ensure service is initialized before use
    
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const active = this.workflows.filter(w => w.status !== 'completed').length;
      const completedThisWeek = this.workflows.filter(w => 
        w.status === 'completed' && new Date(w.createdAt) >= oneWeekAgo
      ).length;
      const overdue = this.workflows.filter(w => 
        w.status !== 'completed' && new Date(w.createdAt) < oneWeekAgo
      ).length;
      const totalSaved = this.workflows
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + (w.dollarImpact || 0), 0);

      return { active, completedThisWeek, overdue, totalSaved };
    } catch (error) {
      console.error('Failed to calculate stats:', error);
      return { active: 0, completedThisWeek: 0, overdue: 0, totalSaved: 0 };
    }
  }
}

// This part of the code creates a safe fallback service for error cases
class FallbackWorkflowService implements IWorkflowCreationService {
  createWorkflowFromAction(): CreatedWorkflow {
    throw new Error('WorkflowCreationService failed to initialize');
  }
  getWorkflows(): CreatedWorkflow[] {
    return [];
  }
  updateWorkflow(): boolean {
    return false;
  }
  deleteWorkflow(): boolean {
    return false;
  }
  getWorkflowStats() {
    return { active: 0, completedThisWeek: 0, overdue: 0, totalSaved: 0 };
  }
}

// This part of the code exports the singleton instance for consistent state across the application
// Wrapped in try-catch to prevent import-time crashes
let workflowCreationService: IWorkflowCreationService;

try {
  workflowCreationService = new WorkflowCreationService();
} catch (error) {
  console.error('Failed to initialize WorkflowCreationService:', error);
  workflowCreationService = new FallbackWorkflowService();
}

export { workflowCreationService };
