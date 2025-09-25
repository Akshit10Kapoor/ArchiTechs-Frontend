import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analysisAPI, uploadAPI } from '../../services/api';

// Async thunks for analysis operations
export const uploadFiles = createAsyncThunk(
  'analysis/uploadFiles',
  async ({ projectId, files }, { rejectWithValue }) => {
    try {
      const response = await uploadAPI.uploadFiles(projectId, files);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload files');
    }
  }
);

export const generateFloorPlan = createAsyncThunk(
  'analysis/generateFloorPlan',
  async ({ projectId, description, additionalRequirements }, { rejectWithValue }) => {
    try {
      const response = await analysisAPI.generateFloorPlan(projectId, description, additionalRequirements);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate floor plan');
    }
  }
);

export const getAnalysisResults = createAsyncThunk(
  'analysis/getResults',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await analysisAPI.getResults(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get analysis results');
    }
  }
);

export const generateVariations = createAsyncThunk(
  'analysis/generateVariations',
  async ({ projectId, variations, stylePreferences }, { rejectWithValue }) => {
    try {
      const response = await analysisAPI.generateVariations(projectId, variations, stylePreferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate variations');
    }
  }
);

export const analyzeFiles = createAsyncThunk(
  'analysis/analyzeFiles',
  async ({ projectId, description, fileIds }, { rejectWithValue }) => {
    try {
      const response = await analysisAPI.analyzeFiles(projectId, description, fileIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze files');
    }
  }
);

const initialState = {
  // Upload state
  uploadLoading: false,
  uploadProgress: 0,
  uploadedFiles: [],
  uploadError: null,

  // Floor plan generation
  generateLoading: false,
  generateError: null,
  currentFloorPlan: null,

  // Analysis results
  analysisLoading: false,
  analysisError: null,
  analysisResults: null,

  // Variations
  variationsLoading: false,
  variationsError: null,
  floorPlanVariations: [],

  // File analysis
  fileAnalysisLoading: false,
  fileAnalysisError: null,
  fileAnalysisResults: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.uploadError = null;
      state.generateError = null;
      state.analysisError = null;
      state.variationsError = null;
      state.fileAnalysisError = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearAnalysisResults: (state) => {
      state.analysisResults = null;
      state.currentFloorPlan = null;
      state.floorPlanVariations = [];
      state.fileAnalysisResults = null;
    },
    resetUploadState: (state) => {
      state.uploadLoading = false;
      state.uploadProgress = 0;
      state.uploadedFiles = [];
      state.uploadError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload files
      .addCase(uploadFiles.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedFiles = action.payload.data.uploadedFiles || [];
        state.uploadProgress = 100;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
        state.uploadProgress = 0;
      })

      // Generate floor plan
      .addCase(generateFloorPlan.pending, (state) => {
        state.generateLoading = true;
        state.generateError = null;
      })
      .addCase(generateFloorPlan.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.currentFloorPlan = action.payload.data.floorPlan;
        state.analysisResults = action.payload.data;
      })
      .addCase(generateFloorPlan.rejected, (state, action) => {
        state.generateLoading = false;
        state.generateError = action.payload;
      })

      // Get analysis results
      .addCase(getAnalysisResults.pending, (state) => {
        state.analysisLoading = true;
        state.analysisError = null;
      })
      .addCase(getAnalysisResults.fulfilled, (state, action) => {
        state.analysisLoading = false;
        state.analysisResults = action.payload.data;
        state.currentFloorPlan = action.payload.data.floorPlan;
      })
      .addCase(getAnalysisResults.rejected, (state, action) => {
        state.analysisLoading = false;
        state.analysisError = action.payload;
      })

      // Generate variations
      .addCase(generateVariations.pending, (state) => {
        state.variationsLoading = true;
        state.variationsError = null;
      })
      .addCase(generateVariations.fulfilled, (state, action) => {
        state.variationsLoading = false;
        state.floorPlanVariations = action.payload.data.variations || [];
      })
      .addCase(generateVariations.rejected, (state, action) => {
        state.variationsLoading = false;
        state.variationsError = action.payload;
      })

      // Analyze files
      .addCase(analyzeFiles.pending, (state) => {
        state.fileAnalysisLoading = true;
        state.fileAnalysisError = null;
      })
      .addCase(analyzeFiles.fulfilled, (state, action) => {
        state.fileAnalysisLoading = false;
        state.fileAnalysisResults = action.payload.data.analysis;
      })
      .addCase(analyzeFiles.rejected, (state, action) => {
        state.fileAnalysisLoading = false;
        state.fileAnalysisError = action.payload;
      });
  },
});

export const {
  clearErrors,
  setUploadProgress,
  clearAnalysisResults,
  resetUploadState
} = analysisSlice.actions;

export default analysisSlice.reducer;