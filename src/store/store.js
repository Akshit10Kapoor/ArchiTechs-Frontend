import { configureStore } from '@reduxjs/toolkit';
import projectsSlice from './slices/projectsSlice';
import analysisSlice from './slices/analysisSlice';

export const store = configureStore({
  reducer: {
    projects: projectsSlice,
    analysis: analysisSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});