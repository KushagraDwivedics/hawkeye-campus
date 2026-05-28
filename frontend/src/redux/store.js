import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import studentReducer from './studentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer
  }
});

export default store;
