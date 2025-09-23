import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'
import { v4 as uuidv4 } from 'uuid'

const HRQuestions = () => {
  const navigate = useNavigate()
  const { addProcessedFiles } = useFiles()
  const [uploadData, setUploadData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const pendingUpload = sessionStorage.getItem('pendingUpload')
    if (pendingUpload) {
      const data = JSON.parse(pendingUpload)
      if (data.team === 'Human Resources') {
        setUploadData(data)
      } else {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const hrQuestions = [
    {
      id: 'document_category',
      question: 'What category do these HR documents belong to?',
      type: 'select',
      options: [
        'Employee Records & Personnel Files',
        'Policies & Procedures',
        'Recruitment & Hiring',
        'Performance Management',
        'Training & Development',
        'Benefits & Compensation',
        'Compliance & Legal',
        'Employee Relations',
      ],
      required: true,
    },
    {
      id: 'employee_scope',
      question: 'What is the scope of employees affected?',
      type: 'select',
      options: [
        'Individual Employee',
        'Specific Department',
        'Multiple Departments',
        'All Employees Company-wide',
        'New Hires Only',
        'Management Level Only',
        'Contract/Temporary Workers',
        'Not Employee-Specific',
      ],
      required: true,
    },
    {
      id: 'confidentiality_level',
      question: 'What is the confidentiality level of these documents?',
      type: 'select',
      options: [
        'Public - No restrictions',
        'Internal - Company employees only',
        'Confidential - Limited access required',
        'Highly Confidential - Senior management only',
        'Personal Data - Privacy protected',
      ],
      required: true,
    },
    {
      id: 'compliance_requirements',
      question: 'Are there specific compliance or regulatory requirements?',
      type: 'checkbox',
      options: [
        'GDPR (Data Privacy)',
        'HIPAA (Health Information)',
        'SOX (Financial Compliance)',
        'Equal Employment Opportunity',
        'Labor Law Compliance',
        'Industry-Specific Regulations',
        'Internal Audit Requirements',
        'No specific requirements',
      ],
      required: false,
    },
    {
      id: 'action_needed',
      question: 'What action is needed for these documents?',
      type: 'checkbox',
      options: [
        'Review and approval workflow',
        'Policy update notification',
        'Employee communication',
        'Data extraction and analysis',
        'Compliance verification',
        'Archive and retention',
        'Training material creation',
        'Performance tracking',
      ],
      required: true,
    },
    {
      id: 'urgency_timeline',
      question: 'What is the timeline for processing these documents?',
      type: 'select',
      options: [
        'Standard - Within 1 week',
        'Priority - Within 2-3 days',
        'Urgent - Within 24 hours',
        'Critical - Immediate processing required',
        'Scheduled - Specific date required',
      ],
      required: true,
    },
    {
      id: 'specific_date',
      question: 'If scheduled processing, what is the target date?',
      type: 'date',
      required: false,
      conditional: 'urgency_timeline',
      conditionalValue: 'Scheduled - Specific date required',
    },
    {
      id: 'stakeholder_approval',
      question: 'Who needs to approve or review these documents?',
      type: 'text',
      placeholder:
        'Enter names or roles (e.g., HR Director, Legal Team, Department Head)',
      required: false,
    },
    {
      id: 'special_instructions',
      question: 'Any special handling instructions or considerations?',
      type: 'textarea',
      placeholder:
        'Describe any special privacy requirements, notification needs, approval workflows, or other important considerations...',
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
    const current = hrQuestions[currentQuestion]
    if (current.required && !answers[current.id]) {
      alert('Please answer this required question before proceeding.')
      return
    }

    if (currentQuestion < hrQuestions.length - 1) {
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
      team: 'Human Resources',
      prompt: uploadData.prompt,
      clarifications: answers,
      uploadedAt: new Date(),
      tag: 'hr-document',
    }))

    addProcessedFiles(processedFiles)
    sessionStorage.removeItem('pendingUpload')
    navigate('/queue')
  }

  const renderQuestion = (question) => {
    // Check conditional rendering
    if (
      question.conditional &&
      answers[question.conditional] !== question.conditionalValue
    ) {
      return null
    }

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

      case 'date':
        return (
          <input
            type="date"
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

  // Filter questions based on conditional logic
  const visibleQuestions = hrQuestions.filter((q) => {
    if (!q.conditional) return true
    return answers[q.conditional] === q.conditionalValue
  })

  const currentQIndex = Math.min(currentQuestion, visibleQuestions.length - 1)
  const currentQ = visibleQuestions[currentQIndex]
  const progress = ((currentQIndex + 1) / visibleQuestions.length) * 100

  if (!currentQ) {
    return <div>Loading...</div>
  }

  return (
    <div className="questions-container">
      <div className="questions-header">
        <div className="team-badge hr">
          <span className="team-icon">👥</span>
          <div className="team-info">
            <h1>HR Document Clarification</h1>
            <p>Ensure proper compliance and privacy handling</p>
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
            Question {currentQIndex + 1} of {visibleQuestions.length}
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
          disabled={currentQIndex === 0}
        >
          ← Previous
        </button>

        <div className="question-dots">
          {visibleQuestions.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentQIndex ? 'active' : ''} ${
                answers[visibleQuestions[index].id] ? 'answered' : ''
              }`}
            />
          ))}
        </div>

        <button className="primary-btn" onClick={handleNext}>
          {currentQIndex === visibleQuestions.length - 1
            ? 'Submit & Upload'
            : 'Next →'}
        </button>
      </div>

      <div className="upload-summary">
        <h3>🔒 Upload Summary</h3>
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
        <div className="privacy-notice">
          <span className="privacy-icon">🔒</span>
          All HR documents are processed with enterprise-grade security and
          privacy protection.
        </div>
      </div>
    </div>
  )
}

export default HRQuestions
