import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Projects API
export const projectsAPI = {
  // Get all projects
  getAllProjects: () => api.get('/projects'),

  // Get single project
  getProject: (projectId) => api.get(`/projects/${projectId}`),

  // Create new project
  createProject: (projectData) => api.post('/projects', projectData),

  // Update project
  updateProject: (projectId, projectData) => api.put(`/projects/${projectId}`, projectData),

  // Delete project
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),

  // Get project types
  getProjectTypes: () => api.get('/projects/config/types'),
};

// Upload API
export const uploadAPI = {
  // Upload files for a project
  uploadFiles: (projectId, files) => {
    const formData = new FormData();

    // Append all files
    files.forEach((file) => {
      formData.append('files', file);
    });

    return api.post(`/upload/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },

  // Get files for a project
  getProjectFiles: (projectId) => api.get(`/upload/${projectId}/files`),

  // Delete specific file
  deleteFile: (projectId, fileId) => api.delete(`/upload/${projectId}/files/${fileId}`),

  // Get supported file types
  getSupportedTypes: () => api.get('/upload/config/supported-types'),
};

// Analysis API
export const analysisAPI = {
  // Generate floor plan
  generateFloorPlan: (projectId, description, additionalRequirements = '') =>
    api.post(`/analysis/${projectId}/generate-floorplan`, {
      description,
      additionalRequirements,
    }),

  // Get analysis results
  getResults: (projectId) => api.get(`/analysis/${projectId}/results`),

  // Generate floor plan variations
  generateVariations: (projectId, variations = 3, stylePreferences = []) =>
    api.post(`/analysis/${projectId}/generate-variations`, {
      variations,
      stylePreferences,
    }),

  // Analyze specific files
  analyzeFiles: (projectId, description, fileIds = []) =>
    api.post(`/analysis/${projectId}/analyze-files`, {
      description,
      fileIds,
    }),
};

// Health check API
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  checkStatus: () => api.get('/status'),
};

// AI Search Service
export const aiSearchService = {
  // Initialize smart AI search with files and description
  initializeSearch: async (files, description, userId = 'anonymous') => {
    try {
      console.log('🔍 Initializing AI search with:', { files: files.length, description: description?.substring(0, 100) });

      // Create FormData for file uploads
      const formData = new FormData();

      // Add files to FormData
      files.forEach((fileObj, index) => {
        if (fileObj.file) {
          formData.append('files', fileObj.file);
        }
      });

      // Add description and user ID
      formData.append('description', description || '');
      formData.append('userId', userId);

      // Request multiple layout variations (2 different layouts)
      formData.append('generateMultipleLayouts', 'true');
      formData.append('layoutCount', '1');

      // Add support for non-standard spaces
      formData.append('allowNonStandardSpaces', 'true');
      formData.append('dynamicRoomGeneration', 'true');

      // Call the analysis API endpoint
      const response = await api.post('/analysis/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for AI processing
      });

      return {
        success: true,
        conversationId: response.data.conversationId || Date.now().toString(),
        analysis: response.data.analysis || null, // Direct mapping for floor plan data
        multipleAnalyses: response.data.multipleAnalyses || [response.data.analysis], // Array of multiple layouts
        documentData: {
          aiSummary: response.data.documentAnalysis || null
        },
        jennyResponse: {
          message: response.data.jennyResponse || 'I\'ve analyzed your requirements and generated multiple floor plan variations for you to choose from!'
        },
        searchMetadata: response.data.searchMetadata || null
      };

    } catch (error) {
      console.error('❌ AI Search Service Error:', error);

      // Handle different error scenarios
      if (error.code === 'ECONNABORTED') {
        throw new Error('Search request timed out. Please try again.');
      } else if (error.response?.status === 413) {
        throw new Error('Files are too large. Please reduce file sizes and try again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid search parameters. Please check your input.');
      } else if (error.response?.status === 503) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Search service encountered an error');
      }
    }
  },

  // Get search results by conversation ID
  getSearchResults: (conversationId) => api.get(`/analysis/search/${conversationId}`),

  // Continue conversation with follow-up questions
  continueConversation: (conversationId, message) =>
    api.post(`/analysis/search/${conversationId}/continue`, { message }),
};

export default api;