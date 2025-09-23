import React, { useState, useRef } from 'react'
import { useFiles } from '../utils/FileContext'
import { useNavigate } from 'react-router-dom'

const Upload = () => {
  const { addFiles, createBatch, currentBatch } = useFiles()
  const [dragOver, setDragOver] = useState(false)
  const [metadata, setMetadata] = useState({
    project: '',
    client: '',
    stage: '',
    notes: '',
  })
  const fileInputRef = useRef()
  const navigate = useNavigate()

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'image/jpeg',
    'image/png',
  ]

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 100 * 1024 * 1024) return false
      if (!allowedTypes.includes(file.type)) return false
      return true
    })

    if (validFiles.length > 0) {
      if (!currentBatch) {
        createBatch(metadata)
      }
      addFiles(validFiles)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e) => {
    handleFiles(e.target.files)
  }

  const handleMetadataChange = (field, value) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const navigateToQueue = () => {
    navigate('/queue')
  }

  return (
    <div className="main-content">
      <div className="hero">
        <h1>Enterprise Document Intelligence</h1>
        <p>
          Transform your document workflows with AI-powered processing,
          automated compliance validation, and intelligent data extraction.
          Experience enterprise-grade security with real-time monitoring.
        </p>
        <div className="cta-chips">
          <div className="chip">🚀 Enterprise Ready</div>
          <div className="chip">🔒 SOC2 Compliant</div>
          <div className="chip">⚡ AI-Powered</div>
          <div className="chip">📊 Analytics Dashboard</div>
        </div>

        {/* Team-Specific Upload Options */}
        <div className="team-upload-options">
          <h3>Team-Specific Document Upload</h3>
          <p>
            Choose your team for specialized document processing with tailored
            workflows
          </p>
          <div className="team-cards">
            <div
              className="team-card"
              onClick={() => navigate('/sales-upload')}
            >
              <div className="team-icon">💼</div>
              <h4>Sales Team</h4>
              <p>Proposals, contracts, pricing, and client documents</p>
              <span className="team-arrow">→</span>
            </div>
            <div
              className="team-card"
              onClick={() => navigate('/service-upload')}
            >
              <div className="team-icon">⚙️</div>
              <h4>Service Delivery</h4>
              <p>Technical specs, project plans, and implementation docs</p>
              <span className="team-arrow">→</span>
            </div>
            <div className="team-card" onClick={() => navigate('/hr-upload')}>
              <div className="team-icon">👥</div>
              <h4>Human Resources</h4>
              <p>Employee records, policies, and compliance documents</p>
              <span className="team-arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-panel">
        <div
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <strong>Drag & Drop Enterprise Documents</strong>
          <div className="upload-info">
            📄 Supported: PDF, DOCX, XLSX, PPTX, ZIP, JPG, PNG
          </div>
          <div className="upload-info">
            ⚡ Max file size: 100 MB | 🔒 Enterprise encryption
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            accept=".pdf,.docx,.xlsx,.pptx,.zip,.jpg,.jpeg,.png"
            onChange={handleFileInput}
          />
        </div>

        <button className="add-file-btn" onClick={handleUploadClick}>
          ➕ Add More Documents
        </button>

        <div className="upload-btns">
          <button className="upload-btn" onClick={navigateToQueue}>
            📊 View Processing Queue
          </button>
          <button className="validate-btn" onClick={navigateToQueue}>
            🚀 Start AI Validation
          </button>
        </div>

        {currentBatch && (
          <div className="current-batch-info">
            <h3>Current Batch: {currentBatch.id}</h3>
            <p>Files in batch: {currentBatch.totalFiles}</p>
          </div>
        )}
      </div>

      <div className="sidebar">
        <form className="metadata-form">
          <select
            value={metadata.project}
            onChange={(e) => handleMetadataChange('project', e.target.value)}
          >
            <option value="">🏢 Select Enterprise Project</option>
            <option value="alpha">
              🚀 Project Alpha - Digital Transformation
            </option>
            <option value="beta">
              📊 Project Beta - Data Analytics Platform
            </option>
            <option value="gamma">
              🔐 Project Gamma - Security Infrastructure
            </option>
          </select>
          <select
            value={metadata.client}
            onChange={(e) => handleMetadataChange('client', e.target.value)}
          >
            <option value="">👥 Select Client Organization</option>
            <option value="acme">🏭 Acme Corporation</option>
            <option value="globex">🌐 Globex Industries</option>
            <option value="initech">💼 Initech Solutions</option>
          </select>
          <select
            value={metadata.stage}
            onChange={(e) => handleMetadataChange('stage', e.target.value)}
          >
            <option value="">⚡ Select Process Stage</option>
            <option value="planning">📋 Strategic Planning</option>
            <option value="execution">🚀 Active Execution</option>
            <option value="review">🔍 Quality Review</option>
          </select>
          <input
            type="text"
            placeholder="💭 Add project notes or requirements..."
            value={metadata.notes}
            onChange={(e) => handleMetadataChange('notes', e.target.value)}
          />
        </form>
      </div>
    </div>
  )
}

export default Upload
