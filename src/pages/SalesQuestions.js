import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFiles } from '../utils/FileContext'
import { v4 as uuidv4 } from 'uuid'

const SalesQuestions = () => {
  const navigate = useNavigate()
  const { addProcessedFiles } = useFiles()
  const [uploadData, setUploadData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const pendingUpload = sessionStorage.getItem('pendingUpload')
    if (pendingUpload) {
      const data = JSON.parse(pendingUpload)
      if (data.team === 'Sales') {
        setUploadData(data)
      } else {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const salesQuestions = [
    {
      id: 'client_info',
      question: 'Which client or prospect are these documents related to?',
      type: 'text',
      placeholder: 'Enter client/prospect name or "Multiple clients"',
      required: true,
    },
    {
      id: 'deal_stage',
      question: 'What stage is this deal/opportunity in?',
      type: 'select',
      options: [
        'Lead Generation',
        'Qualification',
        'Proposal/Quote',
        'Negotiation',
        'Closed-Won',
        'Closed-Lost',
        'Follow-up',
      ],
      required: true,
    },
    {
      id: 'deal_value',
      question: 'What is the estimated/actual deal value?',
      type: 'select',
      options: [
        'Under $10K',
        '$10K - $50K',
        '$50K - $100K',
        '$100K - $500K',
        '$500K - $1M',
        'Over $1M',
        'Not Applicable',
      ],
      required: false,
    },
    {
      id: 'urgency',
      question: 'What is the urgency level for processing these documents?',
      type: 'select',
      options: [
        'Low - Process within a week',
        'Medium - Process within 2-3 days',
        'High - Process within 24 hours',
        'Critical - Process immediately',
      ],
      required: true,
    },
    {
      id: 'action_required',
      question: 'What specific action do you need from the document analysis?',
      type: 'checkbox',
      options: [
        'Extract key terms and conditions',
        'Identify pricing information',
        'Summarize proposal details',
        'Flag compliance issues',
        'Create executive summary',
        'Compare with previous proposals',
      ],
      required: true,
    },
    {
      id: 'additional_context',
      question: 'Any additional context or special instructions?',
      type: 'textarea',
      placeholder:
        'Provide any other relevant information that would help in processing these documents...',
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
    const current = salesQuestions[currentQuestion]
    if (current.required && !answers[current.id]) {
      alert('Please answer this required question before proceeding.')
      return
    }

    if (currentQuestion < salesQuestions.length - 1) {
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
      team: 'Sales',
      prompt: uploadData.prompt,
      clarifications: answers,
      uploadedAt: new Date(),
      tag: 'sales-document',
    }))

    // Add files to context
    addProcessedFiles(processedFiles)

    // Clear session storage
    sessionStorage.removeItem('pendingUpload')

    // Navigate to queue
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

  const currentQ = salesQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / salesQuestions.length) * 100

  return (
    <div className="questions-container">
      <div className="questions-header">
        <div className="team-badge sales">
          <span className="team-icon">💼</span>
          <div className="team-info">
            <h1>Sales Document Clarification</h1>
            <p>Help us understand your sales documents better</p>
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
            Question {currentQuestion + 1} of {salesQuestions.length}
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
          {salesQuestions.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentQuestion ? 'active' : ''} ${
                answers[salesQuestions[index].id] ? 'answered' : ''
              }`}
            />
          ))}
        </div>

        <button className="primary-btn" onClick={handleNext}>
          {currentQuestion === salesQuestions.length - 1
            ? 'Submit & Upload'
            : 'Next →'}
        </button>
      </div>

      {/* Summary of upload */}
      <div className="upload-summary">
        <h3>📋 Upload Summary</h3>
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

export default SalesQuestions
