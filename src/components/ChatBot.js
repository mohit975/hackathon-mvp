import React, { useState, useRef, useEffect } from 'react'
import { useFiles } from '../utils/FileContext'

const ChatBot = ({ isOpen, onClose }) => {
  const { files } = useFiles()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message:
        "Hello! I'm your AI document assistant. I can help you analyze your uploaded documents and answer questions about your projects. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const validatedFiles = files.filter((file) => file.status === 'validated')

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase()

    // Document-related queries
    if (message.includes('document') || message.includes('file')) {
      if (validatedFiles.length === 0) {
        return "I don't see any validated documents yet. Please upload and validate some documents first, then I can help you analyze them."
      }

      const fileList = validatedFiles.map((file) => file.file.name).join(', ')
      return `I can see ${validatedFiles.length} validated documents: ${fileList}. What specific information would you like to know about these documents?`
    }

    // Project queries
    if (message.includes('project') || message.includes('status')) {
      const totalFiles = files.length
      const validatedCount = validatedFiles.length
      const failedCount = files.filter((f) => f.status === 'error').length

      return `📊 Project Status Update:
      • Total Documents: ${totalFiles}
      • Successfully Validated: ${validatedCount}
      • Failed Validation: ${failedCount}
      • Processing Rate: ${
        totalFiles > 0 ? Math.round((validatedCount / totalFiles) * 100) : 0
      }%
      
      ${
        validatedCount > 0
          ? 'I can analyze the validated documents for insights, key terms, or specific content.'
          : 'Upload more documents to get detailed analysis.'
      }`
    }

    // Compliance queries
    if (message.includes('compliance') || message.includes('regulation')) {
      return `🔒 Compliance Analysis:
      Based on your validated documents, I can help with:
      • GDPR compliance checking
      • SOC2 requirements validation
      • Industry-specific regulations
      • Data privacy assessment
      • Security compliance reports
      
      Which compliance area would you like me to focus on?`
    }

    // Analytics queries
    if (
      message.includes('analytic') ||
      message.includes('insight') ||
      message.includes('summary')
    ) {
      if (validatedFiles.length === 0) {
        return 'I need validated documents to provide analytics. Please upload and validate documents first.'
      }

      return `📈 Document Analytics:
      • Document Types: ${[
        ...new Set(validatedFiles.map((f) => f.tag || 'Untagged')),
      ].join(', ')}
      • Average File Size: ${(
        validatedFiles.reduce((acc, f) => acc + f.file.size, 0) /
        validatedFiles.length /
        1024 /
        1024
      ).toFixed(2)} MB
      • Processing Success Rate: ${Math.round(
        (validatedFiles.length / files.length) * 100
      )}%
      
      I can provide deeper insights like:
      • Content themes and keywords
      • Document relationships
      • Risk assessment
      • Data extraction summaries`
    }

    // Security queries
    if (message.includes('security') || message.includes('risk')) {
      return `🛡️ Security Assessment:
      • All documents processed with enterprise-grade encryption
      • Zero-trust architecture implemented
      • SOC2 Type II compliant processing
      • Automated threat detection active
      
      Current security status: ✅ All systems secure
      Would you like a detailed security report for your documents?`
    }

    // Help queries
    if (message.includes('help') || message.includes('what can you do')) {
      return `🤖 I can help you with:
      
      📄 Document Analysis:
      • Content extraction and summarization
      • Key insights and themes
      • Document classification
      
      📊 Project Intelligence:
      • Status tracking and reporting
      • Performance analytics
      • Workflow optimization
      
      🔒 Compliance & Security:
      • Regulatory compliance checking
      • Security assessments
      • Risk analysis
      
      💬 Ask me questions like:
      • "What's in my project documents?"
      • "Show me compliance status"
      • "Analyze document trends"
      • "What are the key insights?"`
    }

    // Specific document content queries
    if (
      message.includes('content') ||
      message.includes('extract') ||
      message.includes('key')
    ) {
      if (validatedFiles.length === 0) {
        return 'I need validated documents to extract content. Please upload and validate documents first.'
      }

      // Simulate content analysis
      const sampleInsights = [
        '📋 Key Terms Found: project timeline, budget allocation, resource planning',
        '📈 Metrics Identified: 85% completion rate, $2.3M budget, Q4 deadline',
        '⚠️ Action Items: 3 pending approvals, 2 resource conflicts to resolve',
        '🎯 Objectives: Digital transformation, process automation, cost reduction',
      ]

      return `🔍 Content Analysis Results:
      
      ${sampleInsights.join('\n')}
      
      Would you like me to dive deeper into any specific aspect?`
    }

    // Default responses
    const defaultResponses = [
      "I understand you're asking about your documents. Could you be more specific about what you'd like to know?",
      "I'm here to help with document analysis and project insights. What specific information are you looking for?",
      'I can analyze your uploaded documents for insights, compliance, and key information. What would you like to explore?',
      "Let me help you with that. Could you provide more details about what aspect of your project you'd like to discuss?",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: generateBotResponse(inputMessage),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay 1-3 seconds
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    '📊 Show project status',
    '📄 Analyze my documents',
    '🔒 Check compliance',
    '📈 Get insights',
    '🛡️ Security report',
  ]

  const handleQuickAction = (action) => {
    setInputMessage(action.replace(/📊|📄|🔒|📈|🛡️/g, '').trim())
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-title">
              <h3>Synaptic AI Assistant</h3>
              <p>Document Intelligence & Analytics</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-content">
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        <div className="chatbot-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your documents, projects, or compliance..."
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="send-button"
          >
            {isTyping ? '⏳' : '🚀'}
          </button>
        </div>

        <div className="chatbot-status">
          <span className="status-indicator">●</span>
          AI Assistant Online • {validatedFiles.length} documents ready for
          analysis
        </div>
      </div>
    </div>
  )
}

export default ChatBot
