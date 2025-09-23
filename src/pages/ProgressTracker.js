import React, { useState, useEffect } from 'react'
import { useFiles } from '../utils/FileContext'
import { Link } from 'react-router-dom'

const ProgressTracker = () => {
  const { files, batches } = useFiles()
  const [selectedTimeframe, setSelectedTimeframe] = useState('today')
  const [progressData, setProgressData] = useState({
    totalFiles: 0,
    processedFiles: 0,
    pendingFiles: 0,
    errorFiles: 0,
    validatedFiles: 0,
    teamBreakdown: {},
    recentActivity: [],
  })

  useEffect(() => {
    calculateProgressData()
  }, [files, batches, selectedTimeframe])

  const calculateProgressData = () => {
    const now = new Date()
    let filteredFiles = files

    // Filter by timeframe
    if (selectedTimeframe === 'today') {
      filteredFiles = files.filter((file) => {
        const fileDate = new Date(file.uploadedAt)
        return fileDate.toDateString() === now.toDateString()
      })
    } else if (selectedTimeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filteredFiles = files.filter(
        (file) => new Date(file.uploadedAt) >= weekAgo
      )
    } else if (selectedTimeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filteredFiles = files.filter(
        (file) => new Date(file.uploadedAt) >= monthAgo
      )
    }

    // Calculate statistics
    const totalFiles = filteredFiles.length
    const validatedFiles = filteredFiles.filter(
      (f) => f.status === 'validated'
    ).length
    const errorFiles = filteredFiles.filter((f) => f.status === 'error').length
    const pendingFiles = filteredFiles.filter(
      (f) => f.status === 'waiting' || f.status === 'scanning'
    ).length
    const processedFiles = validatedFiles + errorFiles

    // Team breakdown
    const teamBreakdown = filteredFiles.reduce((acc, file) => {
      const team = file.team || 'General'
      if (!acc[team]) {
        acc[team] = { total: 0, validated: 0, pending: 0, error: 0 }
      }
      acc[team].total++
      if (file.status === 'validated') acc[team].validated++
      else if (file.status === 'error') acc[team].error++
      else acc[team].pending++
      return acc
    }, {})

    // Recent activity (last 10 status changes)
    const recentActivity = filteredFiles
      .flatMap(
        (file) =>
          file.statusHistory?.map((entry) => ({
            ...entry,
            fileName:
              file.file?.name || file.filename || file.name || 'Unknown File',
            fileId: file.id,
            team: file.team || 'General',
          })) || []
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)

    setProgressData({
      totalFiles,
      processedFiles,
      pendingFiles,
      errorFiles,
      validatedFiles,
      teamBreakdown,
      recentActivity,
    })
  }

  const getProgressPercentage = () => {
    if (progressData.totalFiles === 0) return 0
    return Math.round(
      (progressData.processedFiles / progressData.totalFiles) * 100
    )
  }

  const getTeamColor = (team) => {
    const colors = {
      Sales: '#3b82f6',
      'Service Delivery': '#10b981',
      HR: '#f59e0b',
      General: '#6b7280',
    }
    return colors[team] || '#6b7280'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h1>Upload Progress & Summary</h1>
        <p>Track document processing progress across all teams</p>

        <div className="timeframe-selector">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="progress-overview">
        <div className="progress-card main-progress">
          <h2>Overall Progress</h2>
          <div className="progress-circle">
            <div
              className="circle-progress"
              style={{
                background: `conic-gradient(#10b981 ${
                  getProgressPercentage() * 3.6
                }deg, #e5e7eb 0deg)`,
              }}
            >
              <div className="circle-inner">
                <span className="progress-percentage">
                  {getProgressPercentage()}%
                </span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">{progressData.totalFiles}</span>
              <span className="stat-label">Total Files</span>
            </div>
            <div className="stat">
              <span className="stat-number">{progressData.processedFiles}</span>
              <span className="stat-label">Processed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{progressData.pendingFiles}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="status-cards">
          <div className="status-card validated">
            <div className="status-icon">✅</div>
            <div className="status-info">
              <span className="status-number">
                {progressData.validatedFiles}
              </span>
              <span className="status-label">Validated</span>
            </div>
          </div>
          <div className="status-card pending">
            <div className="status-icon">⏳</div>
            <div className="status-info">
              <span className="status-number">{progressData.pendingFiles}</span>
              <span className="status-label">Pending</span>
            </div>
          </div>
          <div className="status-card error">
            <div className="status-icon">❌</div>
            <div className="status-info">
              <span className="status-number">{progressData.errorFiles}</span>
              <span className="status-label">Errors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="team-breakdown">
        <h2>Team Progress</h2>
        <div className="team-grid">
          {Object.entries(progressData.teamBreakdown).map(([team, data]) => (
            <div key={team} className="team-card">
              <div className="team-header">
                <div
                  className="team-color-bar"
                  style={{ backgroundColor: getTeamColor(team) }}
                ></div>
                <h3>{team}</h3>
              </div>
              <div className="team-stats">
                <div className="team-stat">
                  <span className="team-stat-number">{data.total}</span>
                  <span className="team-stat-label">Total</span>
                </div>
                <div className="team-stat">
                  <span className="team-stat-number">{data.validated}</span>
                  <span className="team-stat-label">Validated</span>
                </div>
                <div className="team-stat">
                  <span className="team-stat-number">{data.pending}</span>
                  <span className="team-stat-label">Pending</span>
                </div>
                <div className="team-stat">
                  <span className="team-stat-number">{data.error}</span>
                  <span className="team-stat-label">Errors</span>
                </div>
              </div>
              <div className="team-progress-bar">
                <div
                  className="team-progress-fill"
                  style={{
                    width: `${
                      data.total > 0 ? (data.validated / data.total) * 100 : 0
                    }%`,
                    backgroundColor: getTeamColor(team),
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {progressData.recentActivity.length > 0 ? (
            progressData.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.status === 'validated'
                    ? '✅'
                    : activity.status === 'error'
                    ? '❌'
                    : activity.status === 'scanning'
                    ? '🔄'
                    : '⏳'}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <Link
                      to={`/document/${activity.fileId}`}
                      className="activity-file"
                    >
                      {activity.fileName}
                    </Link>
                    <span className="activity-status">{activity.status}</span>
                    <span
                      className="activity-team"
                      style={{ color: getTeamColor(activity.team) }}
                    >
                      {activity.team}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <div className="no-activity-icon">📋</div>
              <p>No recent activity found</p>
              <Link to="/upload" className="upload-link">
                Upload some documents to get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/upload" className="action-btn primary">
            <span className="action-icon">📁</span>
            <span>Upload Documents</span>
          </Link>
          <Link to="/queue" className="action-btn secondary">
            <span className="action-icon">📋</span>
            <span>View Queue</span>
          </Link>
          <Link to="/workflows" className="action-btn secondary">
            <span className="action-icon">⚡</span>
            <span>Manage Workflows</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker
