import React, { createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

const FileContext = createContext()

const initialState = {
  files: [],
  batches: [],
  workflows: [],
  currentBatch: null,
}

const fileReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FILES':
      const newFiles = action.payload.map((file) => ({
        id: uuidv4(),
        file,
        status: 'waiting',
        tag: '',
        uploadedAt: new Date(),
        metadata: {
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
        validationResults: null,
        statusHistory: [
          {
            status: 'waiting',
            timestamp: new Date(),
            message: 'File queued for upload',
          },
        ],
        batchId: state.currentBatch?.id || null,
      }))

      const updatedBatch = state.currentBatch
        ? {
            ...state.currentBatch,
            files: [...state.currentBatch.files, ...newFiles.map((f) => f.id)],
            totalFiles: state.currentBatch.totalFiles + newFiles.length,
          }
        : null

      return {
        ...state,
        files: [...state.files, ...newFiles],
        batches: updatedBatch
          ? state.batches.map((b) =>
              b.id === updatedBatch.id ? updatedBatch : b
            )
          : state.batches,
      }

    case 'ADD_PROCESSED_FILES':
      // Handle pre-processed files from team uploads
      const processedFiles = action.payload.map((fileObj) => ({
        ...fileObj,
        // Ensure all required properties exist
        id: fileObj.id || uuidv4(),
        uploadedAt: fileObj.uploadedAt || new Date(),
        metadata: fileObj.metadata || {
          size: fileObj.file?.size || 0,
          type: fileObj.file?.type || 'unknown',
          lastModified: fileObj.file?.lastModified || Date.now(),
        },
        statusHistory: fileObj.statusHistory || [
          {
            status: fileObj.status || 'waiting',
            timestamp: new Date(),
            message: 'File queued for processing',
          },
        ],
      }))

      return {
        ...state,
        files: [...state.files, ...processedFiles],
      }

    case 'CREATE_BATCH':
      const batchId = `HACK-2025-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`
      const newBatch = {
        id: batchId,
        createdAt: new Date(),
        status: 'active',
        files: [],
        totalFiles: 0,
        completedFiles: 0,
        metadata: action.payload.metadata || {},
      }

      return {
        ...state,
        batches: [...state.batches, newBatch],
        currentBatch: newBatch,
      }

    case 'UPDATE_FILE_STATUS':
      const updatedFiles = state.files.map((file) => {
        if (file.id === action.payload.id) {
          const newStatusEntry = {
            status: action.payload.status,
            timestamp: new Date(),
            message:
              action.payload.message ||
              `Status changed to ${action.payload.status}`,
          }

          return {
            ...file,
            status: action.payload.status,
            validationResults:
              action.payload.validationResults || file.validationResults,
            statusHistory: [...file.statusHistory, newStatusEntry],
          }
        }
        return file
      })

      // Update batch completion count
      const updatedBatches = state.batches.map((batch) => {
        const batchFiles = updatedFiles.filter((f) => f.batchId === batch.id)
        const completedFiles = batchFiles.filter(
          (f) => f.status === 'validated' || f.status === 'error'
        ).length

        return {
          ...batch,
          completedFiles,
          status: completedFiles === batch.totalFiles ? 'completed' : 'active',
        }
      })

      return {
        ...state,
        files: updatedFiles,
        batches: updatedBatches,
      }

    case 'REMOVE_FILE':
      const filteredFiles = state.files.filter(
        (file) => file.id !== action.payload.id
      )
      const updatedBatchesAfterRemoval = state.batches.map((batch) => ({
        ...batch,
        files: batch.files.filter((fId) => fId !== action.payload.id),
        totalFiles: batch.files.filter((fId) => fId !== action.payload.id)
          .length,
      }))

      return {
        ...state,
        files: filteredFiles,
        batches: updatedBatchesAfterRemoval,
      }

    case 'ADD_WORKFLOW':
      const workflow = {
        id: uuidv4(),
        name: action.payload.name,
        batchId: action.payload.batchId,
        fileId: action.payload.fileId,
        status: 'running',
        steps: action.payload.steps || ['scanning', 'processing', 'indexing'],
        currentStep: 0,
        createdAt: new Date(),
        logs: [],
        outputs: [],
      }

      return {
        ...state,
        workflows: [...state.workflows, workflow],
      }

    case 'UPDATE_WORKFLOW':
      return {
        ...state,
        workflows: state.workflows.map((workflow) =>
          workflow.id === action.payload.id
            ? { ...workflow, ...action.payload.updates }
            : workflow
        ),
      }

    case 'UPDATE_FILE_TAG':
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.payload.id
            ? { ...file, tag: action.payload.tag }
            : file
        ),
      }

    default:
      return state
  }
}

export const FileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(fileReducer, initialState)

  const addFiles = (files) => {
    dispatch({ type: 'ADD_FILES', payload: files })
  }

  const addProcessedFiles = (files) => {
    dispatch({ type: 'ADD_PROCESSED_FILES', payload: files })
  }

  const createBatch = (metadata = {}) => {
    dispatch({ type: 'CREATE_BATCH', payload: { metadata } })
  }

  const updateFileStatus = (id, status, message, validationResults) => {
    dispatch({
      type: 'UPDATE_FILE_STATUS',
      payload: { id, status, message, validationResults },
    })
  }

  const removeFile = (id) => {
    dispatch({ type: 'REMOVE_FILE', payload: { id } })
  }

  const addWorkflow = (name, batchId, fileId, steps) => {
    dispatch({
      type: 'ADD_WORKFLOW',
      payload: { name, batchId, fileId, steps },
    })
  }

  const updateWorkflow = (id, updates) => {
    dispatch({ type: 'UPDATE_WORKFLOW', payload: { id, updates } })
  }

  const updateFileTag = (id, tag) => {
    dispatch({ type: 'UPDATE_FILE_TAG', payload: { id, tag } })
  }

  const value = {
    ...state,
    addFiles,
    addProcessedFiles,
    createBatch,
    updateFileStatus,
    removeFile,
    addWorkflow,
    updateWorkflow,
    updateFileTag,
  }

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>
}

export const useFiles = () => {
  const context = useContext(FileContext)
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider')
  }
  return context
}
