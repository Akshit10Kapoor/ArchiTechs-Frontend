import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsAPI } from '../../services/api';

// Async thunks for API calls
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.getAllProjects();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.createProject(projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.updateProject(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await projectsAPI.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

export const fetchProjectTypes = createAsyncThunk(
  'projects/fetchProjectTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectsAPI.getProjectTypes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project types');
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  projectTypes: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    // Update project in the list when modified
    updateProjectInList: (state, action) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data || [];
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create project
      .addCase(createProject.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createLoading = false;
        state.projects.unshift(action.payload.data);
        state.currentProject = action.payload.data;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.data.id);
        if (index !== -1) {
          state.projects[index] = action.payload.data;
        }
        if (state.currentProject?.id === action.payload.data.id) {
          state.currentProject = action.payload.data;
        }
      })

      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })

      // Fetch project types
      .addCase(fetchProjectTypes.fulfilled, (state, action) => {
        state.projectTypes = action.payload.data || [];
      });
  },
});

export const {
  clearError,
  setCurrentProject,
  clearCurrentProject,
  updateProjectInList
} = projectsSlice.actions;

export default projectsSlice.reducer;