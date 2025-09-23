import React, { useState, useEffect } from 'react'
import { useFiles } from '../utils/FileContext'
import { Link } from 'react-router-dom'

const WorkflowDashboard = () => {
  const { workflows, batches, files, updateWorkflow } = useFiles()
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)

  // Simulate workflow progression
  useEffect(() => {
    const interval = setInterval(() => {
      workflows.forEach((workflow) => {
        if (
          workflow.status === 'running' &&
          workflow.currentStep < workflow.steps.length - 1
        ) {
          // Random chance to progress to next step
          if (Math.random() > 0.7) {
            const nextStep = workflow.currentStep + 1
            const isComplete = nextStep >= workflow.steps.length - 1

            updateWorkflow(workflow.id, {
              currentStep: nextStep,
              status: isComplete ? 'completed' : 'running',
              logs: [
                ...workflow.logs,
                {
                  timestamp: new Date(),
                  step: workflow.steps[nextStep],
                  message: `Completed ${
                    workflow.steps[workflow.currentStep]
                  }, starting ${workflow.steps[nextStep]}`,
                  level: 'info',
                },
              ],
            })
          }
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [workflows, updateWorkflow])

  const filteredWorkflows =
    selectedBatch === 'all'
      ? workflows
      : workflows.filter((w) => w.batchId === selectedBatch)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return '🔄'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      case 'paused':
        return '⏸️'
      default:
        return '⏳'
    }
  }

  const getProgressPercentage = (workflow) => {
    if (workflow.status === 'completed') return 100
    if (workflow.status === 'failed') return 0
    return Math.round(
      ((workflow.currentStep + 1) / workflow.steps.length) * 100
    )
  }

  const handleRetryWorkflow = (workflowId) => {
    updateWorkflow(workflowId, {
      status: 'running',
      currentStep: 0,
      logs: [
        ...workflows.find((w) => w.id === workflowId).logs,
        {
          timestamp: new Date(),
          step: 'retry',
          message: 'Workflow restarted by user',
          level: 'info',
        },
      ],
    })
  }

  const handlePauseWorkflow = (workflowId) => {
    const workflow = workflows.find((w) => w.id === workflowId)
    updateWorkflow(workflowId, {
      status: workflow.status === 'paused' ? 'running' : 'paused',
      logs: [
        ...workflow.logs,
        {
          timestamp: new Date(),
          step: 'user_action',
          message:
            workflow.status === 'paused'
              ? 'Workflow resumed'
              : 'Workflow paused',
          level: 'info',
        },
      ],
    })
  }

  const renderWorkflowDetails = (workflow) => {
    const associatedFile = files.find((f) => f.id === workflow.fileId)

    return (
      <div className="workflow-details">
        <div className="workflow-details-header">
          <h3>{workflow.name}</h3>
          <button
            className="close-details-btn"
            onClick={() => setSelectedWorkflow(null)}
          >
            ✕
          </button>
        </div>

        <div className="workflow-info">
          <div className="info-item">
            <label>Status:</label>
            <span className={`workflow-status ${workflow.status}`}>
              {getStatusIcon(workflow.status)} {workflow.status}
            </span>
          </div>
          <div className="info-item">
            <label>Progress:</label>
            <span>{getProgressPercentage(workflow)}%</span>
          </div>
          <div className="info-item">
            <label>Created:</label>
            <span>{workflow.createdAt.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <label>Batch ID:</label>
            <span>{workflow.batchId}</span>
          </div>
          {associatedFile && (
            <div className="info-item">
              <label>File:</label>
              <Link to={`/document/${associatedFile.id}`} className="file-link">
                {associatedFile.file.name}
              </Link>
            </div>
          )}
        </div>

        <div className="workflow-progress">
          <h4>Pipeline Steps</h4>
          <div className="steps-timeline">
            {workflow.steps.map((step, index) => (
              <div
                key={index}
                className={`step-item ${
                  index <= workflow.currentStep ? 'completed' : 'pending'
                } ${
                  index === workflow.currentStep &&
                  workflow.status === 'running'
                    ? 'active'
                    : ''
                }`}
              >
                <div className="step-indicator">
                  {index < workflow.currentStep
                    ? '✓'
                    : index === workflow.currentStep &&
                      workflow.status === 'running'
                    ? '▶'
                    : index + 1}
                </div>
                <div className="step-content">
                  <div className="step-name">{step}</div>
                  {index === workflow.currentStep &&
                    workflow.status === 'running' && (
                      <div className="step-status">In Progress...</div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workflow-logs">
          <h4>Logs</h4>
          <div className="logs-container">
            {workflow.logs.length > 0 ? (
              workflow.logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.level}`}>
                  <span className="log-timestamp">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="log-step">[{log.step}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="no-logs">No logs available</div>
            )}
          </div>
        </div>

        <div className="workflow-actions">
          {workflow.status === 'running' && (
            <button
              className="action-btn pause-btn"
              onClick={() => handlePauseWorkflow(workflow.id)}
            >
              ⏸️ Pause
            </button>
          )}
          {workflow.status === 'paused' && (
            <button
              className="action-btn resume-btn"
              onClick={() => handlePauseWorkflow(workflow.id)}
            >
              ▶️ Resume
            </button>
          )}
          {(workflow.status === 'failed' ||
            workflow.status === 'completed') && (
            <button
              className="action-btn retry-btn"
              onClick={() => handleRetryWorkflow(workflow.id)}
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="workflow-dashboard">
      <div className="dashboard-header">
        <h1>Workflow Dashboard</h1>
        <div className="dashboard-controls">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="batch-selector"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{workflows.length}</div>
          <div className="stat-label">Total Workflows</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {workflows.filter((w) => w.status === 'running').length}
          </div>
          <div className="stat-label">Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {workflows.filter((w) => w.status === 'completed').length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {workflows.filter((w) => w.status === 'failed').length}
          </div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="workflows-grid">
          {filteredWorkflows.map((workflow) => {
            const associatedFile = files.find((f) => f.id === workflow.fileId)

            return (
              <div
                key={workflow.id}
                className={`workflow-card ${workflow.status}`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <div className="workflow-card-header">
                  <h3>{workflow.name}</h3>
                  <span className="workflow-status-icon">
                    {getStatusIcon(workflow.status)}
                  </span>
                </div>

                <div className="workflow-card-info">
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`info-value status-${workflow.status}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Progress:</span>
                    <span className="info-value">
                      {getProgressPercentage(workflow)}%
                    </span>
                  </div>
                  {associatedFile && (
                    <div className="info-row">
                      <span className="info-label">File:</span>
                      <span
                        className="info-value file-name"
                        title={associatedFile.file.name}
                      >
                        {associatedFile.file.name.length > 20
                          ? `${associatedFile.file.name.substring(0, 20)}...`
                          : associatedFile.file.name}
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">
                      {workflow.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="workflow-progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(workflow)}%` }}
                  ></div>
                </div>

                <div className="workflow-steps-preview">
                  {workflow.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`step-dot ${
                        index <= workflow.currentStep ? 'completed' : 'pending'
                      }`}
                      title={step}
                    ></div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="empty-workflows">
            <h3>No workflows found</h3>
            <p>Upload and validate files to trigger workflows.</p>
            <Link to="/" className="upload-btn">
              Go to Upload
            </Link>
          </div>
        )}
      </div>

      {selectedWorkflow && (
        <div className="workflow-details-modal">
          <div
            className="modal-backdrop"
            onClick={() => setSelectedWorkflow(null)}
          ></div>
          <div className="modal-content">
            {renderWorkflowDetails(
              workflows.find((w) => w.id === selectedWorkflow)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowDashboard
