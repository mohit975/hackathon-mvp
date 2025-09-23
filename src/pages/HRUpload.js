import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'

const HRUpload = () => {
  const navigate = useNavigate()
  // const { addFiles } = useFiles() // Unused in unified upload
  const [selectedFiles, setSelectedFiles] = useState([])
  const [documentPrompt, setDocumentPrompt] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    setSelectedFiles([...selectedFiles, ...fileArray])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files)
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleProceedToQuestions = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one document to upload.')
      return
    }

    if (!documentPrompt.trim()) {
      alert('Please provide additional details about the documents.')
      return
    }

    const uploadData = {
      team: 'Human Resources',
      files: selectedFiles,
      prompt: documentPrompt,
      timestamp: new Date(),
    }

    sessionStorage.setItem('pendingUpload', JSON.stringify(uploadData))
    navigate('/hr-questions')
  }

  const hrDocumentTypes = [
    '👤 Employee Records',
    '📄 Policies & Procedures',
    '💰 Compensation Data',
    '📊 Performance Reviews',
    '🎓 Training Materials',
    '📝 Job Descriptions',
    '🏥 Benefits Information',
    '⚖️ Compliance Documents',
  ]

  return (
    <div className="team-upload-container">
      <div className="team-header">
        <div className="team-badge hr">
          <span className="team-icon">👥</span>
          <div className="team-info">
            <h1>Human Resources Document Upload</h1>
            <p>
              Upload HR documents with privacy considerations and policy context
            </p>
          </div>
        </div>
      </div>

      <div className="upload-sections">
        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h3>Privacy & Security Notice</h3>
            <p>
              All HR documents are processed with the highest level of security
              and privacy protection. Personal data is encrypted and access is
              strictly controlled.
            </p>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="upload-section">
          <h2>📁 Document Upload</h2>
          <div
            className={`upload-area ${isDragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('hr-file-input').click()}
          >
            <div className="upload-icon">👥</div>
            <h3>Drop your HR documents here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              Supports: PDF, DOC, DOCX, XLS, XLSX (Encrypted files supported)
            </div>
          </div>

          <input
            id="hr-file-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <div className="document-types">
            <h3>Common HR Documents:</h3>
            <div className="doc-type-chips">
              {hrDocumentTypes.map((type, index) => (
                <span key={index} className="doc-chip">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h3>Selected Files ({selectedFiles.length})</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">👥</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Prompt Section */}
        <div className="prompt-section">
          <h2>📋 HR Context & Details</h2>
          <p className="prompt-description">
            Provide HR context and policy details to ensure proper handling and
            compliance of these documents.
          </p>

          <textarea
            className="document-prompt"
            placeholder="Describe the HR context, policy requirements, or specific handling instructions for these documents...

Examples:
• Employee onboarding documents for new hires
• Updated company policies requiring board approval
• Performance review data for Q3 evaluations
• Benefits enrollment information for open enrollment
• Training compliance records for audit preparation
• Compensation analysis for salary review process"
            value={documentPrompt}
            onChange={(e) => setDocumentPrompt(e.target.value)}
            rows={8}
          />

          <div className="prompt-tips">
            <h4>👥 Tips for better processing:</h4>
            <ul>
              <li>Specify the employee group or department affected</li>
              <li>Mention any compliance or regulatory requirements</li>
              <li>Include effective dates or deadlines</li>
              <li>Note any approval workflows required</li>
              <li>Describe confidentiality or access restrictions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="upload-actions">
        <button className="secondary-btn" onClick={() => navigate('/')}>
          ← Back to Main Upload
        </button>
        <button
          className="primary-btn"
          onClick={handleProceedToQuestions}
          disabled={selectedFiles.length === 0 || !documentPrompt.trim()}
        >
          Proceed to Questions →
        </button>
      </div>
    </div>
  )
}

export default HRUpload
