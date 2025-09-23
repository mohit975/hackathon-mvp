import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'
import { v4 as uuidv4 } from 'uuid'

const ServiceQuestions = () => {
  const navigate = useNavigate()
  const { addProcessedFiles } = useFiles()
  const [uploadData, setUploadData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const pendingUpload = sessionStorage.getItem('pendingUpload')
    if (pendingUpload) {
      const data = JSON.parse(pendingUpload)
      if (data.team === 'Service Delivery') {
        setUploadData(data)
      } else {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const serviceQuestions = [
    {
      id: 'project_name',
      question: 'What is the project name or identifier?',
      type: 'text',
      placeholder: 'Enter project name or code',
      required: true,
    },
    {
      id: 'project_phase',
      question: 'Which project phase are these documents related to?',
      type: 'select',
      options: [
        'Planning & Design',
        'Development',
        'Testing & QA',
        'Deployment',
        'Maintenance',
        'Documentation',
        'Project Closure',
      ],
      required: true,
    },
    {
      id: 'client_environment',
      question: 'What is the target environment or platform?',
      type: 'select',
      options: [
        'Web Application',
        'Mobile Application',
        'Desktop Application',
        'Cloud Infrastructure',
        'On-Premise Infrastructure',
        'API/Integration',
        'Database',
        'Multiple Platforms',
      ],
      required: false,
    },
    {
      id: 'technical_stack',
      question: 'What technology stack is involved?',
      type: 'checkbox',
      options: [
        'React/Angular/Vue.js',
        'Node.js/Express',
        'Python/Django/Flask',
        'Java/Spring',
        '.NET/C#',
        'PHP/Laravel',
        'AWS/Azure/GCP',
        'Docker/Kubernetes',
        'SQL/NoSQL Databases',
      ],
      required: false,
    },
    {
      id: 'deliverable_type',
      question: 'What type of deliverable do these documents represent?',
      type: 'select',
      options: [
        'Technical Requirements',
        'System Architecture',
        'Development Code',
        'Test Plans/Results',
        'Deployment Guide',
        'User Documentation',
        'API Documentation',
        'Change Request',
      ],
      required: true,
    },
    {
      id: 'priority_level',
      question: 'What is the priority level for processing?',
      type: 'select',
      options: [
        'Low - Standard processing',
        'Medium - Expedited processing',
        'High - Priority processing',
        'Critical - Immediate attention required',
      ],
      required: true,
    },
    {
      id: 'stakeholders',
      question: 'Who are the key stakeholders for this project?',
      type: 'text',
      placeholder:
        'Enter stakeholder names or roles (e.g., Project Manager, Tech Lead, Client)',
      required: false,
    },
    {
      id: 'additional_notes',
      question:
        'Any technical constraints, dependencies, or special considerations?',
      type: 'textarea',
      placeholder:
        'Describe any technical constraints, integration requirements, performance considerations, or other important details...',
      required: false,
    },
  ]

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    const current = serviceQuestions[currentQuestion]
    if (current.required && !answers[current.id]) {
      alert('Please answer this required question before proceeding.')
      return
    }

    if (currentQuestion < serviceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    if (!uploadData) return

    const batchId = uuidv4()
    const processedFiles = uploadData.files.map((file) => ({
      id: uuidv4(),
      file: file,
      status: 'scanning',
      progress: 0,
      batchId: batchId,
      team: 'Service Delivery',
      prompt: uploadData.prompt,
      clarifications: answers,
      uploadedAt: new Date(),
      tag: 'service-document',
    }))

    addProcessedFiles(processedFiles)
    sessionStorage.removeItem('pendingUpload')
    navigate('/queue')
  }

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="question-input"
          />
        )

      case 'select':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="question-select"
          >
            <option value="">Select an option...</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="question-checkboxes">
            {question.options.map((option, index) => (
              <label key={index} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = answers[question.id] || []
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...current, option])
                    } else {
                      handleAnswerChange(
                        question.id,
                        current.filter((item) => item !== option)
                      )
                    }
                  }}
                />
                <span className="checkbox-text">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="question-textarea"
            rows={4}
          />
        )

      default:
        return null
    }
  }

  if (!uploadData) {
    return <div>Loading...</div>
  }

  const currentQ = serviceQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / serviceQuestions.length) * 100

  return (
    <div className="questions-container">
      <div className="questions-header">
        <div className="team-badge service">
          <span className="team-icon">⚙️</span>
          <div className="team-info">
            <h1>Service Delivery Clarification</h1>
            <p>Help us understand your technical project details</p>
          </div>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {serviceQuestions.length}
          </span>
        </div>
      </div>

      <div className="question-card">
        <div className="question-header">
          <h2>
            {currentQ.required && <span className="required-asterisk">*</span>}
            {currentQ.question}
          </h2>
          {currentQ.required && <span className="required-text">Required</span>}
        </div>

        <div className="question-content">{renderQuestion(currentQ)}</div>
      </div>

      <div className="questions-actions">
        <button
          className="secondary-btn"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>

        <div className="question-dots">
          {serviceQuestions.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentQuestion ? 'active' : ''} ${
                answers[serviceQuestions[index].id] ? 'answered' : ''
              }`}
            />
          ))}
        </div>

        <button className="primary-btn" onClick={handleNext}>
          {currentQuestion === serviceQuestions.length - 1
            ? 'Submit & Upload'
            : 'Next →'}
        </button>
      </div>

      <div className="upload-summary">
        <h3>🔧 Upload Summary</h3>
        <div className="summary-details">
          <span>
            <strong>Team:</strong> {uploadData.team}
          </span>
          <span>
            <strong>Files:</strong> {uploadData.files.length} documents
          </span>
          <span>
            <strong>Context:</strong> {uploadData.prompt.substring(0, 100)}...
          </span>
        </div>
      </div>
    </div>
  )
}

export default ServiceQuestions
