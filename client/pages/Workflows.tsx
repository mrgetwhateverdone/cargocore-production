// This part of the code creates the complete Workflows page with KPIs, management interface, and real-time updates
// It provides comprehensive workflow tracking with status management and automatic refresh capabilities

import React, { useState } from 'react';
import { RefreshCw, Plus, Bot, Settings, Calendar, Trash2, Play, CheckCircle, Clock } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useWorkflows } from '../hooks/useWorkflows';
import { CreatedWorkflow } from '../utils/workflowStorage';
import { BrainIcon } from '../components/ui/BrainIcon';

export default function Workflows() {
  const { workflows, loading, stats, workflowsByStatus, updateWorkflowStatus, removeWorkflow, refreshWorkflows } = useWorkflows();
  const [activeTab, setActiveTab] = useState<'todo' | 'inProgress' | 'completed'>('todo');

  // This part of the code handles workflow status transitions with immediate state updates
  const handleStatusChange = (workflowId: string, newStatus: CreatedWorkflow['status']) => {
    updateWorkflowStatus(workflowId, { status: newStatus });
  };

  // This part of the code handles workflow deletion with confirmation
  const handleDelete = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      removeWorkflow(workflowId);
    }
  };

  // This part of the code renders priority badges with appropriate styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // This part of the code renders workflow cards with action buttons and progress tracking
  const renderWorkflowCard = (workflow: CreatedWorkflow) => (
    <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {workflow.source === 'ai_insight' ? (
            <Bot className="h-5 w-5 text-blue-600" />
          ) : (
            <Settings className="h-5 w-5 text-gray-600" />
          )}
          <h3 className="font-semibold text-gray-900">{workflow.title}</h3>
          {/* This part of the code adds a blue brain icon to indicate AI-generated workflows */}
          {workflow.source === 'ai_insight' && (
            <BrainIcon className="h-4 w-4 text-blue-600" />
          )}
        </div>
        {getPriorityBadge(workflow.priority)}
      </div>

      <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>

      {/* This part of the code shows workflow progress based on completed steps */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{workflow.steps.filter(s => s.completed).length}/{workflow.steps.length} steps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${workflow.steps.length > 0 ? (workflow.steps.filter(s => s.completed).length / workflow.steps.length) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      {/* This part of the code displays workflow metadata and impact */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
          <span>Est: {workflow.estimatedTime}</span>
        </div>
        {workflow.dollarImpact > 0 && (
          <span className="font-medium text-green-600">${workflow.dollarImpact.toLocaleString()}</span>
        )}
      </div>

      {/* This part of the code shows workflow tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {workflow.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* This part of the code provides workflow action buttons based on current status */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          {workflow.status === 'todo' && (
            <button
              onClick={() => handleStatusChange(workflow.id, 'in_progress')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Play className="h-3 w-3" />
              <span>Start</span>
            </button>
          )}
          {workflow.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange(workflow.id, 'completed')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Complete</span>
            </button>
          )}
          {workflow.status === 'completed' && (
            <span className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded">
              <CheckCircle className="h-3 w-3" />
              <span>Completed</span>
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => handleDelete(workflow.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete workflow"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* This part of the code renders the page header with title and refresh functionality */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <button
            onClick={refreshWorkflows}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* This part of the code displays the KPI cards with real-time workflow statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedThisWeek}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">$ Saved</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSaved.toLocaleString()}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>

        {/* This part of the code shows the Workflows AI Assistant section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflows AI Assistant</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <Bot className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No insights available. AI recommendations will appear here when new workflow opportunities are detected.
            </p>
          </div>
        </div>

        {/* This part of the code provides the workflow management interface with tabs and filtering */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Workflow Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="h-4 w-4" />
                <span>New Workflow</span>
              </button>
            </div>

            {/* This part of the code renders the tab navigation with workflow counts */}
            <div className="flex space-x-1">
              {[
                { key: 'todo', label: 'To Do', count: workflowsByStatus.todo.length },
                { key: 'inProgress', label: 'In Progress', count: workflowsByStatus.inProgress.length },
                { key: 'completed', label: 'Completed', count: workflowsByStatus.completed.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* This part of the code displays workflows for the selected tab */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading workflows...</p>
              </div>
            ) : workflowsByStatus[activeTab].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflowsByStatus[activeTab].map(renderWorkflowCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab === 'inProgress' ? 'In Progress' : activeTab === 'todo' ? 'To Do' : 'Completed'} Workflows</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'todo' 
                    ? 'Create workflows from insights on the dashboard to get started.'
                    : activeTab === 'inProgress'
                    ? 'Start working on to-do workflows to see them here.'
                    : 'Complete in-progress workflows to see them here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
