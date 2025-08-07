// This part of the code creates toast notifications for workflow creation with navigation links to the workflows page
// It provides success feedback and automatic workflow page navigation with 5-second auto-dismiss functionality

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowToastProps {
  workflowTitle: string;
  onDismiss?: () => void;
}

// This part of the code creates the custom toast content with navigation functionality
export function WorkflowToastContent({ workflowTitle, onDismiss }: WorkflowToastProps) {
  const navigate = useNavigate();

  // This part of the code handles navigation to workflows page when toast is clicked
  const handleNavigateToWorkflows = () => {
    navigate('/workflows');
    onDismiss?.();
  };

  return (
    <div 
      onClick={handleNavigateToWorkflows}
      className="flex items-center space-x-3 cursor-pointer hover:bg-green-100 p-2 rounded transition-colors"
    >
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-900">
          ✓ Workflow created successfully!
        </p>
        <p className="text-xs text-green-700 truncate">
          "{workflowTitle}" added to workflows
        </p>
      </div>
      <div className="flex items-center text-green-600">
        <span className="text-xs font-medium mr-1">View Workflows</span>
        <ExternalLink className="h-4 w-4" />
      </div>
    </div>
  );
}

// This part of the code provides a utility function to show workflow creation toasts with automatic setup
export const showWorkflowCreatedToast = (workflowTitle: string) => {
  toast.custom(
    (t) => (
      <WorkflowToastContent 
        workflowTitle={workflowTitle} 
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    {
      duration: 5000, // 5 seconds auto-dismiss
      position: 'top-right',
      style: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '0',
      }
    }
  );
};

// This part of the code sets up global workflow creation event listener for automatic toast notifications
export function WorkflowToastListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleWorkflowCreated = (event: CustomEvent) => {
      try {
        const { workflow, insightTitle, message } = event.detail || {};
        const title = insightTitle || workflow?.title || 'Workflow';
        
        console.log('Toast listener received workflow event:', { workflow, insightTitle, message, title });
        
        // This part of the code uses a simple toast instead of custom component to prevent navigation crashes
        toast.success(
          `✓ Workflow "${title}" created successfully!`,
          {
            duration: 5000,
            position: 'top-right',
            action: {
              label: 'View Workflows →',
              onClick: () => {
                try {
                  navigate('/workflows');
                } catch (navError) {
                  console.error('Navigation error:', navError);
                  window.location.href = '/workflows'; // Fallback navigation
                }
              },
            },
          }
        );
      } catch (error) {
        console.error('WorkflowToastListener error:', error);
        // Fallback simple toast
        toast.success('✓ Workflow created successfully!', { duration: 3000 });
      }
    };

    window.addEventListener('workflowCreated', handleWorkflowCreated as EventListener);
    
    return () => {
      window.removeEventListener('workflowCreated', handleWorkflowCreated as EventListener);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
}
