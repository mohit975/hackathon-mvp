import React, { useState } from 'react'
import { useFiles } from '../utils/FileContext'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const UnifiedUpload = () => {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadData, setUploadData] = useState({
    files: [],
    selectedTeam: null,
    prompt: '',
    documentTypes: [],
  })
  const { addFiles, addProcessedFiles, createBatch } = useFiles()
  const navigate = useNavigate()

  // General file upload handler
  const handleFileUpload = (files, team = null) => {
    const fileArray = Array.from(files)
    setUploadData((prev) => ({
      ...prev,
      files: fileArray,
      selectedTeam: team,
    }))
  }

  // General upload submission
  const handleGeneralUpload = () => {
    if (uploadData.files.length === 0) return

    createBatch({
      metadata: {
        uploadType: 'general',
        team: uploadData.selectedTeam || 'general',
      },
    })

    addFiles(uploadData.files)
    navigate('/queue')
  }

  // Sales team upload
  const handleSalesUpload = (files) => {
    const fileArray = Array.from(files)

    // Store in session for questions flow
    sessionStorage.setItem(
      'pendingUpload',
      JSON.stringify({
        files: fileArray.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
        team: 'Sales',
        prompt:
          'Sales documents for client proposals, contracts, and revenue tracking',
        documentTypes: [
          'proposal',
          'contract',
          'revenue-report',
          'client-analysis',
        ],
      })
    )

    navigate('/sales-questions')
  }

  // Service Delivery team upload
  const handleServiceDeliveryUpload = (files) => {
    const fileArray = Array.from(files)

    sessionStorage.setItem(
      'pendingUpload',
      JSON.stringify({
        files: fileArray.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
        team: 'Service Delivery',
        prompt:
          'Technical project documentation, deployment guides, and service delivery reports',
        documentTypes: [
          'technical-spec',
          'deployment-guide',
          'service-report',
          'project-doc',
        ],
      })
    )

    navigate('/service-questions')
  }

  // HR team upload
  const handleHRUpload = (files) => {
    const fileArray = Array.from(files)

    sessionStorage.setItem(
      'pendingUpload',
      JSON.stringify({
        files: fileArray.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
        team: 'HR',
        prompt:
          'Human resources documents including policies, employee records, and compliance materials',
        documentTypes: [
          'policy',
          'employee-record',
          'compliance',
          'training-material',
        ],
      })
    )

    navigate('/hr-questions')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="upload-tab-content">
            <div className="upload-section">
              <h2>General Document Upload</h2>
              <p>Upload documents for general processing and validation</p>

              <div className="upload-dropzone">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="file-input"
                  id="general-upload"
                />
                <label htmlFor="general-upload" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <strong>Click to upload</strong> or drag and drop files here
                  </div>
                  <div className="upload-hint">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX up to 10MB each
                  </div>
                </label>
              </div>

              {uploadData.files.length > 0 && (
                <div className="selected-files">
                  <h3>Selected Files ({uploadData.files.length})</h3>
                  <ul className="file-list">
                    {uploadData.files.map((file, index) => (
                      <li key={index} className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleGeneralUpload}
                    className="upload-btn primary"
                  >
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'sales':
        return (
          <div className="upload-tab-content">
            <div className="team-upload-section">
              <div className="team-header">
                <div className="team-icon">💼</div>
                <div>
                  <h2>Sales Team Upload</h2>
                  <p>
                    Upload sales documents, proposals, contracts, and client
                    materials
                  </p>
                </div>
              </div>

              <div className="document-types">
                <h3>Document Types</h3>
                <div className="type-grid">
                  <div className="type-card">
                    <span className="type-icon">📋</span>
                    <span>Proposals</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">📑</span>
                    <span>Contracts</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">📊</span>
                    <span>Revenue Reports</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">👥</span>
                    <span>Client Analysis</span>
                  </div>
                </div>
              </div>

              <div className="upload-dropzone team-dropzone">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleSalesUpload(e.target.files)}
                  className="file-input"
                  id="sales-upload"
                />
                <label htmlFor="sales-upload" className="upload-label">
                  <div className="upload-icon">💼</div>
                  <div className="upload-text">
                    <strong>Upload Sales Documents</strong>
                  </div>
                  <div className="upload-hint">
                    Proposals, contracts, reports, and client materials
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'service':
        return (
          <div className="upload-tab-content">
            <div className="team-upload-section">
              <div className="team-header">
                <div className="team-icon">⚙️</div>
                <div>
                  <h2>Service Delivery Team Upload</h2>
                  <p>
                    Upload technical documentation, deployment guides, and
                    project materials
                  </p>
                </div>
              </div>

              <div className="document-types">
                <h3>Document Types</h3>
                <div className="type-grid">
                  <div className="type-card">
                    <span className="type-icon">📋</span>
                    <span>Technical Specs</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">🚀</span>
                    <span>Deployment Guides</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">📊</span>
                    <span>Service Reports</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">📁</span>
                    <span>Project Docs</span>
                  </div>
                </div>
              </div>

              <div className="upload-dropzone team-dropzone">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleServiceDeliveryUpload(e.target.files)}
                  className="file-input"
                  id="service-upload"
                />
                <label htmlFor="service-upload" className="upload-label">
                  <div className="upload-icon">⚙️</div>
                  <div className="upload-text">
                    <strong>Upload Service Documents</strong>
                  </div>
                  <div className="upload-hint">
                    Technical specs, guides, reports, and project documentation
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'hr':
        return (
          <div className="upload-tab-content">
            <div className="team-upload-section">
              <div className="team-header">
                <div className="team-icon">👥</div>
                <div>
                  <h2>Human Resources Upload</h2>
                  <p>
                    Upload HR policies, employee records, and compliance
                    documents
                  </p>
                </div>
              </div>

              <div className="document-types">
                <h3>Document Types</h3>
                <div className="type-grid">
                  <div className="type-card">
                    <span className="type-icon">📋</span>
                    <span>Policies</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">👤</span>
                    <span>Employee Records</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">✅</span>
                    <span>Compliance</span>
                  </div>
                  <div className="type-card">
                    <span className="type-icon">🎓</span>
                    <span>Training Materials</span>
                  </div>
                </div>
              </div>

              <div className="upload-dropzone team-dropzone">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleHRUpload(e.target.files)}
                  className="file-input"
                  id="hr-upload"
                />
                <label htmlFor="hr-upload" className="upload-label">
                  <div className="upload-icon">👥</div>
                  <div className="upload-text">
                    <strong>Upload HR Documents</strong>
                  </div>
                  <div className="upload-hint">
                    Policies, records, compliance, and training materials
                  </div>
                </label>
              </div>

              <div className="hr-notice">
                <div className="notice-icon">🔒</div>
                <div className="notice-content">
                  <strong>Privacy Notice:</strong> HR documents are processed
                  with enhanced security and compliance measures.
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="unified-upload">
      <div className="upload-header">
        <h1>Document Upload Center</h1>
        <p>Choose your team or use general upload for document processing</p>
      </div>

      <div className="upload-tabs">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <span className="tab-icon">📁</span>
          <span>General</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <span className="tab-icon">💼</span>
          <span>Sales</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'service' ? 'active' : ''}`}
          onClick={() => setActiveTab('service')}
        >
          <span className="tab-icon">⚙️</span>
          <span>Service</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
          onClick={() => setActiveTab('hr')}
        >
          <span className="tab-icon">👥</span>
          <span>HR</span>
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  )
}

export default UnifiedUpload
