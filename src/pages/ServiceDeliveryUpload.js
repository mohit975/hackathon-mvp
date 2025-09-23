import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'

const ServiceDeliveryUpload = () => {
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
      team: 'Service Delivery',
      files: selectedFiles,
      prompt: documentPrompt,
      timestamp: new Date(),
    }

    sessionStorage.setItem('pendingUpload', JSON.stringify(uploadData))
    navigate('/service-questions')
  }

  const serviceDocumentTypes = [
    '🔧 Technical Specifications',
    '📋 Project Plans',
    '📊 Status Reports',
    '🎯 Deliverables',
    '⚙️ Implementation Guides',
    '📝 Change Requests',
    '🚀 Release Notes',
    '🔍 Quality Assurance',
  ]

  return (
    <div className="team-upload-container">
      <div className="team-header">
        <div className="team-badge service">
          <span className="team-icon">⚙️</span>
          <div className="team-info">
            <h1>Service Delivery Document Upload</h1>
            <p>
              Upload project and service delivery documents with technical
              context
            </p>
          </div>
        </div>
      </div>

      <div className="upload-sections">
        {/* Document Upload Section */}
        <div className="upload-section">
          <h2>📁 Document Upload</h2>
          <div
            className={`upload-area ${isDragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() =>
              document.getElementById('service-file-input').click()
            }
          >
            <div className="upload-icon">⚙️</div>
            <h3>Drop your service delivery documents here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
            </div>
          </div>

          <input
            id="service-file-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <div className="document-types">
            <h3>Common Service Delivery Documents:</h3>
            <div className="doc-type-chips">
              {serviceDocumentTypes.map((type, index) => (
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
                    <span className="file-icon">⚙️</span>
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
          <h2>🔧 Technical Details</h2>
          <p className="prompt-description">
            Provide technical context and project details to help process these
            service delivery documents effectively.
          </p>

          <textarea
            className="document-prompt"
            placeholder="Describe the technical context, project details, or specific requirements for these documents...

Examples:
• Technical specifications for client portal implementation
• Sprint planning documents for Q4 deliverables
• Change request documentation for system upgrade
• Quality assurance reports for mobile application
• Implementation guide for API integration
• Project status update for enterprise deployment"
            value={documentPrompt}
            onChange={(e) => setDocumentPrompt(e.target.value)}
            rows={8}
          />

          <div className="prompt-tips">
            <h4>🔧 Tips for better processing:</h4>
            <ul>
              <li>Specify the project name and phase</li>
              <li>Mention client requirements or constraints</li>
              <li>Include technical stack or platforms used</li>
              <li>Note any dependencies or blockers</li>
              <li>Describe integration points or APIs involved</li>
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

export default ServiceDeliveryUpload
