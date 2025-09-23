import React, { useState } from 'react'
import { useFiles } from '../utils/FileContext'
import { Link } from 'react-router-dom'

const UploadQueue = () => {
  const {
    files,
    batches,
    updateFileStatus,
    removeFile,
    updateFileTag,
    addWorkflow,
  } = useFiles()
  const [selectedBatch, setSelectedBatch] = useState('all')

  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return 'Unknown Size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  const getFileIcon = (type) => {
    if (!type || typeof type !== 'string') return '📁'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word')) return '📝'
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation')) return '📈'
    if (type.includes('zip')) return '🗜️'
    if (type.includes('image')) return '🖼️'
    return '📁'
  }

  const getStatusPillClass = (status) => {
    switch (status) {
      case 'waiting':
        return 'status-waiting'
      case 'scanning':
        return 'status-scanning'
      case 'validated':
        return 'status-validated'
      case 'error':
        return 'status-error'
      default:
        return 'status-waiting'
    }
  }

  const handleRetry = (file) => {
    updateFileStatus(file.id, 'scanning', 'Retrying validation...')
    setTimeout(() => {
      const success = Math.random() > 0.3
      if (success) {
        updateFileStatus(file.id, 'validated', 'File validated successfully')
      } else {
        updateFileStatus(file.id, 'error', 'Validation failed')
      }
    }, 2000)
  }

  const handleValidateAll = () => {
    const pendingFiles = filteredFiles.filter(
      (f) => f.status === 'waiting' || f.status === 'error'
    )
    pendingFiles.forEach((file) => {
      updateFileStatus(file.id, 'scanning', 'Starting validation...')
      setTimeout(() => {
        const success = Math.random() > 0.2
        if (success) {
          updateFileStatus(file.id, 'validated', 'File validated successfully')
        } else {
          updateFileStatus(file.id, 'error', 'Validation failed')
        }
      }, Math.random() * 3000 + 1000)
    })
  }

  const filteredFiles =
    selectedBatch === 'all'
      ? files
      : files.filter((f) => f.batchId === selectedBatch)

  const activeBatch = batches.find((b) => b.id === selectedBatch)

  const stats = {
    total: filteredFiles.length,
    validated: filteredFiles.filter((f) => f.status === 'validated').length,
    failed: filteredFiles.filter((f) => f.status === 'error').length,
    pending: filteredFiles.filter(
      (f) => f.status === 'waiting' || f.status === 'scanning'
    ).length,
  }

  return (
    <div className="upload-queue">
      <div className="queue-header">
        <h1>Upload Queue & Status</h1>
        <div className="queue-controls">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="batch-selector"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.id} ({batch.completedFiles}/{batch.totalFiles})
              </option>
            ))}
          </select>
          <button className="validate-btn" onClick={handleValidateAll}>
            Validate All
          </button>
        </div>
      </div>

      {activeBatch && (
        <div className="batch-info">
          <h2>Batch: {activeBatch.id}</h2>
          <div className="batch-stats">
            <div className="stat">
              <span className="stat-label">Total Files:</span>
              <span className="stat-value">{activeBatch.totalFiles}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{activeBatch.completedFiles}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Status:</span>
              <span className={`stat-value ${activeBatch.status}`}>
                {activeBatch.status}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Created:</span>
              <span className="stat-value">
                {activeBatch.createdAt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="upload-queue">
        <table className="queue-table">
          <thead>
            <tr>
              <th></th>
              <th>Filename</th>
              <th>Size</th>
              <th>Type</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Batch ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((fileObj) => {
              // Debug log to understand file structure
              console.log('File object:', fileObj)

              return (
                <tr key={fileObj.id}>
                  <td>
                    <span className="queue-thumb">
                      {getFileIcon(
                        fileObj.file?.type || fileObj.metadata?.type
                      )}
                    </span>
                  </td>
                  <td>
                    <Link to={`/document/${fileObj.id}`} className="file-link">
                      {fileObj.file?.name ||
                        fileObj.filename ||
                        fileObj.name ||
                        'Unknown File'}
                    </Link>
                  </td>
                  <td>
                    {fileObj.file?.size
                      ? formatSize(fileObj.file.size)
                      : fileObj.metadata?.size
                      ? formatSize(fileObj.metadata.size)
                      : 'Unknown Size'}
                  </td>
                  <td>
                    {fileObj.file?.type
                      ? fileObj.file.type.split('/').pop().toUpperCase()
                      : fileObj.metadata?.type
                      ? fileObj.metadata.type.split('/').pop().toUpperCase()
                      : 'DOCUMENT'}
                  </td>
                  <td className="queue-tags">
                    <select
                      value={fileObj.tag}
                      onChange={(e) =>
                        updateFileTag(fileObj.id, e.target.value)
                      }
                    >
                      <option value="">Document Type</option>
                      <option value="report">Report</option>
                      <option value="invoice">Invoice</option>
                      <option value="contract">Contract</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${getStatusPillClass(
                        fileObj.status
                      )}`}
                    >
                      {fileObj.status.charAt(0).toUpperCase() +
                        fileObj.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="batch-id">{fileObj.batchId || 'N/A'}</span>
                  </td>
                  <td className="queue-actions">
                    <button
                      title="Remove"
                      onClick={() => removeFile(fileObj.id)}
                      className="action-btn remove-btn"
                    >
                      🗑️
                    </button>
                    <button
                      title="Retry"
                      onClick={() => handleRetry(fileObj)}
                      className="action-btn retry-btn"
                    >
                      🔄
                    </button>
                    <Link
                      to={`/document/${fileObj.id}`}
                      title="View Details"
                      className="action-btn view-btn"
                    >
                      👁️
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredFiles.length === 0 && (
          <div className="empty-queue">
            <p>No files in queue</p>
            <p>Upload files to get started</p>
          </div>
        )}
      </div>

      <div className="queue-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total Files:</span>
            <span className="summary-value total">{stats.total}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Validated:</span>
            <span className="summary-value validated">{stats.validated}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Failed:</span>
            <span className="summary-value failed">{stats.failed}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Pending:</span>
            <span className="summary-value pending">{stats.pending}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadQueue
