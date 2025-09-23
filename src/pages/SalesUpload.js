import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'

const SalesUpload = () => {
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

    // Store the files and prompt data temporarily
    const uploadData = {
      team: 'Sales',
      files: selectedFiles,
      prompt: documentPrompt,
      timestamp: new Date(),
    }

    // Store in sessionStorage for the questions page
    sessionStorage.setItem('pendingUpload', JSON.stringify(uploadData))

    // Navigate to sales clarification questions
    navigate('/sales-questions')
  }

  const salesDocumentTypes = [
    '📋 Sales Proposals',
    '💰 Pricing Documents',
    '📊 Sales Reports',
    '🤝 Client Contracts',
    '📈 Revenue Analysis',
    '🎯 Sales Strategy',
    '📞 Call Records',
    '💼 Lead Information',
  ]

  return (
    <div className="team-upload-container">
      <div className="team-header">
        <div className="team-badge sales">
          <span className="team-icon">💼</span>
          <div className="team-info">
            <h1>Sales Team Document Upload</h1>
            <p>Upload sales-related documents with context and details</p>
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
            onClick={() => document.getElementById('sales-file-input').click()}
          >
            <div className="upload-icon">📄</div>
            <h3>Drop your sales documents here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
            </div>
          </div>

          <input
            id="sales-file-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          {/* Document Types */}
          <div className="document-types">
            <h3>Common Sales Documents:</h3>
            <div className="doc-type-chips">
              {salesDocumentTypes.map((type, index) => (
                <span key={index} className="doc-chip">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h3>Selected Files ({selectedFiles.length})</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">📄</span>
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
          <h2>💬 Additional Details</h2>
          <p className="prompt-description">
            Provide context about these documents to help our AI understand and
            process them better.
          </p>

          <textarea
            className="document-prompt"
            placeholder="Describe the purpose, context, or specific details about these sales documents...

Examples:
• Q3 sales proposals for enterprise clients
• Pricing sheets for new product launch
• Monthly sales performance reports
• Contract negotiations with key accounts
• Revenue analysis for board presentation"
            value={documentPrompt}
            onChange={(e) => setDocumentPrompt(e.target.value)}
            rows={8}
          />

          <div className="prompt-tips">
            <h4>💡 Tips for better processing:</h4>
            <ul>
              <li>Mention the time period or quarter</li>
              <li>Specify client or prospect names if relevant</li>
              <li>Include deal values or revenue figures</li>
              <li>Note any urgent deadlines or priorities</li>
              <li>Describe the intended audience or purpose</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

export default SalesUpload
