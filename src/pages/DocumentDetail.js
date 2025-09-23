import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { files, workflows, updateFileTag, removeFile } = useFiles()
  const [activeTab, setActiveTab] = useState('overview')

  const file = files.find((f) => f.id === id)
  const fileWorkflows = workflows.filter((w) => w.fileId === id)

  if (!file) {
    return (
      <div className="document-detail">
        <h1>File not found</h1>
        <Link to="/queue">Back to Queue</Link>
      </div>
    )
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word')) return '📝'
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation')) return '📈'
    if (type.includes('zip')) return '🗜️'
    if (type.includes('image')) return '🖼️'
    return '📁'
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      removeFile(file.id)
      navigate('/queue')
    }
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download
    const url = URL.createObjectURL(file.file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderPreview = () => {
    if (file.file.type.includes('image')) {
      const url = URL.createObjectURL(file.file)
      return (
        <div className="file-preview">
          <img
            src={url}
            alt={file.file.name}
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </div>
      )
    } else if (file.file.type.includes('pdf')) {
      return (
        <div className="file-preview">
          <div className="pdf-placeholder">
            <span className="file-icon-large">📄</span>
            <p>PDF Preview</p>
            <p className="preview-note">
              In a production app, this would show a PDF viewer
            </p>
            <button onClick={handleDownload} className="preview-btn">
              Download PDF
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="file-preview">
          <div className="file-placeholder">
            <span className="file-icon-large">
              {getFileIcon(file.file.type)}
            </span>
            <p>Preview not available for this file type</p>
            <button onClick={handleDownload} className="preview-btn">
              Download File
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="document-detail">
      <div className="detail-header">
        <div className="header-left">
          <Link to="/queue" className="back-btn">
            ← Back to Queue
          </Link>
          <h1>
            <span className="file-icon">{getFileIcon(file.file.type)}</span>
            {file.file.name}
          </h1>
        </div>
        <div className="header-actions">
          <button onClick={handleDownload} className="action-btn download-btn">
            Download
          </button>
          <button onClick={handleDelete} className="action-btn delete-btn">
            Delete
          </button>
        </div>
      </div>

      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button
          className={`tab ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          Workflows ({fileWorkflows.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="detail-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="metadata-section">
              <h3>File Metadata</h3>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <label>Filename:</label>
                  <span>{file.file.name}</span>
                </div>
                <div className="metadata-item">
                  <label>Size:</label>
                  <span>{formatSize(file.file.size)}</span>
                </div>
                <div className="metadata-item">
                  <label>Type:</label>
                  <span>{file.file.type}</span>
                </div>
                <div className="metadata-item">
                  <label>Last Modified:</label>
                  <span>
                    {new Date(file.file.lastModified).toLocaleString()}
                  </span>
                </div>
                <div className="metadata-item">
                  <label>Uploaded:</label>
                  <span>{file.uploadedAt.toLocaleString()}</span>
                </div>
                <div className="metadata-item">
                  <label>Batch ID:</label>
                  <span>{file.batchId || 'N/A'}</span>
                </div>
                <div className="metadata-item">
                  <label>Status:</label>
                  <span className={`status-pill status-${file.status}`}>
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </span>
                </div>
                <div className="metadata-item">
                  <label>Tag:</label>
                  <select
                    value={file.tag}
                    onChange={(e) => updateFileTag(file.id, e.target.value)}
                    className="tag-selector"
                  >
                    <option value="">Select tag...</option>
                    <option value="report">Report</option>
                    <option value="invoice">Invoice</option>
                    <option value="contract">Contract</option>
                    <option value="presentation">Presentation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="validation-tab">
            <h3>Validation Results</h3>
            {file.validationResults ? (
              <div className="validation-results">
                <div className="validation-item">
                  <label>File Integrity:</label>
                  <span
                    className={`validation-status ${file.validationResults.fileIntegrity}`}
                  >
                    {file.validationResults.fileIntegrity}
                  </span>
                </div>
                <div className="validation-item">
                  <label>Virus Scan:</label>
                  <span
                    className={`validation-status ${file.validationResults.virusScan}`}
                  >
                    {file.validationResults.virusScan}
                  </span>
                </div>
                <div className="validation-item">
                  <label>Compliance:</label>
                  <span
                    className={`validation-status ${file.validationResults.compliance}`}
                  >
                    {file.validationResults.compliance}
                  </span>
                </div>
                {file.validationResults.metadata && (
                  <div className="extracted-metadata">
                    <h4>Extracted Metadata</h4>
                    <div className="metadata-grid">
                      <div className="metadata-item">
                        <label>Language:</label>
                        <span>{file.validationResults.metadata.language}</span>
                      </div>
                      <div className="metadata-item">
                        <label>Page Count:</label>
                        <span>{file.validationResults.metadata.pageCount}</span>
                      </div>
                      <div className="metadata-item">
                        <label>Extracted Text Preview:</label>
                        <span className="text-preview">
                          {file.validationResults.metadata.extractedText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-validation">
                <p>No validation results available.</p>
                <p>File status: {file.status}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="workflows-tab">
            <h3>Linked Workflows</h3>
            {fileWorkflows.length > 0 ? (
              <div className="workflows-list">
                {fileWorkflows.map((workflow) => (
                  <div key={workflow.id} className="workflow-item">
                    <div className="workflow-header">
                      <h4>{workflow.name}</h4>
                      <span className={`workflow-status ${workflow.status}`}>
                        {workflow.status}
                      </span>
                    </div>
                    <div className="workflow-steps">
                      {workflow.steps.map((step, index) => (
                        <div
                          key={index}
                          className={`workflow-step ${
                            index <= workflow.currentStep
                              ? 'completed'
                              : 'pending'
                          }`}
                        >
                          <span className="step-number">{index + 1}</span>
                          <span className="step-name">{step}</span>
                          {index === workflow.currentStep &&
                            workflow.status === 'running' && (
                              <span className="step-indicator">▶</span>
                            )}
                        </div>
                      ))}
                    </div>
                    <div className="workflow-meta">
                      <span>
                        Created: {workflow.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-workflows">
                <p>No workflows associated with this file.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>Status History</h3>
            <div className="history-timeline">
              {file.statusHistory.map((entry, index) => (
                <div key={index} className="history-entry">
                  <div className="history-timestamp">
                    {entry.timestamp.toLocaleString()}
                  </div>
                  <div className="history-status">
                    <span className={`status-pill status-${entry.status}`}>
                      {entry.status}
                    </span>
                  </div>
                  <div className="history-message">{entry.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-tab">
            <h3>File Preview</h3>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentDetail
