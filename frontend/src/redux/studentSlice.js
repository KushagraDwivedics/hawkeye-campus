import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  student: null,
  dashboard: null,
  attendance: [],
  loading: false,
  error: null
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.type === 'dashboard') {
        state.dashboard = action.payload.data;
      } else if (action.payload.type === 'attendance') {
        state.attendance = action.payload.data;
      } else {
        state.student = action.payload.data;
      }
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { fetchStart, fetchSuccess, fetchFailure, clearError } = studentSlice.actions;
export default studentSlice.reducer;
